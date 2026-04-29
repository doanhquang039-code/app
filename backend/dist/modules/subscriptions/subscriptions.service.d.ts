import { Repository } from 'typeorm';
import { Subscription } from '../../entities/subscription.entity';
import { SubscriptionPayment } from '../../entities/subscription-payment.entity';
export declare class SubscriptionsService {
    private subscriptionRepo;
    private paymentRepo;
    constructor(subscriptionRepo: Repository<Subscription>, paymentRepo: Repository<SubscriptionPayment>);
    createSubscription(userId: number, data: any): Promise<Subscription>;
    getUserSubscriptions(userId: number, status?: string): Promise<Subscription[]>;
    getSubscription(userId: number, subscriptionId: number): Promise<Subscription>;
    updateSubscription(userId: number, subscriptionId: number, data: Partial<Subscription>): Promise<Subscription>;
    cancelSubscription(userId: number, subscriptionId: number): Promise<Subscription>;
    pauseSubscription(userId: number, subscriptionId: number): Promise<Subscription>;
    resumeSubscription(userId: number, subscriptionId: number): Promise<Subscription>;
    deleteSubscription(userId: number, subscriptionId: number): Promise<void>;
    getSubscriptionStats(userId: number): Promise<any>;
    private groupByCategory;
    private getTopSubscriptions;
    getUpcomingRenewals(userId: number, days?: number): Promise<Subscription[]>;
    recordPayment(userId: number, subscriptionId: number, data: any): Promise<SubscriptionPayment>;
    getPaymentHistory(userId: number, subscriptionId: number): Promise<SubscriptionPayment[]>;
    private calculateNextBillingDate;
    processRenewals(): Promise<void>;
    sendReminders(): Promise<void>;
}
