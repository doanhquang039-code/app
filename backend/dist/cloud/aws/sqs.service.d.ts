import { ConfigService } from '@nestjs/config';
export declare class SQSService {
    private configService;
    private sqsClient;
    private queueUrl;
    constructor(configService: ConfigService);
    sendMessage(message: any, delaySeconds?: number): Promise<string>;
    receiveMessages(maxMessages?: number): Promise<any[]>;
    deleteMessage(receiptHandle: string): Promise<void>;
    queueEmailJob(userId: number, emailType: string, data: any): Promise<string>;
    queueReportJob(userId: number, reportType: string, params: any): Promise<string>;
    queueAnalyticsJob(userId: number, period: string): Promise<string>;
    queueBackupJob(userId: number): Promise<string>;
}
