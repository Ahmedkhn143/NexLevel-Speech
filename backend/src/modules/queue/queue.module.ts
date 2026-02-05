import { Module, Global, Logger } from '@nestjs/common';
import { JobService } from './job.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { StorageModule } from '../../storage/storage.module';

// Export the interfaces for type compatibility
export interface TtsJobData {
  jobId: string;
  userId: string;
  generationId: string;
  voiceId: string;
  externalVoiceId: string;
  text: string;
  language: string;
  characterCount: number;
  creditsReserved: number;
}

export interface VoiceCloneJobData {
  jobId: string;
  userId: string;
  voiceId: string;
  name: string;
  sampleUrls: string[];
}

/**
 * Mock Queue Service for development without Redis
 * In production, uncomment the BullMQ configuration and use the real QueueService
 */
@Global()
@Module({
  imports: [PrismaModule, StorageModule],
  providers: [
    {
      provide: 'QueueService',
      useFactory: () => {
        const logger = new Logger('MockQueueService');
        logger.warn('Queue running in SYNC mode - Redis not required for development');
        logger.warn('Async TTS generation will not be available');
        
        return {
          async addTtsJob(data: TtsJobData): Promise<any> {
            logger.log(`[SYNC MODE] TTS job skipped: ${data.jobId} - use sync endpoint`);
            return { id: data.jobId, data };
          },
          async addVoiceCloneJob(data: VoiceCloneJobData): Promise<any> {
            logger.log(`[SYNC MODE] Voice clone job skipped: ${data.jobId}`);
            return { id: data.jobId, data };
          },
          async getTtsQueueStatus() {
            return { waiting: 0, active: 0, completed: 0, failed: 0 };
          },
          async getTtsJob(jobId: string): Promise<any> {
            return undefined;
          },
          async cancelTtsJob(jobId: string): Promise<boolean> {
            return false;
          },
        };
      },
    },
    JobService,
  ],
  exports: ['QueueService', JobService],
})
export class QueueModule {}
