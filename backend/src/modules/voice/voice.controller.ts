import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { VoiceService } from './voice.service';
import { CloneVoiceDto } from './dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@Controller('voice')
@UseGuards(JwtAuthGuard)
export class VoiceController {
  constructor(private voiceService: VoiceService) {}

  @Post('clone')
  @UseInterceptors(FilesInterceptor('samples', 5))
  async cloneVoice(
    @CurrentUser('id') userId: string,
    @Body() cloneVoiceDto: CloneVoiceDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 25 * 1024 * 1024 }), // 25MB per file
        ],
        fileIsRequired: true,
      }),
    )
    files: Express.Multer.File[],
  ) {
    return this.voiceService.cloneVoice(userId, cloneVoiceDto, files);
  }

  @Get('list')
  async getVoices(@CurrentUser('id') userId: string) {
    return this.voiceService.getUserVoices(userId);
  }

  @Get(':id')
  async getVoice(
    @CurrentUser('id') userId: string,
    @Param('id') voiceId: string,
  ) {
    return this.voiceService.getVoiceById(userId, voiceId);
  }

  @Delete(':id')
  async deleteVoice(
    @CurrentUser('id') userId: string,
    @Param('id') voiceId: string,
  ) {
    return this.voiceService.deleteVoice(userId, voiceId);
  }
}
