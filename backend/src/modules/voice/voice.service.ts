import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AIProviderFactory } from '../../ai-providers';
import { StorageService } from '../../storage/storage.service';
import { CloneVoiceDto } from './dto';

@Injectable()
export class VoiceService {
  constructor(
    private prisma: PrismaService,
    private aiProviderFactory: AIProviderFactory,
    private storageService: StorageService,
  ) {}

  async cloneVoice(
    userId: string,
    cloneVoiceDto: CloneVoiceDto,
    files: Express.Multer.File[],
  ) {
    const { name, description, consentGiven } = cloneVoiceDto;

    // Validate consent
    if (!consentGiven) {
      throw new BadRequestException(
        'Voice consent is required to clone a voice',
      );
    }

    // Validate files (2-5 samples required)
    if (!files || files.length < 2) {
      throw new BadRequestException('At least 2 audio samples are required');
    }

    if (files.length > 5) {
      throw new BadRequestException('Maximum 5 audio samples allowed');
    }

    // Validate file types
    const validMimeTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/x-wav',
      'audio/m4a',
      'audio/x-m4a',
    ];
    for (const file of files) {
      if (!validMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `Invalid file type: ${file.originalname}. Only MP3, WAV, and M4A files are allowed.`,
        );
      }
    }

    // Check user's voice clone limit
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: { include: { plan: true } },
        voices: { where: { status: { not: 'DELETED' } } },
      },
    });

    if (!user || !user.subscription) {
      throw new BadRequestException('User subscription not found');
    }

    const maxVoices = user.subscription.plan.maxVoiceClones;
    if (maxVoices !== -1 && user.voices.length >= maxVoices) {
      throw new ForbiddenException(
        `Voice clone limit reached. Your plan allows ${maxVoices} voices.`,
      );
    }

    // Upload samples to storage
    const sampleUrls: string[] = [];
    for (const file of files) {
      const url = await this.storageService.uploadAudio(
        file.buffer,
        `voices/${userId}/${Date.now()}_${file.originalname}`,
      );
      sampleUrls.push(url);
    }

    // Create voice record with PROCESSING status
    const voice = await this.prisma.voice.create({
      data: {
        userId,
        name,
        description,
        externalVoiceId: '',
        provider: 'ELEVENLABS',
        sampleUrls: JSON.stringify(sampleUrls),
        status: 'PROCESSING',
        consentGiven: true,
        consentDate: new Date(),
      },
    });

    try {
      // Send to AI provider
      const aiProvider = this.aiProviderFactory.getDefaultProvider();
      const buffers = files.map((file) => file.buffer);
      const externalVoiceId = await aiProvider.cloneVoice(
        name,
        description || '',
        buffers,
      );

      // Update voice with external ID and READY status
      const updatedVoice = await this.prisma.voice.update({
        where: { id: voice.id },
        data: {
          externalVoiceId,
          status: 'READY',
        },
      });

      // Log usage
      await this.prisma.usageRecord.create({
        data: {
          userId,
          type: 'VOICE_CLONE',
          creditsUsed: 0,
          description: `Cloned voice: ${name}`,
          referenceId: voice.id,
        },
      });

      return updatedVoice;
    } catch (error) {
      // Update voice status to FAILED
      await this.prisma.voice.update({
        where: { id: voice.id },
        data: {
          status: 'FAILED',
          metadata: JSON.stringify({ error: (error as Error).message }),
        },
      });

      throw error;
    }
  }

  async getUserVoices(userId: string) {
    return this.prisma.voice.findMany({
      where: {
        userId,
        status: { not: 'DELETED' },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getVoiceById(userId: string, voiceId: string) {
    const voice = await this.prisma.voice.findFirst({
      where: {
        id: voiceId,
        userId,
        status: { not: 'DELETED' },
      },
    });

    if (!voice) {
      throw new NotFoundException('Voice not found');
    }

    return voice;
  }

  async deleteVoice(userId: string, voiceId: string) {
    const voice = await this.getVoiceById(userId, voiceId);

    try {
      // Delete from AI provider
      if (voice.externalVoiceId) {
        const aiProvider = this.aiProviderFactory.getDefaultProvider();
        await aiProvider.deleteVoice(voice.externalVoiceId);
      }
    } catch (error) {
      // Log error but continue with soft delete
      console.error('Failed to delete voice from provider:', error.message);
    }

    // Soft delete
    await this.prisma.voice.update({
      where: { id: voiceId },
      data: { status: 'DELETED' },
    });

    // Cleanup storage (optional - could be done in background job)
    for (const url of voice.sampleUrls) {
      try {
        await this.storageService.deleteFile(url);
      } catch (error) {
        console.error('Failed to delete sample file:', error.message);
      }
    }

    return { message: 'Voice deleted successfully' };
  }
}
