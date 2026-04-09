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
exports.SmartNotificationsController = void 0;
const common_1 = require("@nestjs/common");
const smart_notifications_service_1 = require("./smart-notifications.service");
const smart_notification_dto_1 = require("./dto/smart-notification.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let SmartNotificationsController = class SmartNotificationsController {
    smartNotificationsService;
    constructor(smartNotificationsService) {
        this.smartNotificationsService = smartNotificationsService;
    }
    findAll(req, unreadOnly) {
        return this.smartNotificationsService.findAll(req.user.id, unreadOnly === true);
    }
    async getUnreadCount(req) {
        const count = await this.smartNotificationsService.getUnreadCount(req.user.id);
        return { unreadCount: count };
    }
    async getStats(req) {
        const stats = await this.smartNotificationsService.getNotificationStats(req.user.id);
        return stats;
    }
    async getNotificationTrends(req, days = 7) {
        const trends = await this.smartNotificationsService.getNotificationTrends(req.user.id, days);
        return { trends };
    }
    getByType(type, req) {
        return this.smartNotificationsService.getByType(req.user.id, type);
    }
    findOne(id, req) {
        return this.smartNotificationsService.findOne(+id, req.user.id);
    }
    markAsRead(id, req) {
        return this.smartNotificationsService.markAsRead(+id, req.user.id);
    }
    markAllAsRead(req) {
        return this.smartNotificationsService.markAllAsRead(req.user.id);
    }
    delete(id, req) {
        return this.smartNotificationsService.delete(+id, req.user.id);
    }
    deleteOlderThan(days, req) {
        return this.smartNotificationsService.deleteOlderThan(req.user.id, +days);
    }
    createRule(req, createRuleDto) {
        return this.smartNotificationsService.createRule(req.user.id, createRuleDto);
    }
    findAllRules(req) {
        return this.smartNotificationsService.findAllRules(req.user.id);
    }
    getActiveRules(req, ruleType) {
        return this.smartNotificationsService.getActiveRules(req.user.id, ruleType);
    }
    findOneRule(id, req) {
        return this.smartNotificationsService.findOneRule(+id, req.user.id);
    }
    updateRule(id, req, updateRuleDto) {
        return this.smartNotificationsService.updateRule(+id, req.user.id, updateRuleDto);
    }
    toggleRuleStatus(id, req, { isEnabled }) {
        return this.smartNotificationsService.toggleRuleStatus(+id, req.user.id, isEnabled);
    }
    deleteRule(id, req) {
        return this.smartNotificationsService.deleteRule(+id, req.user.id);
    }
};
exports.SmartNotificationsController = SmartNotificationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('unreadOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean]),
    __metadata("design:returntype", void 0)
], SmartNotificationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats/unread-count'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SmartNotificationsController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Get)('stats/notification-stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SmartNotificationsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('stats/trends'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], SmartNotificationsController.prototype, "getNotificationTrends", null);
__decorate([
    (0, common_1.Get)('type/:type'),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SmartNotificationsController.prototype, "getByType", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SmartNotificationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id/read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SmartNotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Put)('all/read'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SmartNotificationsController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SmartNotificationsController.prototype, "delete", null);
__decorate([
    (0, common_1.Delete)('old/:days'),
    __param(0, (0, common_1.Param)('days')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SmartNotificationsController.prototype, "deleteOlderThan", null);
__decorate([
    (0, common_1.Post)('rules'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, smart_notification_dto_1.CreateNotificationRuleDto]),
    __metadata("design:returntype", void 0)
], SmartNotificationsController.prototype, "createRule", null);
__decorate([
    (0, common_1.Get)('rules/all'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SmartNotificationsController.prototype, "findAllRules", null);
__decorate([
    (0, common_1.Get)('rules/active'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('ruleType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SmartNotificationsController.prototype, "getActiveRules", null);
__decorate([
    (0, common_1.Get)('rules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SmartNotificationsController.prototype, "findOneRule", null);
__decorate([
    (0, common_1.Put)('rules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, smart_notification_dto_1.UpdateNotificationRuleDto]),
    __metadata("design:returntype", void 0)
], SmartNotificationsController.prototype, "updateRule", null);
__decorate([
    (0, common_1.Put)('rules/:id/toggle'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], SmartNotificationsController.prototype, "toggleRuleStatus", null);
__decorate([
    (0, common_1.Delete)('rules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SmartNotificationsController.prototype, "deleteRule", null);
exports.SmartNotificationsController = SmartNotificationsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('smart-notifications'),
    __metadata("design:paramtypes", [smart_notifications_service_1.SmartNotificationsService])
], SmartNotificationsController);
//# sourceMappingURL=smart-notifications.controller.js.map