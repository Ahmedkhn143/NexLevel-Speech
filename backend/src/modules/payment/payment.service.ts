import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto, PaymentProviderEnum } from './dto';
import { JazzCashProvider } from './providers/jazzcash.provider';
import { EasyPaisaProvider } from './providers/easypaisa.provider';
import { IPaymentProvider } from './providers/payment-provider.interface';

@Injectable()
export class PaymentService {
  private providers: Map<PaymentProviderEnum, IPaymentProvider>;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private jazzCashProvider: JazzCashProvider,
    private easyPaisaProvider: EasyPaisaProvider,
  ) {
    this.providers = new Map();
    this.providers.set(PaymentProviderEnum.JAZZCASH, this.jazzCashProvider);
    this.providers.set(PaymentProviderEnum.EASYPAISA, this.easyPaisaProvider);
  }

  async createPayment(userId: string, createPaymentDto: CreatePaymentDto) {
    const { planId, billingCycle, provider, mobileNumber } = createPaymentDto;

    // Get plan details
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      throw new NotFoundException('Plan not found or inactive');
    }

    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate amount
    const amount =
      billingCycle === 'YEARLY' ? plan.yearlyPricePKR : plan.monthlyPricePKR;

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount,
        currency: 'PKR',
        provider,
        status: 'PENDING',
        planId,
        billingCycle,
        metadata: JSON.stringify({ mobileNumber }),
      },
    });

    // Get payment provider
    const paymentProvider = this.providers.get(provider);
    if (!paymentProvider) {
      throw new BadRequestException(
        `Payment provider ${provider} not supported`,
      );
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const backendUrl = `http://localhost:${this.configService.get<string>('PORT') || 3001}`;

    // Initiate payment
    const result = await paymentProvider.initiatePayment({
      orderId: payment.id,
      amount,
      description: `NexLevel Speech - ${plan.displayName} Plan (${billingCycle})`,
      customerEmail: user.email,
      customerMobile: mobileNumber,
      returnUrl: `${frontendUrl}/payment/callback`,
      callbackUrl: `${backendUrl}/payments/webhook/${provider.toLowerCase()}`,
    });

    if (!result.success) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          failureReason: result.error,
        },
      });

      throw new BadRequestException(
        result.error || 'Payment initiation failed',
      );
    }

    // Update payment with transaction ID
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerTxnId: result.transactionId,
        status: 'PROCESSING',
      },
    });

    return {
      paymentId: payment.id,
      ...result,
    };
  }

  private readonly logger = new Logger(PaymentService.name);

  async handleWebhook(provider: string, payload: any, signature?: string) {
    const providerKey = provider.toUpperCase() as PaymentProviderEnum;
    const paymentProvider = this.providers.get(providerKey);

    if (!paymentProvider) {
      throw new BadRequestException(`Unknown payment provider: ${provider}`);
    }

    // Verify webhook signature (Strict)
    if (!paymentProvider.verifyWebhook(payload, signature)) {
      this.logger.error(
        `Webhook signature verification failed for ${provider}`,
        {
          payload,
          signature,
        },
      );
      throw new UnauthorizedException('Invalid webhook signature');
    }

    // Process webhook
    const result = paymentProvider.processWebhook(payload);

    // Find payment record
    const payment = await this.prisma.payment.findFirst({
      where: {
        OR: [{ id: result.orderId }, { providerTxnId: result.transactionId }],
      },
    });

    if (!payment) {
      this.logger.error('Payment not found for webhook:', result);
      return { received: true, processed: false };
    }

    // Idempotency check
    if (payment.status === 'COMPLETED') {
      this.logger.log(`Payment ${payment.id} already processed. Skipping.`);
      return { received: true, processed: true, message: 'Already completed' };
    }

    if (result.status === 'COMPLETED') {
      // Update payment and activate subscription Transactionally
      try {
        await this.prisma.$transaction(async (tx) => {
          // 1. Update Payment
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: 'COMPLETED',
              providerTxnId: result.transactionId,
              providerReference: JSON.stringify(result.rawResponse),
              paidAt: new Date(),
            },
          });

          // 2. Activate Subscription & Credits
          if (payment.planId && payment.billingCycle) {
            await this.activateSubscriptionTx(
              tx,
              payment.userId,
              payment.planId,
              payment.billingCycle as string,
            );
          }
        });

        this.logger.log(`Payment ${payment.id} processed successfully.`);
        return { received: true, processed: true, success: true };
      } catch (error) {
        this.logger.error(
          `Failed to process payment ${payment.id}:`,
          error.message,
        );
        throw error;
      }
    } else {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          failureReason: result.error,
        },
      });

      this.logger.warn(`Payment ${payment.id} failed: ${result.error}`);
      return { received: true, processed: true, success: false };
    }
  }

  private async activateSubscriptionTx(
    tx: any, // Use any to allow both PrismaService and TransactionClient
    userId: string,
    planId: string,
    billingCycle: string,
  ) {
    const plan = await tx.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found during activation');

    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(
      periodEnd.getMonth() + (billingCycle === 'YEARLY' ? 12 : 1),
    );

    // Update or create subscription
    await tx.subscription.upsert({
      where: { userId },
      create: {
        userId,
        planId,
        status: 'ACTIVE',
        billingCycle: billingCycle as any,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      update: {
        planId,
        status: 'ACTIVE',
        billingCycle: billingCycle as any,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    // Reset/update credits (Rule: Reset monthly credits)
    await tx.credit.upsert({
      where: { userId },
      create: {
        userId,
        totalCredits: plan.creditsPerMonth,
        usedCredits: 0,
        bonusCredits: 0,
        nextResetAt: periodEnd,
      },
      update: {
        totalCredits: plan.creditsPerMonth,
        usedCredits: 0, // Reset used credits
        nextResetAt: periodEnd,
      },
    });

    // Log usage record
    await tx.usageRecord.create({
      data: {
        userId,
        type: 'SUBSCRIPTION_RESET',
        creditsUsed: 0,
        description: `Subscription activated: ${plan.displayName} (${billingCycle})`,
      },
    });
  }

  // Deprecated non-transactional method (keep signature if needed or remove)
  private async activateSubscription(
    userId: string,
    planId: string,
    billingCycle: string,
  ) {
    // This should now delegate to transaction with this.prisma, but verifying webhook uses direct logic
    // Leaving empty or throwing error to enforce usage of handleWebhook logic
    // Or forward to new logic using this.prisma
    return this.prisma.$transaction(async (tx) => {
      return this.activateSubscriptionTx(
        tx as any,
        userId,
        planId,
        billingCycle,
      );
    });
  }

  async getPaymentHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where: { userId } }),
    ]);

    return {
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPlans() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { monthlyPricePKR: 'asc' },
    });
  }
}
