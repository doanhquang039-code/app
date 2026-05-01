import { Controller, Get, Post, Delete, Param, Body, Patch } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get(':userId')
  async getUserNotifications(@Param('userId') userId: number) {
    return await this.notificationService.getUserNotifications(userId);
  }

  @Get(':userId/unread-count')
  async getUnreadCount(@Param('userId') userId: number) {
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Patch(':notificationId/read')
  async markAsRead(@Param('notificationId') notificationId: number) {
    await this.notificationService.markAsRead(notificationId);
    return { success: true };
  }

  @Patch(':userId/read-all')
  async markAllAsRead(@Param('userId') userId: number) {
    await this.notificationService.markAllAsRead(userId);
    return { success: true };
  }

  @Delete(':notificationId')
  async deleteNotification(@Param('notificationId') notificationId: number) {
    await this.notificationService.deleteNotification(notificationId);
    return { success: true };
  }

  @Delete(':userId/clear-all')
  async clearAll(@Param('userId') userId: number) {
    await this.notificationService.clearAll(userId);
    return { success: true };
  }

  @Post()
  async createNotification(@Body() data: any) {
    return await this.notificationService.createNotification(data);
  }
}
