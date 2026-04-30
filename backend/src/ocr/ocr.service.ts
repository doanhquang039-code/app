import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

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

@Injectable()
export class OCRService {
  async scanReceipt(imageBuffer: Buffer): Promise<ReceiptData> {
    // Process image with sharp
    const processedImage = await sharp(imageBuffer)
      .resize(1000, 1000, { fit: 'inside' })
      .grayscale()
      .normalize()
      .toBuffer();

    // TODO: Integrate with real OCR service (Google Vision, AWS Textract, etc.)
    // For now, return mock data
    const mockData: ReceiptData = {
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

  async extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    // Process image
    await sharp(imageBuffer)
      .resize(1000, 1000, { fit: 'inside' })
      .grayscale()
      .toBuffer();

    // TODO: Integrate with OCR service
    return 'Extracted text from image';
  }

  parseReceiptText(text: string): ReceiptData {
    // Simple parsing logic (can be improved with ML)
    const lines = text.split('\n');
    const data: ReceiptData = {
      confidence: 0.7,
    };

    // Try to find total amount
    for (const line of lines) {
      const amountMatch = line.match(/(\d{1,3}(?:[,\.]\d{3})*(?:[,\.]\d{2})?)/);
      if (amountMatch) {
        data.totalAmount = parseFloat(
          amountMatch[1].replace(/[,\.]/g, ''),
        );
      }

      // Try to find date
      const dateMatch = line.match(
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
      );
      if (dateMatch) {
        data.date = new Date(
          parseInt(dateMatch[3]),
          parseInt(dateMatch[2]) - 1,
          parseInt(dateMatch[1]),
        );
      }
    }

    return data;
  }
}
