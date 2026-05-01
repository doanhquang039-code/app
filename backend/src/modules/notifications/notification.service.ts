import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmartNotification } from '../../entities/smart-notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(SmartNotification)
    private notificationRepo: Repository<SmartNotification>,
  ) {}

  async getUserNotifications(userId: number): Promise<any[]> {
    const notifications = await this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    return notifications.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      timestamp: n.createdAt,
      read: n.isRead,
      priority: n.severity === 'DANGER' ? 9 : n.severity === 'WARNING' ? 7 : 5,
    }));
  }

  async markAsRead(notificationId: number): Promise<void> {
    await this.notificationRepo.update(notificationId, { isRead: true });
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepo.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  async deleteNotification(notificationId: number): Promise<void> {
    await this.notificationRepo.delete(notificationId);
  }

  async clearAll(userId: number): Promise<void> {
    await this.notificationRepo.delete({ userId });
  }

  async createNotification(data: {
    userId: number;
    type: string;
    title: string;
    message: string;
    priority?: number;
  }): Promise<SmartNotification> {
    const severity = data.priority && data.priority >= 8 ? 'DANGER' : data.priority && data.priority >= 6 ? 'WARNING' : 'INFO';
    
    const notification = this.notificationRepo.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      severity,
      isRead: false,
    });

    return await this.notificationRepo.save(notification);
  }

  async getUnreadCount(userId: number): Promise<number> {
    return await this.notificationRepo.count({
      where: { userId, isRead: false },
    });
  }
}
