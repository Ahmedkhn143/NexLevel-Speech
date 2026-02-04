import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JazzCashProvider } from './providers/jazzcash.provider';
import { EasyPaisaProvider } from './providers/easypaisa.provider';
import { ManualPaymentProvider } from './providers/manual.provider';
import { PaymentProviderEnum, CreatePaymentDto } from './dto';
import {
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

const mockPrismaService = {
  payment: {
    create: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  plan: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  subscription: {
    upsert: jest.fn(),
  },
  credit: {
    upsert: jest.fn(),
  },
  usageRecord: {
    create: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(mockPrismaService)),
};

const mockConfigService = {
  get: jest.fn((key) => {
    if (key === 'PORT') return 3001;
    if (key === 'FRONTEND_URL') return 'http://localhost:3000';
    return null; // fallback
  }),
};

const mockJazzCashProvider = {
  initiatePayment: jest.fn(),
  verifyWebhook: jest.fn(),
  processWebhook: jest.fn(),
};

const mockEasyPaisaProvider = {
  initiatePayment: jest.fn(),
  verifyWebhook: jest.fn(),
  processWebhook: jest.fn(),
};

const mockManualPaymentProvider = {
  initiatePayment: jest.fn().mockResolvedValue({
    success: true,
    transactionId: 'MAN-123',
    formData: { instructions: 'Transfer money' },
  }),
  verifyWebhook: jest.fn().mockReturnValue(false),
  processWebhook: jest.fn(),
};

describe('PaymentService', () => {
  let service: PaymentService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: JazzCashProvider, useValue: mockJazzCashProvider },
        { provide: EasyPaisaProvider, useValue: mockEasyPaisaProvider },
        { provide: ManualPaymentProvider, useValue: mockManualPaymentProvider },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    prisma = module.get(PrismaService);

    // Reflect private providers map
    // (NestJS DI sets them in constructor, and service sets map in constructor)
    // No need to reflect, service should have them.

    jest.clearAllMocks();
  });

  describe('createPayment', () => {
    it('should create payment for MANUAL provider', async () => {
      const dto: CreatePaymentDto = {
        planId: 'plan-1',
        billingCycle: 'MONTHLY' as any,
        provider: PaymentProviderEnum.MANUAL,
      };

      prisma.plan.findUnique.mockResolvedValue({
        id: 'plan-1',
        isActive: true,
        monthlyPricePKR: 1000,
        displayName: 'Basic',
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
      });
      prisma.payment.create.mockResolvedValue({ id: 'pay-1' });
      prisma.payment.update.mockResolvedValue({});

      const result = await service.createPayment('user-1', dto);

      expect(result.success).toBe(true);
      expect(result.transactionId).toBe('MAN-123');
      expect(prisma.payment.create).toHaveBeenCalled();
    });
  });

  describe('handleWebhook', () => {
    const provider = 'JAZZCASH';
    const payload = {
      pp_ResponseCode: '000',
      pp_TxnRefNo: 'txn-1',
      pp_BillReference: 'pay-1',
    };

    it('should verify signature and succeed', async () => {
      mockJazzCashProvider.verifyWebhook.mockReturnValue(true);
      mockJazzCashProvider.processWebhook.mockReturnValue({
        success: true,
        status: 'COMPLETED',
        transactionId: 'txn-1',
        orderId: 'pay-1',
        rawResponse: payload,
      });

      prisma.payment.findFirst.mockResolvedValue({
        id: 'pay-1',
        status: 'PENDING',
        userId: 'user-1',
        planId: 'plan-1',
        billingCycle: 'MONTHLY',
      });

      prisma.plan.findUnique.mockResolvedValue({
        id: 'plan-1',
        creditsPerMonth: 100,
        displayName: 'Plan',
      });

      const result = await service.handleWebhook(provider, payload);

      expect(result.success).toBe(true);
      expect(prisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'COMPLETED' }),
        }),
      );

      // Verify Credit Allocation (Transaction)
      expect(prisma.credit.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
          create: expect.objectContaining({ totalCredits: 100 }),
        }),
      );
    });

    it('should throw UnauthorizedException on invalid signature', async () => {
      mockJazzCashProvider.verifyWebhook.mockReturnValue(false);

      await expect(service.handleWebhook(provider, payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle Idempotency (already completed)', async () => {
      mockJazzCashProvider.verifyWebhook.mockReturnValue(true);
      mockJazzCashProvider.processWebhook.mockReturnValue({
        success: true,
        transactionId: 'txn-1',
      });

      prisma.payment.findFirst.mockResolvedValue({
        id: 'pay-1',
        status: 'COMPLETED',
      });

      const result = await service.handleWebhook(provider, payload);

      expect(result.message).toBe('Already completed');
      expect(prisma.payment.update).not.toHaveBeenCalled(); // No update
    });
  });
});
