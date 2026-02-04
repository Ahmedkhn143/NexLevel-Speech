import { IsObject, IsOptional, IsString } from 'class-validator';

export class WebhookPayloadDto {
  @IsString()
  @IsOptional()
  pp_ResponseCode?: string;

  @IsString()
  @IsOptional()
  pp_ResponseMessage?: string;

  @IsString()
  @IsOptional()
  pp_TxnRefNo?: string;

  @IsString()
  @IsOptional()
  pp_Amount?: string;

  @IsString()
  @IsOptional()
  pp_SecureHash?: string;

  @IsString()
  @IsOptional()
  pp_BillReference?: string;

  // EasyPaisa fields
  @IsString()
  @IsOptional()
  orderId?: string;

  @IsString()
  @IsOptional()
  transactionStatus?: string;

  @IsString()
  @IsOptional()
  transactionId?: string;

  [key: string]: any;
}
