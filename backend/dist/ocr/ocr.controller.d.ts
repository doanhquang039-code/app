import { OCRService } from './ocr.service';
export declare class OCRController {
    private readonly ocrService;
    constructor(ocrService: OCRService);
    scanReceipt(file: Express.Multer.File): Promise<import("./ocr.service").ReceiptData>;
    extractText(file: Express.Multer.File): Promise<{
        text: string;
    }>;
}
