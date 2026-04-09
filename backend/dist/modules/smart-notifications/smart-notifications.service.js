"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SmartNotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartNotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const smart_notification_entity_1 = require("../../entities/smart-notification.entity");
const mailer_1 = require("@nestjs-modules/mailer");
let SmartNotificationsService = SmartNotificationsService_1 = class SmartNotificationsService {
    smartNotificationRepository;
    notificationRuleRepository;
    mailerService;
    logger = new common_1.Logger(SmartNotificationsService_1.name);
    constructor(smartNotificationRepository, notificationRuleRepository, mailerService) {
        this.smartNotificationRepository = smartNotificationRepository;
        this.notificationRuleRepository = notificationRuleRepository;
        this.mailerService = mailerService;
    }
    async create(userId, createSmartNotificationDto) {
        const notification = this.smartNotificationRepository.create({
            ...createSmartNotificationDto,
            userId,
        });
        return this.smartNotificationRepository.save(notification);
    }
    async findAll(userId, unreadOnly = false) {
        const query = this.smartNotificationRepository.createQueryBuilder('notification')
            .where('notification.userId = :userId', { userId });
        if (unreadOnly) {
            query.andWhere('notification.isRead = :isRead', { isRead: false });
        }
        return query.orderBy('notification.createdAt', 'DESC').getMany();
    }
    async findOne(id, userId) {
        return this.smartNotificationRepository.findOne({
            where: { id, userId },
        });
    }
    async markAsRead(id, userId) {
        await this.smartNotificationRepository.update({ id, userId }, { isRead: true, updatedAt: new Date() });
        return this.findOne(id, userId);
    }
    async markAllAsRead(userId) {
        await this.smartNotificationRepository.update({ userId, isRead: false }, { isRead: true, updatedAt: new Date() });
    }
    async delete(id, userId) {
        await this.smartNotificationRepository.delete({ id, userId });
    }
    async deleteOlderThan(userId, days) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        await this.smartNotificationRepository
            .createQueryBuilder()
            .delete()
            .where('userId = :userId', { userId })
            .andWhere('createdAt < :date', { date })
            .execute();
    }
    async getUnreadCount(userId) {
        return this.smartNotificationRepository.count({
            where: { userId, isRead: false },
        });
    }
    async getByType(userId, type) {
        return this.smartNotificationRepository.find({
            where: { userId, type },
            order: { createdAt: 'DESC' },
        });
    }
    async createRule(userId, createRuleDto) {
        const rule = this.notificationRuleRepository.create({
            ...createRuleDto,
            userId,
        });
        return this.notificationRuleRepository.save(rule);
    }
    async findAllRules(userId) {
        return this.notificationRuleRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async findOneRule(id, userId) {
        return this.notificationRuleRepository.findOne({
            where: { id, userId },
        });
    }
    async updateRule(id, userId, updateRuleDto) {
        await this.notificationRuleRepository.update({ id, userId }, { ...updateRuleDto, updatedAt: new Date() });
        return this.findOneRule(id, userId);
    }
    async deleteRule(id, userId) {
        await this.notificationRuleRepository.delete({ id, userId });
    }
    async toggleRuleStatus(id, userId, isEnabled) {
        await this.notificationRuleRepository.update({ id, userId }, { isEnabled, updatedAt: new Date() });
        return this.findOneRule(id, userId);
    }
    async getActiveRules(userId, ruleType) {
        const query = this.notificationRuleRepository.createQueryBuilder('rule')
            .where('rule.userId = :userId', { userId })
            .andWhere('rule.isEnabled = :isEnabled', { isEnabled: true });
        if (ruleType) {
            query.andWhere('rule.ruleType = :ruleType', { ruleType });
        }
        return query.getMany();
    }
    async sendNotification(userId, title, message, type, severity = 'INFO', actionUrl, metadata) {
        const notification = await this.create(userId, {
            title,
            message,
            type,
            severity,
            actionUrl,
            metadata: metadata ? JSON.stringify(metadata) : undefined,
        });
        const rules = await this.getActiveRules(userId, type);
        for (const rule of rules) {
            await this.executeNotificationAction(userId, notification, rule);
        }
        return notification;
    }
    async executeNotificationAction(userId, notification, rule) {
        try {
            const channel = rule.notificationChannel || 'IN_APP';
            switch (channel) {
                case 'EMAIL':
                    await this.sendEmailNotification(userId, notification);
                    break;
                case 'SMS':
                    this.logger.log(`SMS notification queued for user ${userId}`);
                    break;
                case 'PUSH':
                    this.logger.log(`Push notification queued for user ${userId}`);
                    break;
                case 'IN_APP':
                default:
                    break;
            }
        }
        catch (error) {
            this.logger.error(`Failed to send ${rule.notificationChannel} notification:`, error);
        }
    }
    async sendEmailNotification(userId, notification) {
        try {
            this.logger.log(`Email notification sent for user ${userId}`);
        }
        catch (error) {
            this.logger.error('Failed to send email notification:', error);
        }
    }
    async getNotificationStats(userId) {
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
    async getNotificationTrends(userId, days = 7) {
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
};
exports.SmartNotificationsService = SmartNotificationsService;
exports.SmartNotificationsService = SmartNotificationsService = SmartNotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(smart_notification_entity_1.SmartNotification)),
    __param(1, (0, typeorm_1.InjectRepository)(smart_notification_entity_1.NotificationRule)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        mailer_1.MailerService])
], SmartNotificationsService);
//# sourceMappingURL=smart-notifications.service.js.map