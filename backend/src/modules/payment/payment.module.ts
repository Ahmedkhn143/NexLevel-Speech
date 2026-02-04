import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { JazzCashProvider } from './providers/jazzcash.provider';
import { EasyPaisaProvider } from './providers/easypaisa.provider';
import { ManualPaymentProvider } from './providers/manual.provider';

@Module({
  controllers: [PaymentController],
  providers: [
    PaymentService,
    JazzCashProvider,
    EasyPaisaProvider,
    ManualPaymentProvider,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
