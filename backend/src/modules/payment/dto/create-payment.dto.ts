import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
} from 'class-validator';

export enum PaymentProviderEnum {
  JAZZCASH = 'JAZZCASH',
  EASYPAISA = 'EASYPAISA',
  PAYPAK = 'PAYPAK',
  PAYBOST = 'PAYBOST',
  MANUAL = 'MANUAL',
}

export enum BillingCycleEnum {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  planId: string;

  @IsEnum(BillingCycleEnum)
  billingCycle: BillingCycleEnum;

  @IsEnum(PaymentProviderEnum)
  provider: PaymentProviderEnum;

  @IsString()
  @IsOptional()
  mobileNumber?: string;
}
