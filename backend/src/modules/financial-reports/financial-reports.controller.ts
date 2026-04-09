import { Controller, Get, Post, Delete, Param, UseGuards, Request, Query } from '@nestjs/common';
import { FinancialReportsService } from './financial-reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('financial-reports')
export class FinancialReportsController {
  constructor(private readonly reportsService: FinancialReportsService) {}

  @Post('monthly')
  generateMonthly(@Request() req, @Query('month') month: number, @Query('year') year: number) {
    return this.reportsService.generateMonthlyReport(req.user.id, month, year);
  }

  @Post('quarterly')
  generateQuarterly(@Request() req, @Query('quarter') quarter: number, @Query('year') year: number) {
    return this.reportsService.generateQuarterlyReport(req.user.id, quarter, year);
  }

  @Post('yearly')
  generateYearly(@Request() req, @Query('year') year: number) {
    return this.reportsService.generateYearlyReport(req.user.id, year);
  }

  @Get()
  getReports(@Request() req, @Query('reportType') reportType?: string) {
    return this.reportsService.getReportsByUser(req.user.id, reportType);
  }

  @Get(':id')
  getReport(@Param('id') id: string, @Request() req) {
    return this.reportsService.getReport(+id, req.user.id);
  }

  @Get(':id/export/json')
  exportAsJSON(@Param('id') id: string, @Request() req) {
    return this.reportsService.exportReportAsJSON(+id, req.user.id);
  }

  @Get(':id/export/csv')
  async exportAsCSV(@Param('id') id: string, @Request() req) {
    const csv = await this.reportsService.exportReportAsCSV(+id, req.user.id);
    return { csv };
  }

  @Delete(':id')
  deleteReport(@Param('id') id: string, @Request() req) {
    return this.reportsService.deleteReport(+id, req.user.id);
  }
}
