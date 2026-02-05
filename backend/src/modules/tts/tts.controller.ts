import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  Sse,
  MessageEvent,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, Subject, interval, map, takeWhile } from 'rxjs';
import { TtsService } from './tts.service';
import { GenerateSpeechDto } from './dto';
import { JwtAuthGuard, CreditsGuard } from '../../common/guards';
import { CurrentUser, Public } from '../../common/decorators';
import { JobService } from '../queue/job.service';

@Controller('tts')
@UseGuards(JwtAuthGuard)
export class TtsController {
  constructor(
    private ttsService: TtsService,
    private jobService: JobService,
  ) {}

  @Post('generate')
  @UseGuards(CreditsGuard)
  async generateSpeech(
    @CurrentUser('id') userId: string,
    @Body() generateSpeechDto: GenerateSpeechDto,
  ) {
    return this.ttsService.generateSpeech(userId, generateSpeechDto);
  }

  @Post('generate/async')
  @UseGuards(CreditsGuard)
  async generateSpeechAsync(
    @CurrentUser('id') userId: string,
    @Body() generateSpeechDto: GenerateSpeechDto,
  ) {
    return this.ttsService.generateSpeechAsync(userId, generateSpeechDto);
  }

  @Get('job/:jobId')
  async getJobStatus(
    @CurrentUser('id') userId: string,
    @Param('jobId') jobId: string,
  ) {
    const job = await this.jobService.getJob(jobId);
    if (!job || job.userId !== userId) {
      return { error: 'Job not found' };
    }
    return {
      id: job.id,
      status: job.status,
      progress: job.progress,
      result: job.result ? JSON.parse(job.result) : null,
      errorMessage: job.errorMessage,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    };
  }

  @Sse('job/:jobId/progress')
  @Public()
  jobProgress(
    @Param('jobId') jobId: string,
  ): Observable<MessageEvent> {
    const subject = new Subject<MessageEvent>();

    const unsubscribe = this.jobService.subscribeToProgress(jobId, (event) => {
      subject.next({
        data: {
          jobId: event.jobId,
          progress: event.progress,
          status: event.status,
          message: event.message,
        },
      });

      // Close connection when job is done
      if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(event.status)) {
        setTimeout(() => subject.complete(), 100);
      }
    });

    // Cleanup on disconnect
    subject.subscribe({
      complete: () => unsubscribe(),
      error: () => unsubscribe(),
    });

    // Send initial status
    this.jobService.getJob(jobId).then(job => {
      if (job) {
        subject.next({
          data: {
            jobId: job.id,
            progress: job.progress,
            status: job.status,
            message: 'Connected',
          },
        });
      }
    });

    return subject.asObservable();
  }

  @Get('history')
  async getHistory(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ttsService.getGenerationHistory(
      userId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get(':id')
  async getGeneration(
    @CurrentUser('id') userId: string,
    @Param('id') generationId: string,
  ) {
    return this.ttsService.getGenerationById(userId, generationId);
  }
}
