import {
  Injectable,
  BadRequestException,
  NotFoundException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AIProviderFactory } from '../../ai-providers';
import { StorageService } from '../../storage/storage.service';
import { TtsJobData } from '../queue/queue.module';
import { JobService } from '../queue/job.service';
import { GenerateSpeechDto } from './dto';
import { v4 as uuidv4 } from 'uuid';

// Define the queue service interface
interface IQueueService {
  addTtsJob(data: TtsJobData): Promise<any>;
  addVoiceCloneJob(data: any): Promise<any>;
  getTtsQueueStatus(): Promise<any>;
  getTtsJob(jobId: string): Promise<any>;
  cancelTtsJob(jobId: string): Promise<boolean>;
}

@Injectable()
export class TtsService {
  constructor(
    private prisma: PrismaService,
    private aiProviderFactory: AIProviderFactory,
    private storageService: StorageService,
    @Inject('QueueService') private queueService: IQueueService,
    private jobService: JobService,
  ) {}

  async generateSpeech(userId: string, generateSpeechDto: GenerateSpeechDto) {
    const { voiceId, text, language, format } = generateSpeechDto;

    // Validate voice ownership
    let voice;

    // Check for Preset Voices (System Voices)
    if (voiceId.startsWith('pre_')) {
      const PRESETS = {
        pre_rachel: '21m00Tcm4TlvDq8ikWAM',
        pre_drew: '29vD33N1CtxCmqQRPOHJ',
        pre_clyde: '2EiwWnXFnvU5JabPnv8n',
        pre_mimi: 'zrHiDhphv9ZnVXBqCLjz',
      };

      if (PRESETS[voiceId]) {
        voice = {
          id: voiceId,
          name: 'System Voice',
          externalVoiceId: PRESETS[voiceId],
          provider: 'ELEVENLABS',
          status: 'READY',
        };
      } else {
        throw new NotFoundException('Invalid system voice ID');
      }
    } else {
      // Validate user voice ownership
      voice = await this.prisma.voice.findFirst({
        where: {
          id: voiceId,
          userId,
          status: 'READY',
        },
      });
    }

    if (!voice) {
      throw new NotFoundException(
        'Voice not found or not ready for generation',
      );
    }

    // Calculate character count (excluding whitespace for billing)
    const characterCount = text.replace(/\s/g, '').length;

    // Get user credits
    const credits = await this.prisma.credit.findUnique({
      where: { userId },
    });

    if (!credits) {
      throw new HttpException(
        'Credits not found for user',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    const availableCredits =
      credits.totalCredits - credits.usedCredits + credits.bonusCredits;

    if (availableCredits < characterCount) {
      throw new HttpException(
        `Insufficient credits. Required: ${characterCount}, Available: ${availableCredits}`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    const aiProvider = this.aiProviderFactory.getDefaultProvider();

    // Validate language
    const supportedLanguages = aiProvider.getSupportedLanguages();
    if (language && !supportedLanguages.includes(language)) {
      throw new BadRequestException(
        `Language '${language}' is not supported. Supported: ${supportedLanguages.join(', ')}`,
      );
    }

    // Check daily generation limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyCount = await this.prisma.generation.count({
      where: {
        userId,
        createdAt: { gte: today },
      },
    });

    const DAILY_LIMIT = 50; // Hard cap per request requirement
    if (dailyCount >= DAILY_LIMIT) {
      throw new HttpException(
        `Daily generation limit of ${DAILY_LIMIT} reached`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Create generation record
    const generation = await this.prisma.generation.create({
      data: {
        userId,
        voiceId,
        text,
        characterCount,
        language: language || 'en',
        format: format || 'MP3',
        status: 'PROCESSING',
        creditsCost: characterCount,
      },
    });

    try {
      // Generate speech via AI provider
      const aiProvider = this.aiProviderFactory.getDefaultProvider();
      const audioBuffer = await aiProvider.generateSpeech(
        voice.externalVoiceId,
        text,
        language || 'en',
      );

      // Calculate duration (approximate: 150 words per minute, 5 chars per word)
      const estimatedDuration = (characterCount / 5 / 150) * 60;

      // Upload to storage
      const audioUrl = await this.storageService.uploadAudio(
        audioBuffer,
        `generations/${userId}/${generation.id}.mp3`,
      );

      // Update generation record
      const updatedGeneration = await this.prisma.generation.update({
        where: { id: generation.id },
        data: {
          audioUrl,
          status: 'COMPLETED',
          duration: estimatedDuration,
        },
      });

      // Deduct credits
      await this.deductCredits(userId, characterCount, credits);

      // Log usage
      await this.prisma.usageRecord.create({
        data: {
          userId,
          type: 'TTS_GENERATION',
          creditsUsed: characterCount,
          description: `Generated ${characterCount} characters using voice: ${voice.name}`,
          referenceId: generation.id,
        },
      });

      return {
        id: updatedGeneration.id,
        audioUrl: updatedGeneration.audioUrl,
        characterCount,
        duration: estimatedDuration,
        creditsCost: characterCount,
        remainingCredits: availableCredits - characterCount,
      };
    } catch (error) {
      // Update generation status to FAILED
      await this.prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
        },
      });

      throw error;
    }
  }

  /**
   * Async TTS generation - queues job for background processing
   */
  async generateSpeechAsync(userId: string, generateSpeechDto: GenerateSpeechDto) {
    const { voiceId, text, language, format } = generateSpeechDto;

    // Validate voice ownership
    let voice;
    let externalVoiceId: string;

    // Check for Preset Voices (System Voices)
    if (voiceId.startsWith('pre_')) {
      const PRESETS = {
        pre_rachel: '21m00Tcm4TlvDq8ikWAM',
        pre_drew: '29vD33N1CtxCmqQRPOHJ',
        pre_clyde: '2EiwWnXFnvU5JabPnv8n',
        pre_mimi: 'zrHiDhphv9ZnVXBqCLjz',
      };

      if (PRESETS[voiceId]) {
        voice = {
          id: voiceId,
          name: 'System Voice',
          externalVoiceId: PRESETS[voiceId],
          provider: 'ELEVENLABS',
          status: 'READY',
        };
        externalVoiceId = PRESETS[voiceId];
      } else {
        throw new NotFoundException('Invalid system voice ID');
      }
    } else {
      // Validate user voice ownership
      voice = await this.prisma.voice.findFirst({
        where: {
          id: voiceId,
          userId,
          status: 'READY',
        },
      });

      if (!voice) {
        throw new NotFoundException('Voice not found or not ready for generation');
      }
      externalVoiceId = voice.externalVoiceId;
    }

    // Calculate character count (excluding whitespace for billing)
    const characterCount = text.replace(/\s/g, '').length;

    // Get user credits
    const credits = await this.prisma.credit.findUnique({
      where: { userId },
    });

    if (!credits) {
      throw new HttpException('Credits not found for user', HttpStatus.PAYMENT_REQUIRED);
    }

    const availableCredits = credits.totalCredits - credits.usedCredits + credits.bonusCredits;

    if (availableCredits < characterCount) {
      throw new HttpException(
        `Insufficient credits. Required: ${characterCount}, Available: ${availableCredits}`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    // Check daily generation limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyCount = await this.prisma.generation.count({
      where: {
        userId,
        createdAt: { gte: today },
      },
    });

    const DAILY_LIMIT = 50;
    if (dailyCount >= DAILY_LIMIT) {
      throw new HttpException(
        `Daily generation limit of ${DAILY_LIMIT} reached`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Create generation record (PENDING status)
    const generation = await this.prisma.generation.create({
      data: {
        userId,
        voiceId,
        text,
        characterCount,
        language: language || 'en',
        format: format || 'MP3',
        status: 'PROCESSING',
        creditsCost: characterCount,
      },
    });

    // Create job record
    const job = await this.jobService.createJob({
      userId,
      type: 'TTS_GENERATION',
      payload: {
        voiceId,
        externalVoiceId,
        text,
        language: language || 'en',
        characterCount,
      },
      generationId: generation.id,
      creditsReserved: characterCount,
    });

    // Add to queue
    const jobData: TtsJobData = {
      jobId: job.id,
      userId,
      generationId: generation.id,
      voiceId,
      externalVoiceId,
      text,
      language: language || 'en',
      characterCount,
      creditsReserved: characterCount,
    };

    await this.queueService.addTtsJob(jobData);

    return {
      jobId: job.id,
      generationId: generation.id,
      status: 'QUEUED',
      characterCount,
      creditsReserved: characterCount,
      estimatedCreditsRemaining: availableCredits - characterCount,
      message: 'Your audio is being generated. Use the job ID to track progress.',
    };
  }

  async getGenerationHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [generations, total] = await Promise.all([
      this.prisma.generation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          voice: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.generation.count({ where: { userId } }),
    ]);

    return {
      data: generations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getGenerationById(userId: string, generationId: string) {
    const generation = await this.prisma.generation.findFirst({
      where: { id: generationId, userId },
      include: {
        voice: {
          select: { id: true, name: true },
        },
      },
    });

    if (!generation) {
      throw new NotFoundException('Generation not found');
    }

    return generation;
  }

  private async deductCredits(
    userId: string,
    amount: number,
    currentCredits: any,
  ) {
    const bonusDeduct = Math.min(amount, currentCredits.bonusCredits);
    const regularDeduct = amount - bonusDeduct;

    await this.prisma.credit.update({
      where: { userId },
      data: {
        bonusCredits: currentCredits.bonusCredits - bonusDeduct,
        usedCredits: currentCredits.usedCredits + regularDeduct,
      },
    });
  }
  async generateStream(text: string, voiceId: string | 'sarah') {
    const aiProvider = this.aiProviderFactory.getDefaultProvider();

    // Use external ID mapping or default
    // In real app, fetch external ID for 'sarah'. For now assuming 'sarah' is valid or mapped inside provider
    // Quick hack: if voiceId is 'sarah', use valid ElevenLabs ID or mock

    // This is a direct stream pass-through
    // Mocking 'buffer' to stream conversion

    // Validate text length again just in case
    if (text.length > 500) throw new BadRequestException('Text too long');

    try {
      // Check if voiceId is one of our demo IDs, map to real ID
      let externalId = voiceId;
      if (voiceId === 'sarah') externalId = '21m00Tcm4TlvDq8ikWAM'; // Rachel (ElevenLabs default)
      if (voiceId === 'ahmed') externalId = 'TxGEqnHWrfWFTfGW9XjX'; // Josh (Deep voice)
      if (voiceId === 'sofia') externalId = 'AZnzlk1XvdvUeBnXmlld'; // Domi

      const audioBuffer = await aiProvider.generateSpeech(
        externalId,
        text,
        'en',
      );

      // Convert Buffer to Readable Stream
      const { Readable } = require('stream');
      const stream = new Readable();
      stream.push(audioBuffer);
      stream.push(null);

      return stream;
    } catch (error) {
      console.error('Demo Stream Error:', error);
      throw new BadRequestException('AI Generation failed');
    }
  }
}
