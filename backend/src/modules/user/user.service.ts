import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        subscription: { include: { plan: true } },
        credits: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      subscription: user.subscription,
      credits: user.credits,
      createdAt: user.createdAt,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        subscription: { include: { plan: true } },
        credits: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      subscription: user.subscription,
      credits: user.credits,
    };
  }

  async getCredits(userId: string) {
    const credits = await this.prisma.credit.findUnique({
      where: { userId },
    });

    if (!credits) {
      throw new NotFoundException('Credits not found');
    }

    return {
      total: credits.totalCredits,
      used: credits.usedCredits,
      bonus: credits.bonusCredits,
      available:
        credits.totalCredits - credits.usedCredits + credits.bonusCredits,
      nextResetAt: credits.nextResetAt,
    };
  }

  async getSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }
}
