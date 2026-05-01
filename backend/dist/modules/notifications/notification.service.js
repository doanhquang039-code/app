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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const smart_notification_entity_1 = require("../../entities/smart-notification.entity");
let NotificationService = class NotificationService {
    notificationRepo;
    constructor(notificationRepo) {
        this.notificationRepo = notificationRepo;
    }
    async getUserNotifications(userId) {
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
    async markAsRead(notificationId) {
        await this.notificationRepo.update(notificationId, { isRead: true });
    }
    async markAllAsRead(userId) {
        await this.notificationRepo.update({ userId, isRead: false }, { isRead: true });
    }
    async deleteNotification(notificationId) {
        await this.notificationRepo.delete(notificationId);
    }
    async clearAll(userId) {
        await this.notificationRepo.delete({ userId });
    }
    async createNotification(data) {
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
    async getUnreadCount(userId) {
        return await this.notificationRepo.count({
            where: { userId, isRead: false },
        });
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(smart_notification_entity_1.SmartNotification)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NotificationService);
//# sourceMappingURL=notification.service.js.map