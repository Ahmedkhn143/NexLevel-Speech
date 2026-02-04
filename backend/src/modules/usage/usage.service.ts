import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsageService {
  constructor(private prisma: PrismaService) {}

  async getUsageHistory(userId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      this.prisma.usageRecord.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.usageRecord.count({ where: { userId } }),
    ]);

    return {
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUsageStats(userId: string) {
    const credits = await this.prisma.credit.findUnique({
      where: { userId },
    });

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyUsage = await this.prisma.usageRecord.aggregate({
      where: {
        userId,
        createdAt: { gte: thisMonth },
        type: 'TTS_GENERATION',
      },
      _sum: { creditsUsed: true },
    });

    const generationCount = await this.prisma.generation.count({
      where: {
        userId,
        createdAt: { gte: thisMonth },
        status: 'COMPLETED',
      },
    });

    const voiceCount = await this.prisma.voice.count({
      where: {
        userId,
        status: { not: 'DELETED' },
      },
    });

    return {
      credits: {
        total: credits?.totalCredits || 0,
        used: credits?.usedCredits || 0,
        bonus: credits?.bonusCredits || 0,
        available:
          (credits?.totalCredits || 0) -
          (credits?.usedCredits || 0) +
          (credits?.bonusCredits || 0),
        nextResetAt: credits?.nextResetAt,
      },
      thisMonth: {
        charactersGenerated: monthlyUsage._sum.creditsUsed || 0,
        generationCount,
      },
      voiceCount,
    };
  }
}
