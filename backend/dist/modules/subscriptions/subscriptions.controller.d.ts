import { SubscriptionsService } from './subscriptions.service';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    createSubscription(req: any, data: any): Promise<import("../../entities/subscription.entity").Subscription>;
    getSubscriptions(req: any, status?: string): Promise<import("../../entities/subscription.entity").Subscription[]>;
    getStats(req: any): Promise<any>;
    getUpcomingRenewals(req: any, days?: string): Promise<import("../../entities/subscription.entity").Subscription[]>;
    getSubscription(req: any, id: number): Promise<import("../../entities/subscription.entity").Subscription>;
    updateSubscription(req: any, id: number, data: any): Promise<import("../../entities/subscription.entity").Subscription>;
    cancelSubscription(req: any, id: number): Promise<import("../../entities/subscription.entity").Subscription>;
    pauseSubscription(req: any, id: number): Promise<import("../../entities/subscription.entity").Subscription>;
    resumeSubscription(req: any, id: number): Promise<import("../../entities/subscription.entity").Subscription>;
    deleteSubscription(req: any, id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    recordPayment(req: any, id: number, data: any): Promise<import("../../entities/subscription-payment.entity").SubscriptionPayment>;
    getPaymentHistory(req: any, id: number): Promise<import("../../entities/subscription-payment.entity").SubscriptionPayment[]>;
}
