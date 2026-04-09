"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartNotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const smart_notification_entity_1 = require("../../entities/smart-notification.entity");
const smart_notifications_service_1 = require("./smart-notifications.service");
const smart_notifications_controller_1 = require("./smart-notifications.controller");
let SmartNotificationsModule = class SmartNotificationsModule {
};
exports.SmartNotificationsModule = SmartNotificationsModule;
exports.SmartNotificationsModule = SmartNotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([smart_notification_entity_1.SmartNotification, smart_notification_entity_1.NotificationRule])],
        controllers: [smart_notifications_controller_1.SmartNotificationsController],
        providers: [smart_notifications_service_1.SmartNotificationsService],
        exports: [smart_notifications_service_1.SmartNotificationsService],
    })
], SmartNotificationsModule);
//# sourceMappingURL=smart-notifications.module.js.map