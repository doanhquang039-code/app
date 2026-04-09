import { SmartNotificationsService } from './smart-notifications.service';
import { CreateNotificationRuleDto, UpdateNotificationRuleDto } from './dto/smart-notification.dto';
export declare class SmartNotificationsController {
    private readonly smartNotificationsService;
    constructor(smartNotificationsService: SmartNotificationsService);
    findAll(req: any, unreadOnly: boolean): Promise<import("../../entities/smart-notification.entity").SmartNotification[]>;
    getUnreadCount(req: any): Promise<{
        unreadCount: number;
    }>;
    getStats(req: any): Promise<any>;
    getNotificationTrends(req: any, days?: number): Promise<{
        trends: any;
    }>;
    getByType(type: string, req: any): Promise<import("../../entities/smart-notification.entity").SmartNotification[]>;
    findOne(id: string, req: any): Promise<import("../../entities/smart-notification.entity").SmartNotification | null>;
    markAsRead(id: string, req: any): Promise<import("../../entities/smart-notification.entity").SmartNotification | null>;
    markAllAsRead(req: any): Promise<void>;
    delete(id: string, req: any): Promise<void>;
    deleteOlderThan(days: string, req: any): Promise<void>;
    createRule(req: any, createRuleDto: CreateNotificationRuleDto): Promise<import("../../entities/smart-notification.entity").NotificationRule>;
    findAllRules(req: any): Promise<import("../../entities/smart-notification.entity").NotificationRule[]>;
    getActiveRules(req: any, ruleType?: string): Promise<import("../../entities/smart-notification.entity").NotificationRule[]>;
    findOneRule(id: string, req: any): Promise<import("../../entities/smart-notification.entity").NotificationRule | null>;
    updateRule(id: string, req: any, updateRuleDto: UpdateNotificationRuleDto): Promise<import("../../entities/smart-notification.entity").NotificationRule | null>;
    toggleRuleStatus(id: string, req: any, { isEnabled }: {
        isEnabled: boolean;
    }): Promise<import("../../entities/smart-notification.entity").NotificationRule | null>;
    deleteRule(id: string, req: any): Promise<void>;
}
