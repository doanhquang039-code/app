import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(file: Buffer, folder: string, publicId?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'image',
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      uploadStream.end(file);
    });
  }

  async uploadReceipt(userId: number, file: Buffer): Promise<string> {
    const result = await this.uploadImage(file, `receipts/${userId}`);
    return result.secure_url;
  }

  async uploadAvatar(userId: number, file: Buffer): Promise<string> {
    const result = await this.uploadImage(file, `avatars`, `user_${userId}`);
    return result.secure_url;
  }

  async deleteImage(publicId: string): Promise<any> {
    return await cloudinary.uploader.destroy(publicId);
  }

  async getOptimizedUrl(publicId: string, width: number, height: number): Promise<string> {
    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
    });
  }

  async getThumbnail(publicId: string): Promise<string> {
    return cloudinary.url(publicId, {
      width: 200,
      height: 200,
      crop: 'thumb',
      gravity: 'face',
      quality: 'auto',
    });
  }
}
