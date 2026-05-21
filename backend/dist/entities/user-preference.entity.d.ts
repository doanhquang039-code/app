export declare class UserPreference {
    id: number;
    user_id: number;
    theme: string;
    language: string;
    currency: string;
    date_format: string;
    time_format: string;
    notification_email: boolean;
    notification_sms: boolean;
    notification_push: boolean;
    notification_in_app: boolean;
    budget_alert_threshold: number;
    low_balance_alert: number;
    weekly_report: boolean;
    monthly_report: boolean;
    created_at: Date;
    updated_at: Date;
}
