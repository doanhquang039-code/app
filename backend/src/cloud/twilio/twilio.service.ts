import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

@Injectable()
export class TwilioService {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get('TWILIO_PHONE_NUMBER') || '';

    this.client = twilio(accountSid, authToken);
  }

  async sendSMS(to: string, message: string): Promise<any> {
    return await this.client.messages.create({
      body: message,
      from: this.fromNumber,
      to,
    });
  }

  async sendBudgetAlertSMS(to: string, budgetName: string, percentage: number): Promise<any> {
    const message = `Budget Alert! Your "${budgetName}" budget has reached ${percentage}%. Check your Expense Tracker app for details.`;
    return await this.sendSMS(to, message);
  }

  async sendTransactionAlertSMS(to: string, amount: number, merchant: string): Promise<any> {
    const message = `Transaction Alert: $${amount} spent at ${merchant}. Reply STOP to unsubscribe.`;
    return await this.sendSMS(to, message);
  }

  async sendVerificationCode(to: string, code: string): Promise<any> {
    const message = `Your Expense Tracker verification code is: ${code}. Valid for 10 minutes.`;
    return await this.sendSMS(to, message);
  }

  async sendBulkSMS(recipients: string[], message: string): Promise<any[]> {
    const promises = recipients.map(to => this.sendSMS(to, message));
    return await Promise.all(promises);
  }

  async makeCall(to: string, message: string): Promise<any> {
    return await this.client.calls.create({
      twiml: `<Response><Say>${message}</Say></Response>`,
      from: this.fromNumber,
      to,
    });
  }

  async sendWhatsApp(to: string, message: string): Promise<any> {
    return await this.client.messages.create({
      body: message,
      from: `whatsapp:${this.fromNumber}`,
      to: `whatsapp:${to}`,
    });
  }
}
