import { ConfigService } from '@nestjs/config';
export declare class SendGridService {
    private configService;
    constructor(configService: ConfigService);
    sendEmail(to: string, subject: string, html: string, text?: string): Promise<void>;
    sendWelcomeEmail(to: string, name: string): Promise<void>;
    sendBudgetAlert(to: string, budgetName: string, percentage: number): Promise<void>;
    sendMonthlyReport(to: string, reportData: any): Promise<void>;
    sendPasswordReset(to: string, resetToken: string): Promise<void>;
    sendBulkEmails(recipients: string[], subject: string, html: string): Promise<void>;
    sendTemplateEmail(to: string, templateId: string, dynamicData: any): Promise<void>;
}
