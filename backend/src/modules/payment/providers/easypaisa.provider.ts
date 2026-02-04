import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';
import {
  IPaymentProvider,
  InitiatePaymentParams,
  PaymentInitResult,
  PaymentWebhookResult,
} from './payment-provider.interface';

@Injectable()
export class EasyPaisaProvider implements IPaymentProvider {
  private storeId: string;
  private hashKey: string;
  private apiUrl: string;

  constructor(private configService: ConfigService) {
    this.storeId = this.configService.get<string>('EASYPAISA_STORE_ID') || '';
    this.hashKey = this.configService.get<string>('EASYPAISA_HASHKEY') || '';
    this.apiUrl =
      this.configService.get<string>('EASYPAISA_API_URL') ||
      'https://easypay.easypaisa.com.pk/easypay-service/rest/v4/initiate-ma-transaction';
  }

  getProviderName(): string {
    return 'EASYPAISA';
  }

  async initiatePayment(
    params: InitiatePaymentParams,
  ): Promise<PaymentInitResult> {
    try {
      const timestamp = new Date().toISOString();

      const payload = {
        orderId: params.orderId,
        storeId: this.storeId,
        transactionAmount: params.amount.toFixed(2),
        transactionType: 'MA', // Mobile Account
        mobileAccountNo: params.customerMobile || '',
        emailAddress: params.customerEmail,
        merchantPaymentMethod: '',
        postBackURL: params.callbackUrl,
        signature: '',
      };

      // Generate signature
      const signatureString = `${this.storeId}${params.orderId}${payload.transactionAmount}${payload.transactionType}${params.customerMobile || ''}${params.customerEmail}${params.callbackUrl}`;
      payload.signature = crypto
        .createHmac('sha256', this.hashKey)
        .update(signatureString)
        .digest('hex');

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          Credentials: Buffer.from(`${this.storeId}:${this.hashKey}`).toString(
            'base64',
          ),
        },
      });

      if (response.data && response.data.responseCode === '0000') {
        return {
          success: true,
          redirectUrl: response.data.paymentTokenUrl,
          transactionId: response.data.transactionId,
        };
      }

      return {
        success: false,
        error: response.data?.responseDesc || 'Payment initiation failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  verifyWebhook(payload: any, signature?: string): boolean {
    // EasyPaisa webhook verification logic
    if (!signature || !payload) return false;

    const signatureString = `${payload.orderId}${payload.transactionId}${payload.transactionStatus}`;
    const calculatedSignature = crypto
      .createHmac('sha256', this.hashKey)
      .update(signatureString)
      .digest('hex');

    return signature === calculatedSignature;
  }

  processWebhook(payload: any): PaymentWebhookResult {
    const isSuccess =
      payload.transactionStatus === '0000' ||
      payload.transactionStatus === 'SUCCESS';

    return {
      success: isSuccess,
      transactionId: payload.transactionId || '',
      orderId: payload.orderId || '',
      amount: parseFloat(payload.transactionAmount || '0'),
      status: isSuccess ? 'COMPLETED' : 'FAILED',
      rawResponse: payload,
      error: isSuccess ? undefined : payload.responseDesc,
    };
  }
}
