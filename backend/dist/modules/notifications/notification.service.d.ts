import { Repository } from 'typeorm';
import { SmartNotification } from '../../entities/smart-notification.entity';
export declare class NotificationService {
    private notificationRepo;
    constructor(notificationRepo: Repository<SmartNotification>);
    getUserNotifications(userId: number): Promise<any[]>;
    markAsRead(notificationId: number): Promise<void>;
    markAllAsRead(userId: number): Promise<void>;
    deleteNotification(notificationId: number): Promise<void>;
    clearAll(userId: number): Promise<void>;
    createNotification(data: {
        userId: number;
        type: string;
        title: string;
        message: string;
        priority?: number;
    }): Promise<SmartNotification>;
    getUnreadCount(userId: number): Promise<number>;
}
