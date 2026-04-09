export declare class CreateSmartNotificationDto {
    title: string;
    message: string;
    type: string;
    severity?: string;
    actionUrl?: string;
    metadata?: string;
}
export declare class CreateNotificationRuleDto {
    ruleName: string;
    ruleType: string;
    condition: string;
    action?: string;
    isEnabled?: boolean;
    frequency?: string;
    notificationChannel?: string;
}
export declare class UpdateNotificationRuleDto {
    ruleName?: string;
    ruleType?: string;
    condition?: string;
    action?: string;
    isEnabled?: boolean;
    frequency?: string;
    notificationChannel?: string;
}
