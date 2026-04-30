import { ConfigService } from '@nestjs/config';
export declare class LambdaService {
    private configService;
    private lambdaClient;
    constructor(configService: ConfigService);
    invokeFunction(functionName: string, payload: any): Promise<any>;
    analyzeSpending(userId: number, transactions: any[]): Promise<any>;
    detectFraud(transaction: any): Promise<any>;
    generateReport(userId: number, params: any): Promise<any>;
    processReceipt(imageUrl: string): Promise<any>;
    sendEmail(to: string, subject: string, body: string): Promise<any>;
    backupData(userId: number): Promise<any>;
}
