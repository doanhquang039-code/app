import { User } from './user.entity';
export declare class SmartNotification {
    id: number;
    userId: number;
    title: string;
    message: string;
    type: string;
    severity: string;
    isRead: boolean;
    actionUrl: string;
    metadata: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
export declare class NotificationRule {
    id: number;
    userId: number;
    ruleName: string;
    ruleType: string;
    condition: string;
    action: string;
    isEnabled: boolean;
    frequency: string;
    notificationChannel: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
