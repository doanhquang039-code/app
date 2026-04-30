import { ConfigService } from '@nestjs/config';
export declare class S3Service {
    private configService;
    private s3Client;
    private bucketName;
    constructor(configService: ConfigService);
    uploadFile(file: Buffer, key: string, contentType: string): Promise<string>;
    uploadReceipt(userId: number, file: Buffer, filename: string): Promise<string>;
    uploadExport(userId: number, file: Buffer, filename: string, format: string): Promise<string>;
    uploadAvatar(userId: number, file: Buffer, filename: string): Promise<string>;
    getFile(key: string): Promise<Buffer>;
    getSignedUrl(key: string, expiresIn?: number): Promise<string>;
    deleteFile(key: string): Promise<void>;
    listFiles(prefix: string): Promise<string[]>;
    deleteUserFiles(userId: number): Promise<void>;
}
