import { Test, TestingModule } from '@nestjs/testing';
import { TtsService } from './tts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AIProviderFactory } from '../../ai-providers';
import { StorageService } from '../../storage/storage.service';
import { HttpException } from '@nestjs/common';

const mockPrismaService = {
  voice: { findFirst: jest.fn() },
  credit: { findUnique: jest.fn(), update: jest.fn() },
  generation: { create: jest.fn(), update: jest.fn(), count: jest.fn() },
  usageRecord: { create: jest.fn() },
};

const mockAIProvider = {
  generateSpeech: jest.fn(),
  getSupportedLanguages: jest.fn().mockReturnValue(['en', 'ur']),
};

const mockAIProviderFactory = {
  getDefaultProvider: jest.fn().mockReturnValue(mockAIProvider),
};

const mockStorageService = {
  uploadAudio: jest.fn(),
};

describe('TtsService', () => {
  let service: TtsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TtsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AIProviderFactory, useValue: mockAIProviderFactory },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<TtsService>(TtsService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('generateSpeech', () => {
    const userId = 'user-1';
    const voiceId = 'voice-1';
    const text = 'Hello world';
    const dto = { voiceId, text, language: 'en' };
    const mockVoice = {
      id: voiceId,
      externalVoiceId: 'ext-1',
      name: 'Voice 1',
    };
    const mockCredits = { totalCredits: 100, usedCredits: 0, bonusCredits: 0 };

    it('should block generation if insufficient credits', async () => {
      prisma.voice.findFirst.mockResolvedValue(mockVoice);
      prisma.credit.findUnique.mockResolvedValue({
        ...mockCredits,
        totalCredits: 5,
      }); // Less than text length (10 chars)

      await expect(service.generateSpeech(userId, dto)).rejects.toThrow(
        HttpException,
      );
    });

    it('should deduct credits upon success', async () => {
      prisma.voice.findFirst.mockResolvedValue(mockVoice);
      prisma.credit.findUnique.mockResolvedValue(mockCredits);
      prisma.generation.count.mockResolvedValue(0); // Daily limit not reached
      prisma.generation.create.mockResolvedValue({ id: 'gen-1' });
      mockAIProvider.generateSpeech.mockResolvedValue(Buffer.from('audio'));
      mockStorageService.uploadAudio.mockResolvedValue('http://audio.url');
      prisma.generation.update.mockResolvedValue({
        id: 'gen-1',
        audioUrl: 'http://audio.url',
      });

      await service.generateSpeech(userId, dto);

      const charCount = 10; // "Helloworld" length
      expect(prisma.credit.update).toHaveBeenCalledWith({
        where: { userId },
        data: {
          bonusCredits: 0,
          usedCredits: 10, // 0 + 10
        },
      });
    });

    it('should NOT deduct credits if AI generation fails', async () => {
      prisma.voice.findFirst.mockResolvedValue(mockVoice);
      prisma.credit.findUnique.mockResolvedValue(mockCredits);
      prisma.generation.count.mockResolvedValue(0);
      prisma.generation.create.mockResolvedValue({ id: 'gen-1' });

      const error = new Error('AI Error');
      mockAIProvider.generateSpeech.mockRejectedValue(error);

      await expect(service.generateSpeech(userId, dto)).rejects.toThrow(
        'AI Error',
      );

      expect(prisma.credit.update).not.toHaveBeenCalled();
      expect(prisma.generation.update).toHaveBeenCalledWith({
        where: { id: 'gen-1' },
        data: expect.objectContaining({ status: 'FAILED' }),
      });
    });

    it('should block if daily limit reached', async () => {
      prisma.voice.findFirst.mockResolvedValue(mockVoice);
      prisma.credit.findUnique.mockResolvedValue(mockCredits);
      prisma.generation.count.mockResolvedValue(50); // Limit reached

      await expect(service.generateSpeech(userId, dto)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
