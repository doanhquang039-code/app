import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
    this.bucketName = this.configService.get('AWS_S3_BUCKET') || 'expense-tracker-bucket';
  }

  async uploadFile(file: Buffer, key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await this.s3Client.send(command);
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }

  async uploadReceipt(userId: number, file: Buffer, filename: string): Promise<string> {
    const key = `receipts/${userId}/${Date.now()}-${filename}`;
    return await this.uploadFile(file, key, 'image/jpeg');
  }

  async uploadExport(userId: number, file: Buffer, filename: string, format: string): Promise<string> {
    const contentType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const key = `exports/${userId}/${Date.now()}-${filename}`;
    return await this.uploadFile(file, key, contentType);
  }

  async uploadAvatar(userId: number, file: Buffer, filename: string): Promise<string> {
    const key = `avatars/${userId}/${Date.now()}-${filename}`;
    return await this.uploadFile(file, key, 'image/jpeg');
  }

  async getFile(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const response = await this.s3Client.send(command);
    const stream = response.Body as any;
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  async listFiles(prefix: string): Promise<string[]> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: prefix,
    });

    const response = await this.s3Client.send(command);
    return response.Contents?.map(item => item.Key || '') || [];
  }

  async deleteUserFiles(userId: number): Promise<void> {
    const prefixes = [`receipts/${userId}/`, `exports/${userId}/`, `avatars/${userId}/`];

    for (const prefix of prefixes) {
      const files = await this.listFiles(prefix);
      for (const file of files) {
        await this.deleteFile(file);
      }
    }
  }
}
