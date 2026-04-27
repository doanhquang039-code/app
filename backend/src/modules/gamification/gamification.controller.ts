import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Query,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GamificationService } from './gamification.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Gamification')
@ApiBearerAuth()
@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê điểm và cấp độ của user' })
  async getUserStats(@Request() req) {
    return await this.gamificationService.getUserStats(req.user.userId);
  }

  @Post('daily-login')
  @ApiOperation({ summary: 'Cập nhật chuỗi đăng nhập hàng ngày' })
  async updateDailyStreak(@Request() req) {
    const result = await this.gamificationService.updateDailyStreak(req.user.userId);
    
    if (result.pointsAwarded > 0) {
      await this.gamificationService.awardPoints(req.user.userId, 'DAILY_LOGIN');
    }

    return {
      success: true,
      streak: result.streak,
      pointsAwarded: result.pointsAwarded,
      message: `Chuỗi đăng nhập: ${result.streak} ngày`,
    };
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Lấy bảng xếp hạng' })
  async getLeaderboard(@Query('limit') limit?: number) {
    const leaderboard = await this.gamificationService.getLeaderboard(limit || 50);
    
    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      username: entry.user?.username || 'Unknown',
      totalPoints: entry.totalPoints,
      level: entry.level,
      rankTitle: entry.rank,
      dailyStreak: entry.dailyStreak,
    }));
  }

  @Get('points-history')
  @ApiOperation({ summary: 'Lấy lịch sử điểm' })
  async getPointsHistory(@Request() req, @Query('limit') limit?: number) {
    return await this.gamificationService.getPointsHistory(
      req.user.userId,
      limit || 50,
    );
  }

  @Get('achievements')
  @ApiOperation({ summary: 'Lấy danh sách thành tích của user' })
  async getUserAchievements(@Request() req) {
    return await this.gamificationService.getUserAchievements(req.user.userId);
  }

  @Get('achievements/all')
  @ApiOperation({ summary: 'Lấy tất cả thành tích có thể đạt được' })
  async getAllAchievements() {
    return await this.gamificationService.getAllAchievements();
  }

  @Post('seed-achievements')
  @ApiOperation({ summary: 'Khởi tạo dữ liệu thành tích (Admin only)' })
  async seedAchievements() {
    await this.gamificationService.seedAchievements();
    return {
      success: true,
      message: 'Đã khởi tạo thành tích thành công',
    };
  }

  @Post('check-achievements')
  @ApiOperation({ summary: 'Kiểm tra và cập nhật thành tích' })
  async checkAchievements(@Request() req) {
    await this.gamificationService.checkAchievements(req.user.userId);
    return {
      success: true,
      message: 'Đã kiểm tra thành tích',
    };
  }
}
