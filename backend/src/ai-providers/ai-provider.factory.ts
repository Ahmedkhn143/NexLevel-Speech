import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAIProvider } from './ai-provider.interface';
import { ElevenLabsProvider } from './elevenlabs/elevenlabs.provider';

export type AIProviderType = 'elevenlabs' | 'resemble_ai' | 'play_ht';

@Injectable()
export class AIProviderFactory {
  private providers: Map<AIProviderType, IAIProvider> = new Map();

  constructor(private configService: ConfigService) {
    // Initialize ElevenLabs as default provider
    this.providers.set(
      'elevenlabs',
      new ElevenLabsProvider(this.configService),
    );

    // Future providers can be added here:
    // this.providers.set('resemble_ai', new ResembleAIProvider(this.configService));
    // this.providers.set('play_ht', new PlayHTProvider(this.configService));
  }

  getProvider(type: AIProviderType = 'elevenlabs'): IAIProvider {
    const provider = this.providers.get(type);

    if (!provider) {
      throw new Error(`AI Provider '${type}' is not configured`);
    }

    return provider;
  }

  getDefaultProvider(): IAIProvider {
    return this.getProvider('elevenlabs');
  }

  getSupportedProviders(): AIProviderType[] {
    return Array.from(this.providers.keys());
  }
}
