import { registerAs } from '@nestjs/config';

export default registerAs('aiProvider', () => ({
  default: process.env.DEFAULT_AI_PROVIDER || 'ELEVENLABS',
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY,
    baseUrl: process.env.ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io/v1',
  },
  resembleAi: {
    apiKey: process.env.RESEMBLE_API_KEY,
  },
  playHt: {
    apiKey: process.env.PLAYHT_API_KEY,
    userId: process.env.PLAYHT_USER_ID,
  },
}));
