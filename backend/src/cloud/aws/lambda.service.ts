import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

@Injectable()
export class LambdaService {
  private lambdaClient: LambdaClient;

  constructor(private configService: ConfigService) {
    this.lambdaClient = new LambdaClient({
      region: this.configService.get('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  async invokeFunction(functionName: string, payload: any): Promise<any> {
    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: JSON.stringify(payload),
    });

    const response = await this.lambdaClient.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.Payload));
    return result;
  }

  // AI Analysis Lambda
  async analyzeSpending(userId: number, transactions: any[]): Promise<any> {
    return await this.invokeFunction('expense-tracker-ai-analysis', {
      userId,
      transactions,
      action: 'analyze',
    });
  }

  // Fraud Detection Lambda
  async detectFraud(transaction: any): Promise<any> {
    return await this.invokeFunction('expense-tracker-fraud-detection', {
      transaction,
      action: 'detect',
    });
  }

  // Report Generation Lambda
  async generateReport(userId: number, params: any): Promise<any> {
    return await this.invokeFunction('expense-tracker-report-generator', {
      userId,
      params,
      action: 'generate',
    });
  }

  // OCR Processing Lambda
  async processReceipt(imageUrl: string): Promise<any> {
    return await this.invokeFunction('expense-tracker-ocr-processor', {
      imageUrl,
      action: 'process',
    });
  }

  // Email Notification Lambda
  async sendEmail(to: string, subject: string, body: string): Promise<any> {
    return await this.invokeFunction('expense-tracker-email-sender', {
      to,
      subject,
      body,
      action: 'send',
    });
  }

  // Data Backup Lambda
  async backupData(userId: number): Promise<any> {
    return await this.invokeFunction('expense-tracker-data-backup', {
      userId,
      action: 'backup',
    });
  }
}
