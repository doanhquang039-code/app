"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OCRService = void 0;
const common_1 = require("@nestjs/common");
const sharp_1 = __importDefault(require("sharp"));
let OCRService = class OCRService {
    async scanReceipt(imageBuffer) {
        const processedImage = await (0, sharp_1.default)(imageBuffer)
            .resize(1000, 1000, { fit: 'inside' })
            .grayscale()
            .normalize()
            .toBuffer();
        const mockData = {
            merchantName: 'Siêu thị ABC',
            date: new Date(),
            totalAmount: 150000,
            items: [
                { name: 'Gạo', quantity: 1, price: 50000 },
                { name: 'Thịt', quantity: 2, price: 80000 },
                { name: 'Rau', quantity: 1, price: 20000 },
            ],
            confidence: 0.85,
        };
        return mockData;
    }
    async extractTextFromImage(imageBuffer) {
        await (0, sharp_1.default)(imageBuffer)
            .resize(1000, 1000, { fit: 'inside' })
            .grayscale()
            .toBuffer();
        return 'Extracted text from image';
    }
    parseReceiptText(text) {
        const lines = text.split('\n');
        const data = {
            confidence: 0.7,
        };
        for (const line of lines) {
            const amountMatch = line.match(/(\d{1,3}(?:[,\.]\d{3})*(?:[,\.]\d{2})?)/);
            if (amountMatch) {
                data.totalAmount = parseFloat(amountMatch[1].replace(/[,\.]/g, ''));
            }
            const dateMatch = line.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
            if (dateMatch) {
                data.date = new Date(parseInt(dateMatch[3]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[1]));
            }
        }
        return data;
    }
};
exports.OCRService = OCRService;
exports.OCRService = OCRService = __decorate([
    (0, common_1.Injectable)()
], OCRService);
//# sourceMappingURL=ocr.service.js.map