import { User } from './user.entity';
import { Transaction } from './transaction.entity';
export declare class SpendingAnomaly {
    id: number;
    userId: number;
    user: User;
    transactionId: number;
    transaction: Transaction;
    anomalyType: string;
    severity: string;
    amount: number;
    expectedAmount: number;
    deviationPercentage: number;
    category: string;
    description: string;
    analysis: string;
    status: string;
    isNotified: boolean;
    userNote: string;
    detectedAt: Date;
    reviewedAt: Date;
}
