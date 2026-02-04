export interface IPaymentProvider {
  /**
   * Provider name
   */
  getProviderName(): string;

  /**
   * Initialize a payment
   * @returns Payment redirect URL or transaction details
   */
  initiatePayment(params: InitiatePaymentParams): Promise<PaymentInitResult>;

  /**
   * Verify webhook signature
   */
  verifyWebhook(payload: any, signature?: string): boolean;

  /**
   * Process webhook and return transaction result
   */
  processWebhook(payload: any): PaymentWebhookResult;
}

export interface InitiatePaymentParams {
  orderId: string;
  amount: number; // Amount in PKR
  description: string;
  customerEmail: string;
  customerMobile?: string;
  returnUrl: string;
  callbackUrl: string;
}

export interface PaymentInitResult {
  success: boolean;
  redirectUrl?: string;
  transactionId?: string;
  formData?: Record<string, string>;
  formAction?: string;
  error?: string;
}

export interface PaymentWebhookResult {
  success: boolean;
  transactionId: string;
  orderId: string;
  amount: number;
  status: 'COMPLETED' | 'FAILED' | 'PENDING';
  rawResponse: any;
  error?: string;
}
