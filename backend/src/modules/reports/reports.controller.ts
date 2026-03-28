import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { Response } from 'express';
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('excel')
  async exportExcel(
    @Request() req,
    @Query('from') from: string,
    @Query('to') to: string,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.exportExcel(req.user.id, from, to);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=bao-cao-chi-tieu.xlsx',
    );
    res.send(buffer);
  }

  @Get('pdf')
  async exportPdf(
    @Request() req,
    @Query('from') from: string,
    @Query('to') to: string,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.exportPdf(req.user.id, from, to);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=bao-cao-chi-tieu.pdf',
    );
    res.send(buffer);
  }
}
