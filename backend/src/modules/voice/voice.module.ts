import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { VoiceController } from './voice.controller';
import { VoiceService } from './voice.service';
import { AIProviderFactory } from '../../ai-providers';
import { StorageModule } from '../../storage/storage.module';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 25 * 1024 * 1024, // 25MB
        files: 5,
      },
    }),
    StorageModule,
  ],
  controllers: [VoiceController],
  providers: [VoiceService, AIProviderFactory],
  exports: [VoiceService],
})
export class VoiceModule {}
