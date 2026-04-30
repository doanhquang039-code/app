"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
let S3Service = class S3Service {
    configService;
    s3Client;
    bucketName;
    constructor(configService) {
        this.configService = configService;
        this.s3Client = new client_s3_1.S3Client({
            region: this.configService.get('AWS_REGION') || 'us-east-1',
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
                secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
            },
        });
        this.bucketName = this.configService.get('AWS_S3_BUCKET') || 'expense-tracker-bucket';
    }
    async uploadFile(file, key, contentType) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file,
            ContentType: contentType,
        });
        await this.s3Client.send(command);
        return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
    }
    async uploadReceipt(userId, file, filename) {
        const key = `receipts/${userId}/${Date.now()}-${filename}`;
        return await this.uploadFile(file, key, 'image/jpeg');
    }
    async uploadExport(userId, file, filename, format) {
        const contentType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const key = `exports/${userId}/${Date.now()}-${filename}`;
        return await this.uploadFile(file, key, contentType);
    }
    async uploadAvatar(userId, file, filename) {
        const key = `avatars/${userId}/${Date.now()}-${filename}`;
        return await this.uploadFile(file, key, 'image/jpeg');
    }
    async getFile(key) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        const response = await this.s3Client.send(command);
        const stream = response.Body;
        const chunks = [];
        return new Promise((resolve, reject) => {
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks)));
        });
    }
    async getSignedUrl(key, expiresIn = 3600) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        return await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
    }
    async deleteFile(key) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        await this.s3Client.send(command);
    }
    async listFiles(prefix) {
        const command = new client_s3_1.ListObjectsV2Command({
            Bucket: this.bucketName,
            Prefix: prefix,
        });
        const response = await this.s3Client.send(command);
        return response.Contents?.map(item => item.Key || '') || [];
    }
    async deleteUserFiles(userId) {
        const prefixes = [`receipts/${userId}/`, `exports/${userId}/`, `avatars/${userId}/`];
        for (const prefix of prefixes) {
            const files = await this.listFiles(prefix);
            for (const file of files) {
                await this.deleteFile(file);
            }
        }
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3Service);
//# sourceMappingURL=s3.service.js.map