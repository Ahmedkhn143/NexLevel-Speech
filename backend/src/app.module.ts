import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma';
import { StorageModule } from './storage';
import { AuthModule } from './modules/auth';
import { UserModule } from './modules/user';
import { VoiceModule } from './modules/voice';
import { TtsModule } from './modules/tts';
import { PaymentModule } from './modules/payment';
import { UsageModule } from './modules/usage';
import { DemoModule } from './modules/demo/demo.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'long',
        ttl: 3600000,
        limit: 1000,
      },
    ]),

    // Core modules
    PrismaModule,
    StorageModule,

    // Feature modules
    AuthModule,
    UserModule,
    VoiceModule,
    TtsModule,
    PaymentModule,
    UsageModule,
    DemoModule,
  ],
})
export class AppModule { }
