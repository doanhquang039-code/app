import { Controller, Get, Post, Body, Param, Put, UseGuards, Request, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CreateForecastDto } from './dto/analytics.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('daily/:date')
  generateDaily(@Param('date') date: string, @Request() req) {
    return this.analyticsService.generateDailyAnalytics(req.user.id, new Date(date));
  }

  @Post('weekly/:startDate')
  generateWeekly(@Param('startDate') startDate: string, @Request() req) {
    return this.analyticsService.generateWeeklyAnalytics(req.user.id, new Date(startDate));
  }

  @Post('monthly')
  generateMonthly(@Request() req, @Query('month') month: number, @Query('year') year: number) {
    return this.analyticsService.generateMonthlyAnalytics(req.user.id, month, year);
  }

  @Get('range')
  getAnalyticsRange(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('period') period: string = 'monthly',
  ) {
    return this.analyticsService.getAnalyticsRange(req.user.id, new Date(startDate), new Date(endDate), period);
  }

  @Get('compare-months')
  compareMonths(
    @Request() req,
    @Query('currentMonth') currentMonth: number,
    @Query('currentYear') currentYear: number,
    @Query('previousMonth') previousMonth: number,
    @Query('previousYear') previousYear: number,
  ) {
    return this.analyticsService.compareMonths(
      req.user.id,
      currentMonth,
      currentYear,
      previousMonth,
      previousYear,
    );
  }

  @Get('spending-trend')
  getSpendingTrend(@Request() req, @Query('days') days: number = 30) {
    return this.analyticsService.getSpendingTrend(req.user.id, days);
  }

  @Get('predicted-expense')
  async getPredictedExpense(@Request() req) {
    const predicted = await this.analyticsService.getPredictedMonthlyExpense(req.user.id);
    return { predictedMonthlyExpense: predicted };
  }

  @Post('forecast')
  createForecast(@Request() req, @Body() createForecastDto: CreateForecastDto) {
    return this.analyticsService.createForecast(req.user.id, createForecastDto);
  }

  @Get('forecast')
  getForecastsForMonth(@Request() req, @Query('month') month: number, @Query('year') year: number) {
    return this.analyticsService.getForecastsForMonth(req.user.id, month, year);
  }

  @Put('forecast/:id')
  updateForecast(
    @Param('id') id: string,
    @Request() req,
    @Body() { actualAmount }: { actualAmount: number },
  ) {
    return this.analyticsService.updateForecastWithActual(+id, req.user.id, actualAmount);
  }
}
