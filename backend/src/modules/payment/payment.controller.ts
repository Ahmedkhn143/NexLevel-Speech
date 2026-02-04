import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto, WebhookPayloadDto } from './dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Get('plans')
  async getPlans() {
    return this.paymentService.getPlans();
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createPayment(
    @CurrentUser('id') userId: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentService.createPayment(userId, createPaymentDto);
  }

  @Post('webhook/:provider')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param('provider') provider: string,
    @Body() payload: WebhookPayloadDto,
    @Headers('x-signature') signature?: string,
  ) {
    return this.paymentService.handleWebhook(provider, payload, signature);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getPaymentHistory(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.paymentService.getPaymentHistory(
      userId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
