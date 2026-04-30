import { ConfigService } from '@nestjs/config';
export declare class CloudinaryService {
    private configService;
    constructor(configService: ConfigService);
    uploadImage(file: Buffer, folder: string, publicId?: string): Promise<any>;
    uploadReceipt(userId: number, file: Buffer): Promise<string>;
    uploadAvatar(userId: number, file: Buffer): Promise<string>;
    deleteImage(publicId: string): Promise<any>;
    getOptimizedUrl(publicId: string, width: number, height: number): Promise<string>;
    getThumbnail(publicId: string): Promise<string>;
}
