import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CreditsGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const credits = await this.prisma.credit.findUnique({
      where: { userId: user.id },
    });

    if (!credits) {
      throw new HttpException(
        'No credits found for user',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    const availableCredits =
      credits.totalCredits - credits.usedCredits + credits.bonusCredits;

    if (availableCredits <= 0) {
      throw new HttpException(
        'Insufficient credits. Please upgrade your plan.',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    // Attach credits info to request for use in controllers/services
    request.credits = credits;
    request.availableCredits = availableCredits;

    return true;
  }
}
