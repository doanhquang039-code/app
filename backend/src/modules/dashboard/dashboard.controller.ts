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

  /** GET /dashboard – Full dashboard data (Flutter calls this) */
  @Get()
  getFullDashboard(@Request() req) {
    const userId: number = req.user.userId;
    return Promise.all([
      this.dashboardService.getOverview(userId),
      this.dashboardService.getRecentTransactions(userId, 10),
      this.dashboardService.getMonthlyComparison(userId),
    ]).then(([overview, recent, monthly]) => ({
      ...overview,
      recentTransactions: recent,
      monthlyComparison: monthly,
    }));
  }

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
