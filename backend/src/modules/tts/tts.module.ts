import { Module } from '@nestjs/common';
import { TtsController } from './tts.controller';
import { TtsService } from './tts.service';
import { AIProviderFactory } from '../../ai-providers';
import { StorageModule } from '../../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [TtsController],
  providers: [TtsService, AIProviderFactory],
  exports: [TtsService],
})
export class TtsModule {}
