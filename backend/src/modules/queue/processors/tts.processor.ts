import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { TTS_QUEUE } from '../queue.constants';
import { TtsJobData } from '../queue.service';
import { JobService } from '../job.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { StorageService } from '../../../storage/storage.service';
import { ElevenLabsProvider } from '../../../ai-providers/elevenlabs/elevenlabs.provider';
import { ConfigService } from '@nestjs/config';

@Processor(TTS_QUEUE, {
  concurrency: 3, // Process 3 jobs simultaneously
})
export class TtsProcessor extends WorkerHost {
  private readonly logger = new Logger(TtsProcessor.name);
  private aiProvider: ElevenLabsProvider;

  constructor(
    private prisma: PrismaService,
    private jobService: JobService,
    private storageService: StorageService,
    private configService: ConfigService,
  ) {
    super();
    this.aiProvider = new ElevenLabsProvider(configService);
  }

  async process(job: Job<TtsJobData>): Promise<any> {
    const { jobId, userId, generationId, voiceId, externalVoiceId, text, language, characterCount, creditsReserved } = job.data;
    
    this.logger.log(`Processing TTS job ${jobId} for user ${userId}`);

    try {
      // Update job status to PROCESSING
      await this.jobService.updateJobStatus(jobId, 'PROCESSING');
      await this.jobService.updateProgress(jobId, 10, 'Starting audio generation...');

      // Generate speech using AI provider
      await this.jobService.updateProgress(jobId, 30, 'Generating speech with AI...');
      const audioBuffer = await this.aiProvider.generateSpeech(
        externalVoiceId,
        text,
        language,
      );

      await this.jobService.updateProgress(jobId, 60, 'Uploading audio file...');

      // Save audio file
      const filename = `generations/${userId}/${generationId}.mp3`;
      const audioUrl = await this.storageService.uploadAudio(
        audioBuffer,
        filename,
      );

      // Calculate duration (approximate: 150 words per minute, ~5 chars per word)
      const estimatedDuration = (characterCount / 5) / 150 * 60;

      await this.jobService.updateProgress(jobId, 80, 'Finalizing...');

      // Update generation record
      await this.prisma.generation.update({
        where: { id: generationId },
        data: {
          status: 'COMPLETED',
          audioUrl,
          duration: estimatedDuration,
        },
      });

      // Deduct credits (credits were already reserved)
      await this.prisma.credit.update({
        where: { userId },
        data: {
          usedCredits: { increment: creditsReserved },
        },
      });

      // Create usage record
      await this.prisma.usageRecord.create({
        data: {
          userId,
          type: 'TTS_GENERATION',
          creditsUsed: creditsReserved,
          description: `Generated ${characterCount} characters of speech`,
          referenceId: generationId,
        },
      });

      // Mark job as completed
      await this.jobService.updateJobStatus(jobId, 'COMPLETED', {
        progress: 100,
        result: {
          audioUrl,
          duration: estimatedDuration,
          characterCount,
          creditsCost: creditsReserved,
        },
      });

      this.logger.log(`TTS job ${jobId} completed successfully`);

      return {
        success: true,
        audioUrl,
        duration: estimatedDuration,
      };

    } catch (error) {
      this.logger.error(`TTS job ${jobId} failed:`, error.message);

      // Mark generation as failed
      await this.prisma.generation.update({
        where: { id: generationId },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
        },
      });

      // Refund reserved credits (remove reservation)
      // Credits weren't actually deducted yet, so just mark job as failed

      await this.jobService.updateJobStatus(jobId, 'FAILED', {
        errorMessage: error.message,
      });

      throw error;
    }
  }

  @OnWorkerEvent('active')
  onActive(job: Job<TtsJobData>) {
    this.logger.debug(`Job ${job.id} is now active`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<TtsJobData>) {
    this.logger.log(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<TtsJobData>, error: Error) {
    this.logger.error(`Job ${job.id} failed with error: ${error.message}`);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job<TtsJobData>, progress: number) {
    this.logger.debug(`Job ${job.id} progress: ${progress}%`);
  }
}
