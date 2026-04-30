export interface ReceiptData {
    merchantName?: string;
    date?: Date;
    totalAmount?: number;
    items?: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    confidence: number;
}
export declare class OCRService {
    scanReceipt(imageBuffer: Buffer): Promise<ReceiptData>;
    extractTextFromImage(imageBuffer: Buffer): Promise<string>;
    parseReceiptText(text: string): ReceiptData;
}
