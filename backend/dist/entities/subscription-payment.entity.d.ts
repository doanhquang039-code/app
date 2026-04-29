import { Subscription } from './subscription.entity';
import { Transaction } from './transaction.entity';
export declare class SubscriptionPayment {
    id: number;
    subscriptionId: number;
    subscription: Subscription;
    transactionId: number;
    transaction: Transaction;
    amount: number;
    paymentDate: Date;
    dueDate: Date;
    status: string;
    paymentMethod: string;
    notes: string;
    isAutomatic: boolean;
    createdAt: Date;
}
