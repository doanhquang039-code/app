import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  Res,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ExportService } from './export.service';

@ApiTags('export')
@ApiBearerAuth('JWT')
@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('excel')
  @ApiOperation({ summary: 'Export dữ liệu ra Excel' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async exportExcel(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }

    const buffer = await this.exportService.exportToExcel(
      req.user.userId,
      new Date(startDate),
      new Date(endDate),
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=transactions_${Date.now()}.xlsx`,
    );
    res.send(buffer);
  }

  @Get('pdf')
  @ApiOperation({ summary: 'Export dữ liệu ra PDF' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async exportPDF(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }

    const buffer = await this.exportService.exportToPDF(
      req.user.userId,
      new Date(startDate),
      new Date(endDate),
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=transactions_${Date.now()}.pdf`,
    );
    res.send(buffer);
  }

  @Get('csv')
  @ApiOperation({ summary: 'Export dữ liệu ra CSV' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async exportCSV(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }

    const csv = await this.exportService.exportToCSV(
      req.user.userId,
      new Date(startDate),
      new Date(endDate),
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=transactions_${Date.now()}.csv`,
    );
    res.send(csv);
  }
}
