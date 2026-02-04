import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TtsService } from './tts.service';
import { GenerateSpeechDto } from './dto';
import { JwtAuthGuard, CreditsGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@Controller('tts')
@UseGuards(JwtAuthGuard)
export class TtsController {
  constructor(private ttsService: TtsService) {}

  @Post('generate')
  @UseGuards(CreditsGuard)
  async generateSpeech(
    @CurrentUser('id') userId: string,
    @Body() generateSpeechDto: GenerateSpeechDto,
  ) {
    return this.ttsService.generateSpeech(userId, generateSpeechDto);
  }

  @Get('history')
  async getHistory(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ttsService.getGenerationHistory(
      userId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get(':id')
  async getGeneration(
    @CurrentUser('id') userId: string,
    @Param('id') generationId: string,
  ) {
    return this.ttsService.getGenerationById(userId, generationId);
  }
}
