import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { TTS_QUEUE, VOICE_CLONE_QUEUE } from './queue.constants';
import { JobService } from './job.service';

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

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(TTS_QUEUE) private ttsQueue: Queue<TtsJobData>,
    @InjectQueue(VOICE_CLONE_QUEUE) private voiceCloneQueue: Queue<VoiceCloneJobData>,
    private jobService: JobService,
  ) {}

  /**
   * Add a TTS generation job to the queue
   */
  async addTtsJob(data: TtsJobData, priority: number = 0): Promise<Job<TtsJobData>> {
    this.logger.log(`Adding TTS job to queue: ${data.jobId}`);
    
    const job = await this.ttsQueue.add('generate', data, {
      jobId: data.jobId,
      priority,
      attempts: 3,
    });

    return job;
  }

  /**
   * Add a voice cloning job to the queue
   */
  async addVoiceCloneJob(data: VoiceCloneJobData, priority: number = 0): Promise<Job<VoiceCloneJobData>> {
    this.logger.log(`Adding Voice Clone job to queue: ${data.jobId}`);
    
    const job = await this.voiceCloneQueue.add('clone', data, {
      jobId: data.jobId,
      priority,
      attempts: 2,
    });

    return job;
  }

  /**
   * Get TTS queue status
   */
  async getTtsQueueStatus() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.ttsQueue.getWaitingCount(),
      this.ttsQueue.getActiveCount(),
      this.ttsQueue.getCompletedCount(),
      this.ttsQueue.getFailedCount(),
    ]);

    return { waiting, active, completed, failed };
  }

  /**
   * Get a specific job from TTS queue
   */
  async getTtsJob(jobId: string): Promise<Job<TtsJobData> | undefined> {
    return this.ttsQueue.getJob(jobId);
  }

  /**
   * Cancel a TTS job
   */
  async cancelTtsJob(jobId: string): Promise<boolean> {
    const job = await this.ttsQueue.getJob(jobId);
    if (job) {
      const state = await job.getState();
      if (state === 'waiting' || state === 'delayed') {
        await job.remove();
        await this.jobService.updateJobStatus(jobId, 'CANCELLED');
        return true;
      }
    }
    return false;
  }

  /**
   * Get job position in queue
   */
  async getJobPosition(jobId: string): Promise<number> {
    const jobs = await this.ttsQueue.getJobs(['waiting', 'delayed']);
    const index = jobs.findIndex(j => j.id === jobId);
    return index >= 0 ? index + 1 : 0;
  }

  /**
   * Pause all queues (for maintenance)
   */
  async pauseQueues(): Promise<void> {
    await Promise.all([
      this.ttsQueue.pause(),
      this.voiceCloneQueue.pause(),
    ]);
    this.logger.warn('All queues paused');
  }

  /**
   * Resume all queues
   */
  async resumeQueues(): Promise<void> {
    await Promise.all([
      this.ttsQueue.resume(),
      this.voiceCloneQueue.resume(),
    ]);
    this.logger.log('All queues resumed');
  }
}
