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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OCRController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const ocr_service_1 = require("./ocr.service");
let OCRController = class OCRController {
    ocrService;
    constructor(ocrService) {
        this.ocrService = ocrService;
    }
    async scanReceipt(file) {
        if (!file) {
            throw new common_1.BadRequestException('No image file provided');
        }
        const receiptData = await this.ocrService.scanReceipt(file.buffer);
        return receiptData;
    }
    async extractText(file) {
        if (!file) {
            throw new common_1.BadRequestException('No image file provided');
        }
        const text = await this.ocrService.extractTextFromImage(file.buffer);
        return { text };
    }
};
exports.OCRController = OCRController;
__decorate([
    (0, common_1.Post)('scan-receipt'),
    (0, swagger_1.ApiOperation)({ summary: 'Scan hóa đơn từ ảnh' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OCRController.prototype, "scanReceipt", null);
__decorate([
    (0, common_1.Post)('extract-text'),
    (0, swagger_1.ApiOperation)({ summary: 'Trích xuất text từ ảnh' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OCRController.prototype, "extractText", null);
exports.OCRController = OCRController = __decorate([
    (0, swagger_1.ApiTags)('ocr'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.Controller)('ocr'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [ocr_service_1.OCRService])
], OCRController);
//# sourceMappingURL=ocr.controller.js.map