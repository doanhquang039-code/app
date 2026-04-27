import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đăng ký mới' })
  async createSubscription(@Request() req, @Body() data: any) {
    return await this.subscriptionsService.createSubscription(req.user.userId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách đăng ký' })
  async getSubscriptions(@Request() req, @Query('status') status?: string) {
    return await this.subscriptionsService.getUserSubscriptions(req.user.userId, status);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê đăng ký' })
  async getStats(@Request() req) {
    return await this.subscriptionsService.getSubscriptionStats(req.user.userId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Lấy danh sách đăng ký sắp gia hạn' })
  async getUpcomingRenewals(@Request() req, @Query('days') days?: number) {
    return await this.subscriptionsService.getUpcomingRenewals(
      req.user.userId,
      days ? parseInt(days) : 30,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết đăng ký' })
  async getSubscription(@Request() req, @Param('id') id: number) {
    return await this.subscriptionsService.getSubscription(req.user.userId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật đăng ký' })
  async updateSubscription(@Request() req, @Param('id') id: number, @Body() data: any) {
    return await this.subscriptionsService.updateSubscription(req.user.userId, id, data);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Hủy đăng ký' })
  async cancelSubscription(@Request() req, @Param('id') id: number) {
    return await this.subscriptionsService.cancelSubscription(req.user.userId, id);
  }

  @Put(':id/pause')
  @ApiOperation({ summary: 'Tạm dừng đăng ký' })
  async pauseSubscription(@Request() req, @Param('id') id: number) {
    return await this.subscriptionsService.pauseSubscription(req.user.userId, id);
  }

  @Put(':id/resume')
  @ApiOperation({ summary: 'Tiếp tục đăng ký' })
  async resumeSubscription(@Request() req, @Param('id') id: number) {
    return await this.subscriptionsService.resumeSubscription(req.user.userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa đăng ký' })
  async deleteSubscription(@Request() req, @Param('id') id: number) {
    await this.subscriptionsService.deleteSubscription(req.user.userId, id);
    return { success: true, message: 'Đã xóa đăng ký' };
  }

  @Post(':id/payments')
  @ApiOperation({ summary: 'Ghi nhận thanh toán' })
  async recordPayment(@Request() req, @Param('id') id: number, @Body() data: any) {
    return await this.subscriptionsService.recordPayment(req.user.userId, id, data);
  }

  @Get(':id/payments')
  @ApiOperation({ summary: 'Lấy lịch sử thanh toán' })
  async getPaymentHistory(@Request() req, @Param('id') id: number) {
    return await this.subscriptionsService.getPaymentHistory(req.user.userId, id);
  }
}
