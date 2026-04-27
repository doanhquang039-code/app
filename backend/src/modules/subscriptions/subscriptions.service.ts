import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { Subscription } from '../../entities/subscription.entity';
import { SubscriptionPayment } from '../../entities/subscription-payment.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(SubscriptionPayment)
    private paymentRepo: Repository<SubscriptionPayment>,
  ) {}

  // Create subscription
  async createSubscription(userId: number, data: any): Promise<Subscription> {
    const nextBillingDate = this.calculateNextBillingDate(
      data.startDate,
      data.billingCycle,
    );

    const subscription = this.subscriptionRepo.create({
      userId,
      ...data,
      nextBillingDate,
      status: 'ACTIVE',
      totalPaid: 0,
      paymentCount: 0,
    });

    return await this.subscriptionRepo.save(subscription);
  }

  // Get all subscriptions
  async getUserSubscriptions(userId: number, status?: string): Promise<Subscription[]> {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    return await this.subscriptionRepo.find({
      where,
      relations: ['category'],
      order: { nextBillingDate: 'ASC' },
    });
  }

  // Get single subscription
  async getSubscription(userId: number, subscriptionId: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { id: subscriptionId, userId },
      relations: ['category'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  // Update subscription
  async updateSubscription(
    userId: number,
    subscriptionId: number,
    data: any,
  ): Promise<Subscription> {
    const subscription = await this.getSubscription(userId, subscriptionId);

    Object.assign(subscription, data);

    // Recalculate next billing date if billing cycle changed
    if (data.billingCycle) {
      subscription.nextBillingDate = this.calculateNextBillingDate(
        subscription.nextBillingDate,
        data.billingCycle,
      );
    }

    return await this.subscriptionRepo.save(subscription);
  }

  // Cancel subscription
  async cancelSubscription(userId: number, subscriptionId: number): Promise<Subscription> {
    const subscription = await this.getSubscription(userId, subscriptionId);
    subscription.status = 'CANCELLED';
    subscription.autoRenew = false;
    return await this.subscriptionRepo.save(subscription);
  }

  // Pause subscription
  async pauseSubscription(userId: number, subscriptionId: number): Promise<Subscription> {
    const subscription = await this.getSubscription(userId, subscriptionId);
    subscription.status = 'PAUSED';
    return await this.subscriptionRepo.save(subscription);
  }

  // Resume subscription
  async resumeSubscription(userId: number, subscriptionId: number): Promise<Subscription> {
    const subscription = await this.getSubscription(userId, subscriptionId);
    subscription.status = 'ACTIVE';
    return await this.subscriptionRepo.save(subscription);
  }

  // Delete subscription
  async deleteSubscription(userId: number, subscriptionId: number): Promise<void> {
    const subscription = await this.getSubscription(userId, subscriptionId);
    await this.subscriptionRepo.remove(subscription);
  }

  // Get subscription statistics
  async getSubscriptionStats(userId: number): Promise<any> {
    const subscriptions = await this.getUserSubscriptions(userId);

    const active = subscriptions.filter(s => s.status === 'ACTIVE');
    const paused = subscriptions.filter(s => s.status === 'PAUSED');
    const cancelled = subscriptions.filter(s => s.status === 'CANCELLED');

    // Calculate monthly cost
    const monthlyCost = active.reduce((sum, sub) => {
      const amount = parseFloat(sub.amount.toString());
      switch (sub.billingCycle) {
        case 'DAILY':
          return sum + amount * 30;
        case 'WEEKLY':
          return sum + amount * 4;
        case 'MONTHLY':
          return sum + amount;
        case 'QUARTERLY':
          return sum + amount / 3;
        case 'YEARLY':
          return sum + amount / 12;
        default:
          return sum;
      }
    }, 0);

    // Calculate yearly cost
    const yearlyCost = monthlyCost * 12;

    // Get upcoming renewals (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingRenewals = active.filter(
      s => new Date(s.nextBillingDate) <= thirtyDaysFromNow,
    );

    // Category breakdown
    const byCategory = this.groupByCategory(active);

    return {
      total: subscriptions.length,
      active: active.length,
      paused: paused.length,
      cancelled: cancelled.length,
      monthlyCost: Math.round(monthlyCost),
      yearlyCost: Math.round(yearlyCost),
      upcomingRenewals: upcomingRenewals.length,
      byCategory,
      topSubscriptions: this.getTopSubscriptions(active, 5),
    };
  }

  // Group by category
  private groupByCategory(subscriptions: Subscription[]): any[] {
    const groups = subscriptions.reduce((acc, sub) => {
      const category = sub.category?.name || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { category, count: 0, totalCost: 0 };
      }
      acc[category].count += 1;
      acc[category].totalCost += parseFloat(sub.amount.toString());
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groups).sort((a: any, b: any) => b.totalCost - a.totalCost);
  }

  // Get top subscriptions by cost
  private getTopSubscriptions(subscriptions: Subscription[], limit: number): any[] {
    return subscriptions
      .sort((a, b) => parseFloat(b.amount.toString()) - parseFloat(a.amount.toString()))
      .slice(0, limit)
      .map(s => ({
        id: s.id,
        name: s.name,
        amount: s.amount,
        billingCycle: s.billingCycle,
        provider: s.provider,
      }));
  }

  // Get upcoming renewals
  async getUpcomingRenewals(userId: number, days: number = 30): Promise<Subscription[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await this.subscriptionRepo.find({
      where: {
        userId,
        status: 'ACTIVE',
        nextBillingDate: LessThan(futureDate),
      },
      relations: ['category'],
      order: { nextBillingDate: 'ASC' },
    });
  }

  // Record payment
  async recordPayment(
    userId: number,
    subscriptionId: number,
    data: any,
  ): Promise<SubscriptionPayment> {
    const subscription = await this.getSubscription(userId, subscriptionId);

    const payment = this.paymentRepo.create({
      subscriptionId,
      amount: data.amount || subscription.amount,
      paymentDate: data.paymentDate || new Date(),
      dueDate: subscription.nextBillingDate,
      status: 'PAID',
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      transactionId: data.transactionId,
      isAutomatic: data.isAutomatic || false,
    });

    await this.paymentRepo.save(payment);

    // Update subscription
    subscription.totalPaid += parseFloat(payment.amount.toString());
    subscription.paymentCount += 1;
    subscription.nextBillingDate = this.calculateNextBillingDate(
      subscription.nextBillingDate,
      subscription.billingCycle,
    );
    subscription.reminderSent = false;

    await this.subscriptionRepo.save(subscription);

    return payment;
  }

  // Get payment history
  async getPaymentHistory(
    userId: number,
    subscriptionId: number,
  ): Promise<SubscriptionPayment[]> {
    await this.getSubscription(userId, subscriptionId); // Verify ownership

    return await this.paymentRepo.find({
      where: { subscriptionId },
      relations: ['transaction'],
      order: { paymentDate: 'DESC' },
    });
  }

  // Calculate next billing date
  private calculateNextBillingDate(currentDate: Date, billingCycle: string): Date {
    const nextDate = new Date(currentDate);

    switch (billingCycle) {
      case 'DAILY':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'WEEKLY':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'MONTHLY':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'QUARTERLY':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'YEARLY':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    return nextDate;
  }

  // Cron job: Process renewals
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processRenewals(): Promise<void> {
    console.log('Processing subscription renewals...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueSubscriptions = await this.subscriptionRepo.find({
      where: {
        status: 'ACTIVE',
        autoRenew: true,
        nextBillingDate: LessThan(tomorrow),
      },
    });

    for (const subscription of dueSubscriptions) {
      try {
        // Create pending payment
        const payment = this.paymentRepo.create({
          subscriptionId: subscription.id,
          amount: subscription.amount,
          paymentDate: new Date(),
          dueDate: subscription.nextBillingDate,
          status: 'PENDING',
          isAutomatic: true,
        });

        await this.paymentRepo.save(payment);

        console.log(`Created pending payment for subscription ${subscription.id}`);
      } catch (error) {
        console.error(`Failed to process renewal for subscription ${subscription.id}:`, error);
      }
    }
  }

  // Cron job: Send reminders
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendReminders(): Promise<void> {
    console.log('Sending subscription reminders...');

    const subscriptions = await this.subscriptionRepo.find({
      where: {
        status: 'ACTIVE',
        reminderEnabled: true,
        reminderSent: false,
      },
    });

    for (const subscription of subscriptions) {
      const daysUntilBilling = Math.ceil(
        (new Date(subscription.nextBillingDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      );

      if (daysUntilBilling <= subscription.reminderDaysBefore) {
        // TODO: Send notification/email
        subscription.reminderSent = true;
        await this.subscriptionRepo.save(subscription);

        console.log(`Sent reminder for subscription ${subscription.id}`);
      }
    }
  }
}
