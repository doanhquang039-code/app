import { Controller, Get, Param } from '@nestjs/common';
import { AdvancedDashboardService } from './advanced-dashboard.service';

@Controller('dashboard/advanced')
export class AdvancedDashboardController {
  constructor(private advancedDashboardService: AdvancedDashboardService) {}

  @Get(':userId')
  async getAdvancedDashboard(@Param('userId') userId: number) {
    return await this.advancedDashboardService.getAdvancedDashboard(userId);
  }

  @Get(':userId/realtime')
  async getRealTimeStats(@Param('userId') userId: number) {
    return await this.advancedDashboardService.getRealTimeStats(userId);
  }
}
