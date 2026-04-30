import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OCRService } from './ocr.service';

@ApiTags('ocr')
@ApiBearerAuth('JWT')
@Controller('ocr')
@UseGuards(JwtAuthGuard)
export class OCRController {
  constructor(private readonly ocrService: OCRService) {}

  @Post('scan-receipt')
  @ApiOperation({ summary: 'Scan hóa đơn từ ảnh' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async scanReceipt(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const receiptData = await this.ocrService.scanReceipt(file.buffer);
    return receiptData;
  }

  @Post('extract-text')
  @ApiOperation({ summary: 'Trích xuất text từ ảnh' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async extractText(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const text = await this.ocrService.extractTextFromImage(file.buffer);
    return { text };
  }
}
