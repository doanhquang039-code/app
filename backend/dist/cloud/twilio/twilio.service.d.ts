import { ConfigService } from '@nestjs/config';
export declare class TwilioService {
    private configService;
    private client;
    private fromNumber;
    constructor(configService: ConfigService);
    sendSMS(to: string, message: string): Promise<any>;
    sendBudgetAlertSMS(to: string, budgetName: string, percentage: number): Promise<any>;
    sendTransactionAlertSMS(to: string, amount: number, merchant: string): Promise<any>;
    sendVerificationCode(to: string, code: string): Promise<any>;
    sendBulkSMS(recipients: string[], message: string): Promise<any[]>;
    makeCall(to: string, message: string): Promise<any>;
    sendWhatsApp(to: string, message: string): Promise<any>;
}
