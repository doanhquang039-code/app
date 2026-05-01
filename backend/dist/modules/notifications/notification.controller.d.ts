import { NotificationService } from './notification.service';
export declare class NotificationController {
    private notificationService;
    constructor(notificationService: NotificationService);
    getUserNotifications(userId: number): Promise<any[]>;
    getUnreadCount(userId: number): Promise<{
        count: number;
    }>;
    markAsRead(notificationId: number): Promise<{
        success: boolean;
    }>;
    markAllAsRead(userId: number): Promise<{
        success: boolean;
    }>;
    deleteNotification(notificationId: number): Promise<{
        success: boolean;
    }>;
    clearAll(userId: number): Promise<{
        success: boolean;
    }>;
    createNotification(data: any): Promise<import("../../entities/smart-notification.entity").SmartNotification>;
}
