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
export class JazzCashProvider implements IPaymentProvider {
  private merchantId: string;
  private password: string;
  private integritySalt: string;
  private apiUrl: string;

  constructor(private configService: ConfigService) {
    this.merchantId =
      this.configService.get<string>('JAZZCASH_MERCHANT_ID') || '';
    this.password = this.configService.get<string>('JAZZCASH_PASSWORD') || '';
    this.integritySalt =
      this.configService.get<string>('JAZZCASH_INTEGRITY_SALT') || '';
    this.apiUrl = this.configService.get<string>('JAZZCASH_API_URL') || '';
  }

  getProviderName(): string {
    return 'JAZZCASH';
  }

  async initiatePayment(
    params: InitiatePaymentParams,
  ): Promise<PaymentInitResult> {
    try {
      const currentDate = new Date();
      const txnDateTime = this.formatDateTime(currentDate);
      const expiryDateTime = this.formatDateTime(
        new Date(currentDate.getTime() + 60 * 60 * 1000), // 1 hour
      );

      const payload: Record<string, string> = {
        pp_Version: '1.1',
        pp_TxnType: 'MWALLET',
        pp_Language: 'EN',
        pp_MerchantID: this.merchantId,
        pp_Password: this.password,
        pp_TxnRefNo: `T${Date.now()}`,
        pp_Amount: (params.amount * 100).toString(), // Convert to paisa
        pp_TxnCurrency: 'PKR',
        pp_TxnDateTime: txnDateTime,
        pp_TxnExpiryDateTime: expiryDateTime,
        pp_BillReference: params.orderId,
        pp_Description: params.description.substring(0, 100),
        pp_ReturnURL: params.returnUrl,
        ppmpf_1: params.customerMobile || '',
        ppmpf_2: '',
        ppmpf_3: '',
        ppmpf_4: '',
        ppmpf_5: '',
      };

      // Generate secure hash
      payload.pp_SecureHash = this.generateSecureHash(payload);

      // JazzCash uses form-based redirect
      const formAction =
        this.apiUrl ||
        'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/';

      return {
        success: true,
        formData: payload,
        formAction,
        transactionId: payload.pp_TxnRefNo,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  verifyWebhook(payload: any, signature?: string): boolean {
    const receivedHash = payload.pp_SecureHash;
    if (!receivedHash) return false;

    // Create a copy without the hash for verification
    const payloadCopy = { ...payload };
    delete payloadCopy.pp_SecureHash;

    const calculatedHash = this.generateSecureHash(payloadCopy);
    return receivedHash === calculatedHash;
  }

  processWebhook(payload: any): PaymentWebhookResult {
    const responseCode = payload.pp_ResponseCode;
    const isSuccess = responseCode === '000';

    return {
      success: isSuccess,
      transactionId: payload.pp_TxnRefNo || '',
      orderId: payload.pp_BillReference || '',
      amount: parseInt(payload.pp_Amount || '0', 10) / 100, // Convert from paisa
      status: isSuccess ? 'COMPLETED' : 'FAILED',
      rawResponse: payload,
      error: isSuccess ? undefined : payload.pp_ResponseMessage,
    };
  }

  private generateSecureHash(data: Record<string, string>): string {
    // Sort keys and build hash string
    const sortedKeys = Object.keys(data)
      .filter((key) => key.startsWith('pp_') || key.startsWith('ppmpf_'))
      .sort();

    const values = sortedKeys
      .map((key) => data[key])
      .filter((val) => val !== '');

    const hashString = this.integritySalt + '&' + values.join('&');

    return crypto
      .createHmac('sha256', this.integritySalt)
      .update(hashString)
      .digest('hex')
      .toUpperCase();
  }

  private formatDateTime(date: Date): string {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return (
      date.getFullYear().toString() +
      pad(date.getMonth() + 1) +
      pad(date.getDate()) +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      pad(date.getSeconds())
    );
  }
}
