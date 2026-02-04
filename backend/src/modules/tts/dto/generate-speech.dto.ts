import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';

export enum AudioFormat {
  MP3 = 'MP3',
  WAV = 'WAV',
  OGG = 'OGG',
}

export class GenerateSpeechDto {
  @IsString()
  @IsNotEmpty()
  voiceId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100000)
  text: string;

  @IsString()
  @IsOptional()
  language?: string = 'en';

  @IsEnum(AudioFormat)
  @IsOptional()
  format?: AudioFormat = AudioFormat.MP3;
}
