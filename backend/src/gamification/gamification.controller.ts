import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GamificationService } from './gamification.service';

@ApiTags('gamification')
@ApiBearerAuth('JWT')
@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê gamification của user' })
  async getStats(@Request() req) {
    return this.gamificationService.getUserStats(req.user.userId);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Lấy bảng xếp hạng' })
  async getLeaderboard(@Query('limit') limit?: number) {
    return this.gamificationService.getLeaderboard(limit || 10);
  }

  @Get('achievements')
  @ApiOperation({ summary: 'Kiểm tra achievements mới' })
  async checkAchievements(@Request() req) {
    return this.gamificationService.checkAchievements(req.user.userId);
  }
}
