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
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
let CloudinaryService = class CloudinaryService {
    configService;
    constructor(configService) {
        this.configService = configService;
        cloudinary_1.v2.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
        });
    }
    async uploadImage(file, folder, publicId) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder,
                public_id: publicId,
                resource_type: 'image',
                transformation: [
                    { width: 1000, height: 1000, crop: 'limit' },
                    { quality: 'auto' },
                    { fetch_format: 'auto' },
                ],
            }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
            uploadStream.end(file);
        });
    }
    async uploadReceipt(userId, file) {
        const result = await this.uploadImage(file, `receipts/${userId}`);
        return result.secure_url;
    }
    async uploadAvatar(userId, file) {
        const result = await this.uploadImage(file, `avatars`, `user_${userId}`);
        return result.secure_url;
    }
    async deleteImage(publicId) {
        return await cloudinary_1.v2.uploader.destroy(publicId);
    }
    async getOptimizedUrl(publicId, width, height) {
        return cloudinary_1.v2.url(publicId, {
            width,
            height,
            crop: 'fill',
            quality: 'auto',
            fetch_format: 'auto',
        });
    }
    async getThumbnail(publicId) {
        return cloudinary_1.v2.url(publicId, {
            width: 200,
            height: 200,
            crop: 'thumb',
            gravity: 'face',
            quality: 'auto',
        });
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map