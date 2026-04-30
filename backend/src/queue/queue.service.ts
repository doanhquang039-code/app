import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('email') private emailQueue: Queue,
    @InjectQueue('notification') private notificationQueue: Queue,
    @InjectQueue('report') private reportQueue: Queue,
    @InjectQueue('analytics') private analyticsQueue: Queue,
  ) {}

  // Email jobs
  async sendWelcomeEmail(userId: number, email: string): Promise<void> {
    await this.emailQueue.add('welcome', { userId, email }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async sendBudgetAlert(userId: number, budgetData: any): Promise<void> {
    await this.emailQueue.add('budget-alert', { userId, budgetData }, {
      priority: 1, // High priority
      attempts: 3,
    });
  }

  async sendMonthlyReport(userId: number): Promise<void> {
    await this.emailQueue.add('monthly-report', { userId }, {
      attempts: 2,
    });
  }

  // Notification jobs
  async sendPushNotification(userId: number, notification: any): Promise<void> {
    await this.notificationQueue.add('push', { userId, notification }, {
      attempts: 3,
    });
  }

  async sendInAppNotification(userId: number, notification: any): Promise<void> {
    await this.notificationQueue.add('in-app', { userId, notification });
  }

  // Report generation jobs
  async generateExcelReport(userId: number, params: any): Promise<void> {
    await this.reportQueue.add('excel', { userId, params }, {
      timeout: 60000, // 1 minute
      attempts: 2,
    });
  }

  async generatePDFReport(userId: number, params: any): Promise<void> {
    await this.reportQueue.add('pdf', { userId, params }, {
      timeout: 60000,
      attempts: 2,
    });
  }

  // Analytics jobs
  async calculateUserAnalytics(userId: number): Promise<void> {
    await this.analyticsQueue.add('user-analytics', { userId }, {
      attempts: 2,
    });
  }

  async calculateGlobalAnalytics(): Promise<void> {
    await this.analyticsQueue.add('global-analytics', {}, {
      repeat: {
        cron: '0 0 * * *', // Daily at midnight
      },
    });
  }

  async updateLeaderboard(): Promise<void> {
    await this.analyticsQueue.add('leaderboard', {}, {
      repeat: {
        cron: '0 * * * *', // Every hour
      },
    });
  }

  // Job management
  async getJobCounts(queueName: string): Promise<any> {
    const queue = this.getQueue(queueName);
    return await queue.getJobCounts();
  }

  async getActiveJobs(queueName: string): Promise<any[]> {
    const queue = this.getQueue(queueName);
    return await queue.getActive();
  }

  async getFailedJobs(queueName: string): Promise<any[]> {
    const queue = this.getQueue(queueName);
    return await queue.getFailed();
  }

  async retryFailedJobs(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    const failed = await queue.getFailed();
    for (const job of failed) {
      await job.retry();
    }
  }

  async cleanQueue(queueName: string, grace: number = 5000): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.clean(grace, 'completed');
    await queue.clean(grace, 'failed');
  }

  private getQueue(name: string): Queue {
    switch (name) {
      case 'email':
        return this.emailQueue;
      case 'notification':
        return this.notificationQueue;
      case 'report':
        return this.reportQueue;
      case 'analytics':
        return this.analyticsQueue;
      default:
        throw new Error(`Queue ${name} not found`);
    }
  }
}
