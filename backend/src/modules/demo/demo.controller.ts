import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { TtsService } from '../tts/tts.service';
import { Public } from '../../common/decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Controller('demo')
export class DemoController {
  constructor(
    private readonly ttsService: TtsService,
    private readonly configService: ConfigService,
  ) {}

  @Public() // Allow unauthenticated access
  @Post('generate')
  async generateDemo(
    @Body() body: { text: string; voiceId: string; lang: string },
    @Res() res: Response,
  ) {
    const { text, voiceId } = body;

    // 1. Strict Validation
    if (!text || text.length > 500) {
      throw new BadRequestException(
        'Demo text limit exceeded (max 500 chars).',
      );
    }

    if (!text.trim()) {
      throw new BadRequestException('Text cannot be empty.');
    }

    // Check if API key is configured
    const apiKey = this.configService.get<string>('ELEVENLABS_API_KEY');
    const hasValidApiKey = apiKey && apiKey !== 'your-elevenlabs-api-key';

    if (!hasValidApiKey) {
      // Return mock audio - a simple silent WAV file encoded as base64
      // This allows the demo to "work" without a real API key
      return this.sendMockAudio(res);
    }

    try {
      const audioStream = await this.ttsService.generateStream(
        text,
        voiceId || 'sarah',
      );

      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="demo.mp3"',
      });

      audioStream.pipe(res);
    } catch (error) {
      console.error('Demo Generation Failed:', error);
      // Fallback to mock audio
      return this.sendMockAudio(res);
    }
  }

  private sendMockAudio(res: Response) {
    // Generate a simple WAV file with a short beep/tone
    // This is a minimal valid WAV file with a brief tone
    const sampleRate = 22050;
    const duration = 0.5; // 0.5 seconds
    const frequency = 440; // A4 note
    const numSamples = Math.floor(sampleRate * duration);

    // WAV header + data
    const buffer = Buffer.alloc(44 + numSamples * 2);

    // RIFF header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + numSamples * 2, 4);
    buffer.write('WAVE', 8);

    // fmt chunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // chunk size
    buffer.writeUInt16LE(1, 20); // PCM format
    buffer.writeUInt16LE(1, 22); // mono
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
    buffer.writeUInt16LE(2, 32); // block align
    buffer.writeUInt16LE(16, 34); // bits per sample

    // data chunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(numSamples * 2, 40);

    // Generate sine wave
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const amplitude = Math.sin(2 * Math.PI * frequency * t) * 0.3;
      const sample = Math.floor(amplitude * 32767);
      buffer.writeInt16LE(sample, 44 + i * 2);
    }

    res.set({
      'Content-Type': 'audio/wav',
      'Content-Disposition': 'inline; filename="demo.wav"',
      'Content-Length': buffer.length.toString(),
    });

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    stream.pipe(res);
  }
}
