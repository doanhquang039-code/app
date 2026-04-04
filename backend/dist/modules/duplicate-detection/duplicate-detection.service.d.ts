import { Repository } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';
export declare class DuplicateDetectionService {
    private transactionRepository;
    constructor(transactionRepository: Repository<Transaction>);
    detectDuplicates(userId: number, options?: {
        timeDiffMinutes?: number;
        amountTolerance?: number;
    }): Promise<{
        totalDuplicateGroups: number;
        groups: {
            suspicionLevel: number;
            transactions: Array<{
                id: number;
                amount: number;
                type: string;
                date: Date;
                category: string;
                wallet: string;
                note: string;
            }>;
        }[];
    }>;
    findSimilar(userId: number, transactionId: number): Promise<{
        message: string;
        originalTransaction?: undefined;
        similarCount?: undefined;
        similarTransactions?: undefined;
    } | {
        originalTransaction: {
            id: number;
            amount: number;
            type: string;
            date: Date;
            category: string;
            wallet: string;
        };
        similarCount: number;
        similarTransactions: {
            id: number;
            amount: number;
            type: string;
            date: Date;
            category: string;
            wallet: string;
            note: string;
        }[];
        message?: undefined;
    }>;
    private isSuspiciousDuplicate;
    private isSimilarAmount;
    private isWithinTimeWindow;
    private calculateSuspicionLevel;
}
