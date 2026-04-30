import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class SendGridService {
  constructor(private configService: ConfigService) {
    sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY') || '');
  }

  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<void> {
    const msg = {
      to,
      from: this.configService.get('SENDGRID_FROM_EMAIL') || 'noreply@expensetracker.com',
      subject,
      text: text || '',
      html,
    };

    await sgMail.send(msg);
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const html = `
      <h1>Welcome to Expense Tracker, ${name}!</h1>
      <p>Thank you for joining us. Start tracking your expenses today!</p>
      <a href="https://expensetracker.com/dashboard">Go to Dashboard</a>
    `;

    await this.sendEmail(to, 'Welcome to Expense Tracker!', html);
  }

  async sendBudgetAlert(to: string, budgetName: string, percentage: number): Promise<void> {
    const html = `
      <h1>Budget Alert!</h1>
      <p>Your budget "${budgetName}" has reached ${percentage}% of its limit.</p>
      <p>Consider reviewing your spending to stay within budget.</p>
      <a href="https://expensetracker.com/budgets">View Budgets</a>
    `;

    await this.sendEmail(to, `Budget Alert: ${budgetName}`, html);
  }

  async sendMonthlyReport(to: string, reportData: any): Promise<void> {
    const html = `
      <h1>Your Monthly Financial Report</h1>
      <h2>Summary</h2>
      <ul>
        <li>Total Income: $${reportData.totalIncome}</li>
        <li>Total Expenses: $${reportData.totalExpenses}</li>
        <li>Net Savings: $${reportData.netSavings}</li>
      </ul>
      <a href="https://expensetracker.com/reports">View Full Report</a>
    `;

    await this.sendEmail(to, 'Your Monthly Financial Report', html);
  }

  async sendPasswordReset(to: string, resetToken: string): Promise<void> {
    const resetUrl = `https://expensetracker.com/reset-password?token=${resetToken}`;
    const html = `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `;

    await this.sendEmail(to, 'Password Reset Request', html);
  }

  async sendBulkEmails(recipients: string[], subject: string, html: string): Promise<void> {
    const messages = recipients.map(to => ({
      to,
      from: this.configService.get('SENDGRID_FROM_EMAIL') || 'noreply@expensetracker.com',
      subject,
      html,
    }));

    await sgMail.send(messages);
  }

  async sendTemplateEmail(to: string, templateId: string, dynamicData: any): Promise<void> {
    const msg = {
      to,
      from: this.configService.get('SENDGRID_FROM_EMAIL') || 'noreply@expensetracker.com',
      templateId,
      dynamicTemplateData: dynamicData,
    };

    await sgMail.send(msg);
  }
}
