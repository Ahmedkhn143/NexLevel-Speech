import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly uploadDir = path.join(__dirname, '..', '..', 'uploads');

  constructor(private configService: ConfigService) {
    const provider = this.configService.get<string>('STORAGE_PROVIDER');

    if (provider === 'cloudinary') {
      cloudinary.config({
        cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
        api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
        api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
      });
    }

    // Ensure upload directory exists
    fs.mkdir(this.uploadDir, { recursive: true }).catch(err => console.error('Failed to create upload dir', err));
  }

  async uploadAudio(buffer: Buffer, filePath: string): Promise<string> {
    const provider = this.configService.get<string>('STORAGE_PROVIDER');

    if (provider === 'cloudinary') {
      return this.uploadToCloudinary(buffer, filePath);
    }

    if (provider === 'local') {
      return this.uploadToLocal(buffer, filePath);
    }

    // Default to S3
    return this.uploadToS3(buffer, filePath);
  }

  async deleteFile(url: string): Promise<void> {
    const provider = this.configService.get<string>('STORAGE_PROVIDER');

    if (provider === 'cloudinary') {
      await this.deleteFromCloudinary(url);
    } else if (provider === 'local') {
      // Local delete logic (can be implemented if needed)
    } else {
      await this.deleteFromS3(url);
    }
  }

  private async uploadToLocal(buffer: Buffer, filePath: string): Promise<string> {
    try {
      // Flatten path for simplicty or maintain structure
      // Generates/userId/file.mp3 -> userId_file.mp3 to avoid nested folder complexity or just create folders
      const fileName = filePath.split('/').pop() || 'audio.mp3';
      const distinctPath = filePath.replace(/\//g, '_');
      const finalPath = path.join(this.uploadDir, distinctPath);

      await fs.writeFile(finalPath, buffer);

      // Return valid URL
      const baseUrl = this.configService.get<string>('API_URL') || 'http://localhost:3001';
      // ServeStatic serves 'uploads' folder at '/uploads'
      return `${baseUrl}/uploads/${distinctPath}`;
    } catch (error) {
      console.error('Local upload failed:', error);
      throw new HttpException('Failed to save file locally', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async uploadToCloudinary(
    buffer: Buffer,
    path: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video', // Cloudinary uses 'video' for audio files
          public_id: path.replace(/\.[^/.]+$/, ''), // Remove extension
          folder: 'nexlevel-speech',
        },
        (error, result: UploadApiResponse) => {
          if (error) {
            console.error('Cloudinary Error:', error);
            // Fallback to local if Cloudinary fails?
            // For now, reject
            reject(
              new HttpException(
                'Failed to upload file to Cloudinary',
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
            );
          } else {
            resolve(result.secure_url);
          }
        },
      );

      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  private async deleteFromCloudinary(url: string): Promise<void> {
    try {
      // Extract public_id from URL
      const regex = /\/nexlevel-speech\/(.+)\.[a-zA-Z]+$/;
      const match = url.match(regex);
      if (match && match[1]) {
        await cloudinary.uploader.destroy(`nexlevel-speech/${match[1]}`, {
          resource_type: 'video',
        });
      }
    } catch (error) {
      console.error('Failed to delete from Cloudinary:', error);
    }
  }

  private async uploadToS3(buffer: Buffer, path: string): Promise<string> {
    // S3 implementation would go here
    // For now, returning a placeholder - would use @aws-sdk/client-s3
    const bucket = this.configService.get<string>('AWS_S3_BUCKET');
    const region = this.configService.get<string>('AWS_S3_REGION');

    // Placeholder - actual S3 upload would be implemented here
    console.log(`Would upload to S3: ${bucket}/${path}`);
    return `https://${bucket}.s3.${region}.amazonaws.com/${path}`;
  }

  private async deleteFromS3(url: string): Promise<void> {
    // S3 delete implementation would go here
    console.log(`Would delete from S3: ${url}`);
  }
}
