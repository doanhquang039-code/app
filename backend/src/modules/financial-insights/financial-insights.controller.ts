import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { FinancialInsightsService } from './financial-insights.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('financial-insights')
export class FinancialInsightsController {
  constructor(private financialInsightsService: FinancialInsightsService) {}

  @Get('spending-by-category')
  getSpendingByCategory(@Request() req, @Query('month') month?: string) {
    return this.financialInsightsService.getSpendingByCategory(
      req.user.userId,
      month,
    );
  }

  @Get('monthly-trend')
  getMonthlyTrend(@Request() req, @Query('months') months?: string) {
    return this.financialInsightsService.getMonthlyTrend(
      req.user.userId,
      months ? parseInt(months) : 6,
    );
  }

  @Get('recommendations')
  getRecommendations(@Request() req) {
    return this.financialInsightsService.getRecommendations(req.user.userId);
  }

  @Get('spending-forecast')
  getSpendingForecast(@Request() req, @Query('months') months?: string) {
    return this.financialInsightsService.getSpendingForecast(
      req.user.userId,
      months ? parseInt(months) : 3,
    );
  }

  @Get('summary')
  getFinancialSummary(@Request() req) {
    return this.financialInsightsService.getFinancialSummary(req.user.userId);
  }
}
