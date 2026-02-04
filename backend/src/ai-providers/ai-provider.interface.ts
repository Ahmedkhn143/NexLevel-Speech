export interface IAIProvider {
  /**
   * Clone a voice using audio samples
   * @param name Voice name
   * @param description Voice description
   * @param samples Audio sample buffers
   * @returns External voice ID from the provider
   */
  cloneVoice(
    name: string,
    description: string,
    samples: Buffer[],
  ): Promise<string>;

  /**
   * Generate speech from text
   * @param voiceId External voice ID
   * @param text Text to convert to speech
   * @param language Language code (e.g., 'en', 'ur', 'ar')
   * @returns Audio buffer
   */
  generateSpeech(
    voiceId: string,
    text: string,
    language: string,
  ): Promise<Buffer>;

  /**
   * Delete a cloned voice
   * @param voiceId External voice ID
   */
  deleteVoice(voiceId: string): Promise<void>;

  /**
   * Get list of available voices
   */
  getVoices(): Promise<VoiceInfo[]>;

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[];

  /**
   * Get provider name
   */
  getProviderName(): string;
}

export interface VoiceInfo {
  voiceId: string;
  name: string;
  category?: string;
  description?: string;
  labels?: Record<string, string>;
}

export interface GenerateSpeechOptions {
  voiceId: string;
  text: string;
  language?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}
