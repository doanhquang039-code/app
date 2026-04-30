import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

@Injectable()
export class SQSService {
  private sqsClient: SQSClient;
  private queueUrl: string;

  constructor(private configService: ConfigService) {
    this.sqsClient = new SQSClient({
      region: this.configService.get('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
    this.queueUrl = this.configService.get('AWS_SQS_QUEUE_URL') || '';
  }

  async sendMessage(message: any, delaySeconds: number = 0): Promise<string> {
    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(message),
      DelaySeconds: delaySeconds,
    });

    const response = await this.sqsClient.send(command);
    return response.MessageId || '';
  }

  async receiveMessages(maxMessages: number = 10): Promise<any[]> {
    const command = new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: maxMessages,
      WaitTimeSeconds: 20,
    });

    const response = await this.sqsClient.send(command);
    return response.Messages || [];
  }

  async deleteMessage(receiptHandle: string): Promise<void> {
    const command = new DeleteMessageCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
    });

    await this.sqsClient.send(command);
  }

  // Queue specific messages
  async queueEmailJob(userId: number, emailType: string, data: any): Promise<string> {
    return await this.sendMessage({
      type: 'email',
      userId,
      emailType,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  async queueReportJob(userId: number, reportType: string, params: any): Promise<string> {
    return await this.sendMessage({
      type: 'report',
      userId,
      reportType,
      params,
      timestamp: new Date().toISOString(),
    });
  }

  async queueAnalyticsJob(userId: number, period: string): Promise<string> {
    return await this.sendMessage({
      type: 'analytics',
      userId,
      period,
      timestamp: new Date().toISOString(),
    });
  }

  async queueBackupJob(userId: number): Promise<string> {
    return await this.sendMessage({
      type: 'backup',
      userId,
      timestamp: new Date().toISOString(),
    });
  }
}
