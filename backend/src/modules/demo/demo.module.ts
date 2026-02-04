import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DemoController } from './demo.controller';
import { TtsModule } from '../tts/tts.module';

@Module({
  imports: [TtsModule, ConfigModule],
  controllers: [DemoController],
})
export class DemoModule {}
