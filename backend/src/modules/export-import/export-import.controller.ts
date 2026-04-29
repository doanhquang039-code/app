import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Res,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ExportImportService } from './export-import.service';
import { ExportDataDto, ImportDataDto, DataType } from './dto/export-data.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';

@ApiTags('Export/Import')
@ApiBearerAuth()
@Controller('export-import')
@UseGuards(JwtAuthGuard)
export class ExportImportController {
  constructor(private readonly exportImportService: ExportImportService) {}

  @Post('export')
  @ApiOperation({ summary: 'Xuất dữ liệu ra file (Excel, CSV, PDF, JSON)' })
  async exportData(@Request() req, @Body() dto: ExportDataDto) {
    return await this.exportImportService.exportData(req.user.userId, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Lấy lịch sử xuất file' })
  async getExportHistory(@Request() req) {
    return await this.exportImportService.getExportHistory(req.user.userId);
  }

  @Get('download/:exportId')
  @ApiOperation({ summary: 'Tải file đã xuất' })
  async downloadExport(
    @Request() req,
    @Param('exportId') exportId: number,
    @Res() res: Response,
  ) {
    const { filePath, fileName } = await this.exportImportService.downloadExport(
      req.user.userId,
      exportId,
    );

    res.download(filePath, fileName);
  }

  @Post('import')
  @ApiOperation({ summary: 'Nhập dữ liệu từ file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        dataType: {
          type: 'string',
          enum: ['TRANSACTIONS', 'BUDGETS', 'SAVINGS_GOALS', 'BILLS'],
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `import-${uniqueSuffix}${path.extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.xlsx', '.xls', '.csv', '.json'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
          cb(null, true);
        } else {
          cb(new Error('Chỉ chấp nhận file Excel, CSV hoặc JSON'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async importData(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Query('dataType') dataType: DataType,
  ) {
    return await this.exportImportService.importData(req.user.userId, file, dataType);
  }

  @Delete('cleanup')
  @ApiOperation({ summary: 'Xóa các file xuất đã hết hạn (Admin only)' })
  async cleanupOldExports() {
    const deletedCount = await this.exportImportService.cleanupOldExports();
    return {
      success: true,
      message: `Đã xóa ${deletedCount} file hết hạn`,
      deletedCount,
    };
  }
}
