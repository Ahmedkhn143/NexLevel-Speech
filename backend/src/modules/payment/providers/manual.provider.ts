import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IPaymentProvider,
  InitiatePaymentParams,
  PaymentInitResult,
  PaymentWebhookResult,
} from './payment-provider.interface';

@Injectable()
export class ManualPaymentProvider implements IPaymentProvider {
  constructor(private configService: ConfigService) {}

  getProviderName(): string {
    return 'MANUAL';
  }

  async initiatePayment(
    params: InitiatePaymentParams,
  ): Promise<PaymentInitResult> {
    const bankName =
      this.configService.get<string>('BANK_NAME') || 'Meezan Bank';
    const accountNo =
      this.configService.get<string>('BANK_ACCOUNT_NO') ||
      '0000-0000-0000-0000';
    const accountTitle =
      this.configService.get<string>('BANK_ACCOUNT_TITLE') || 'NexLevel Speech';

    return {
      success: true,
      transactionId: `MAN-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      formData: {
        bankName,
        accountNumber: accountNo,
        accountTitle,
        amount: params.amount.toString(),
        reference: params.orderId,
        instructions:
          'Please transfer the exact amount to the bank account above and upload the receipt in the dashboard.',
      },
    };
  }

  verifyWebhook(payload: any, signature?: string): boolean {
    // Manual payments do not have webhooks
    return false;
  }

  processWebhook(payload: any): PaymentWebhookResult {
    throw new Error('Manual payments do not support webhooks');
  }
}
