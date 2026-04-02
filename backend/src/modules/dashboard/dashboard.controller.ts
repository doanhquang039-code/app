import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  getOverview(@Request() req) {
    return this.dashboardService.getOverview(req.user.userId);
  }

  @Get('recent')
  getRecentTransactions(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    return this.dashboardService.getRecentTransactions(
      req.user.userId,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('by-category')
  getExpenseByCategory(
    @Request() req,
    @Query('month') month: string,
  ) {
    return this.dashboardService.getExpenseByCategory(req.user.userId, month);
  }

  @Get('daily-trend')
  getDailyTrend(@Request() req, @Query('month') month: string) {
    return this.dashboardService.getDailyTrend(req.user.userId, month);
  }

  @Get('monthly-comparison')
  getMonthlyComparison(@Request() req) {
    return this.dashboardService.getMonthlyComparison(req.user.userId);
  }
}
