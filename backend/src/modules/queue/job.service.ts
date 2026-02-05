import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type JobStatus = 'PENDING' | 'RESERVED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type JobType = 'TTS_GENERATION' | 'VOICE_CLONE';

export interface CreateJobDto {
  userId: string;
  type: JobType;
  payload: Record<string, any>;
  generationId?: string;
  creditsReserved?: number;
  priority?: number;
}

export interface JobProgressEvent {
  jobId: string;
  userId: string;
  progress: number;
  status: JobStatus;
  message?: string;
}

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);
  
  // In-memory event emitters for SSE connections
  private progressEmitters = new Map<string, Set<(event: JobProgressEvent) => void>>();

  constructor(
    private prisma: PrismaService,
  ) {}

  /**
   * Create a new job record
   */
  async createJob(data: CreateJobDto) {
    const job = await this.prisma.job.create({
      data: {
        userId: data.userId,
        type: data.type,
        status: 'PENDING',
        payload: JSON.stringify(data.payload),
        generationId: data.generationId,
        creditsReserved: data.creditsReserved || 0,
        priority: data.priority || 0,
      },
    });

    this.logger.log(`Created job ${job.id} for user ${data.userId}`);
    return job;
  }

  /**
   * Update job status
   */
  async updateJobStatus(
    jobId: string, 
    status: JobStatus, 
    options?: { 
      progress?: number; 
      result?: Record<string, any>; 
      errorMessage?: string;
    }
  ) {
    const updateData: any = { status };

    if (options?.progress !== undefined) {
      updateData.progress = options.progress;
    }

    if (options?.result) {
      updateData.result = JSON.stringify(options.result);
    }

    if (options?.errorMessage) {
      updateData.errorMessage = options.errorMessage;
    }

    if (status === 'PROCESSING') {
      updateData.startedAt = new Date();
    }

    if (status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED') {
      updateData.completedAt = new Date();
    }

    const job = await this.prisma.job.update({
      where: { id: jobId },
      data: updateData,
    });

    // Emit progress event
    this.emitProgress({
      jobId,
      userId: job.userId,
      progress: job.progress,
      status: status,
      message: options?.errorMessage,
    });

    return job;
  }

  /**
   * Increment job attempts
   */
  async incrementAttempts(jobId: string) {
    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        attempts: { increment: 1 },
      },
    });
  }

  /**
   * Get job by ID
   */
  async getJob(jobId: string) {
    return this.prisma.job.findUnique({
      where: { id: jobId },
    });
  }

  /**
   * Get jobs for a user
   */
  async getUserJobs(userId: string, options?: { status?: JobStatus; limit?: number }) {
    return this.prisma.job.findMany({
      where: {
        userId,
        ...(options?.status && { status: options.status }),
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 20,
    });
  }

  /**
   * Get pending jobs for processing
   */
  async getPendingJobs(limit: number = 10) {
    return this.prisma.job.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: { lte: new Date() },
      },
      orderBy: [
        { priority: 'desc' },
        { scheduledAt: 'asc' },
      ],
      take: limit,
    });
  }

  /**
   * Clean up old completed/failed jobs
   */
  async cleanupOldJobs(daysOld: number = 7) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);

    const result = await this.prisma.job.deleteMany({
      where: {
        status: { in: ['COMPLETED', 'FAILED', 'CANCELLED'] },
        completedAt: { lt: cutoff },
      },
    });

    this.logger.log(`Cleaned up ${result.count} old jobs`);
    return result.count;
  }

  /**
   * Subscribe to job progress updates (for SSE)
   */
  subscribeToProgress(jobId: string, callback: (event: JobProgressEvent) => void) {
    if (!this.progressEmitters.has(jobId)) {
      this.progressEmitters.set(jobId, new Set());
    }
    this.progressEmitters.get(jobId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const emitters = this.progressEmitters.get(jobId);
      if (emitters) {
        emitters.delete(callback);
        if (emitters.size === 0) {
          this.progressEmitters.delete(jobId);
        }
      }
    };
  }

  /**
   * Emit progress update to all subscribers
   */
  private emitProgress(event: JobProgressEvent) {
    const emitters = this.progressEmitters.get(event.jobId);
    if (emitters) {
      emitters.forEach(callback => callback(event));
    }
  }

  /**
   * Update progress percentage
   */
  async updateProgress(jobId: string, progress: number, message?: string) {
    const job = await this.prisma.job.update({
      where: { id: jobId },
      data: { progress: Math.min(100, Math.max(0, progress)) },
    });

    this.emitProgress({
      jobId,
      userId: job.userId,
      progress: job.progress,
      status: job.status as JobStatus,
      message,
    });

    return job;
  }
}
