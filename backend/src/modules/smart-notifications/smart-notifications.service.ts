import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmartNotification, NotificationRule } from '../../entities/smart-notification.entity';
import { CreateSmartNotificationDto, CreateNotificationRuleDto, UpdateNotificationRuleDto } from './dto/smart-notification.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class SmartNotificationsService {
  private readonly logger = new Logger(SmartNotificationsService.name);

  constructor(
    @InjectRepository(SmartNotification)
    private smartNotificationRepository: Repository<SmartNotification>,
    @InjectRepository(NotificationRule)
    private notificationRuleRepository: Repository<NotificationRule>,
    private mailerService: MailerService,
  ) {}

  // Smart Notifications Management
  async create(userId: number, createSmartNotificationDto: CreateSmartNotificationDto): Promise<SmartNotification> {
    const notification = this.smartNotificationRepository.create({
      ...createSmartNotificationDto,
      userId,
    });
    return this.smartNotificationRepository.save(notification);
  }

  async findAll(userId: number, unreadOnly = false): Promise<SmartNotification[]> {
    const query = this.smartNotificationRepository.createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId });

    if (unreadOnly) {
      query.andWhere('notification.isRead = :isRead', { isRead: false });
    }

    return query.orderBy('notification.createdAt', 'DESC').getMany();
  }

  async findOne(id: number, userId: number): Promise<SmartNotification | null> {
    return this.smartNotificationRepository.findOne({
      where: { id, userId },
    });
  }

  async markAsRead(id: number, userId: number): Promise<SmartNotification | null> {
    await this.smartNotificationRepository.update(
      { id, userId },
      { isRead: true, updatedAt: new Date() },
    );
    return this.findOne(id, userId);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.smartNotificationRepository.update(
      { userId, isRead: false },
      { isRead: true, updatedAt: new Date() },
    );
  }

  async delete(id: number, userId: number): Promise<void> {
    await this.smartNotificationRepository.delete({ id, userId });
  }

  async deleteOlderThan(userId: number, days: number): Promise<void> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    await this.smartNotificationRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId })
      .andWhere('createdAt < :date', { date })
      .execute();
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.smartNotificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  async getByType(userId: number, type: string): Promise<SmartNotification[]> {
    return this.smartNotificationRepository.find({
      where: { userId, type },
      order: { createdAt: 'DESC' },
    });
  }

  // Notification Rules Management
  async createRule(userId: number, createRuleDto: CreateNotificationRuleDto): Promise<NotificationRule> {
    const rule = this.notificationRuleRepository.create({
      ...createRuleDto,
      userId,
    });
    return this.notificationRuleRepository.save(rule);
  }

  async findAllRules(userId: number): Promise<NotificationRule[]> {
    return this.notificationRuleRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneRule(id: number, userId: number): Promise<NotificationRule | null> {
    return this.notificationRuleRepository.findOne({
      where: { id, userId },
    });
  }

  async updateRule(id: number, userId: number, updateRuleDto: UpdateNotificationRuleDto): Promise<NotificationRule | null> {
    await this.notificationRuleRepository.update(
      { id, userId },
      { ...updateRuleDto, updatedAt: new Date() },
    );
    return this.findOneRule(id, userId);
  }

  async deleteRule(id: number, userId: number): Promise<void> {
    await this.notificationRuleRepository.delete({ id, userId });
  }

  async toggleRuleStatus(id: number, userId: number, isEnabled: boolean): Promise<NotificationRule | null> {
    await this.notificationRuleRepository.update(
      { id, userId },
      { isEnabled, updatedAt: new Date() },
    );
    return this.findOneRule(id, userId);
  }

  async getActiveRules(userId: number, ruleType?: string): Promise<NotificationRule[]> {
    const query = this.notificationRuleRepository.createQueryBuilder('rule')
      .where('rule.userId = :userId', { userId })
      .andWhere('rule.isEnabled = :isEnabled', { isEnabled: true });

    if (ruleType) {
      query.andWhere('rule.ruleType = :ruleType', { ruleType });
    }

    return query.getMany();
  }

  // Notification Sending
  async sendNotification(
    userId: number,
    title: string,
    message: string,
    type: string,
    severity = 'INFO',
    actionUrl?: string,
    metadata?: Record<string, any>,
  ): Promise<SmartNotification> {
    const notification = await this.create(userId, {
      title,
      message,
      type,
      severity,
      actionUrl,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    });

    // Get rules and send via configured channels
    const rules = await this.getActiveRules(userId, type);
    for (const rule of rules) {
      await this.executeNotificationAction(userId, notification, rule);
    }

    return notification;
  }

  private async executeNotificationAction(userId: number, notification: SmartNotification, rule: NotificationRule): Promise<void> {
    try {
      const channel = rule.notificationChannel || 'IN_APP';

      switch (channel) {
        case 'EMAIL':
          await this.sendEmailNotification(userId, notification);
          break;
        case 'SMS':
          // TODO: Implement SMS service integration
          this.logger.log(`SMS notification queued for user ${userId}`);
          break;
        case 'PUSH':
          // TODO: Implement push notification service
          this.logger.log(`Push notification queued for user ${userId}`);
          break;
        case 'IN_APP':
        default:
          // Already saved to database
          break;
      }
    } catch (error) {
      this.logger.error(`Failed to send ${rule.notificationChannel} notification:`, error);
    }
  }

  private async sendEmailNotification(userId: number, notification: SmartNotification): Promise<void> {
    try {
      // TODO: Fetch user email from User entity
      // await this.mailerService.sendMail({
      //   to: userEmail,
      //   subject: notification.title,
      //   template: 'smart-notification',
      //   context: {
      //     title: notification.title,
      //     message: notification.message,
      //     actionUrl: notification.actionUrl,
      //   },
      // });
      this.logger.log(`Email notification sent for user ${userId}`);
    } catch (error) {
      this.logger.error('Failed to send email notification:', error);
    }
  }

  // Analytics
  async getNotificationStats(userId: number): Promise<any> {
    const total = await this.smartNotificationRepository.count({ where: { userId } });
    const unread = await this.getUnreadCount(userId);
    const byType = {};

    const notifications = await this.findAll(userId);
    notifications.forEach(notif => {
      byType[notif.type] = (byType[notif.type] || 0) + 1;
    });

    return {
      total,
      unread,
      read: total - unread,
      byType,
    };
  }

  async getNotificationTrends(userId: number, days = 7): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const notifications = await this.smartNotificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .andWhere('notification.createdAt >= :startDate', { startDate })
      .orderBy('notification.createdAt', 'ASC')
      .getMany();

    const trends = {};
    notifications.forEach(notif => {
      const date = notif.createdAt.toISOString().split('T')[0];
      trends[date] = (trends[date] || 0) + 1;
    });

    return trends;
  }
}
