import { Repository } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { Wallet } from '../../entities/wallet.entity';
export declare class DashboardService {
    private transactionRepo;
    private walletRepo;
    constructor(transactionRepo: Repository<Transaction>, walletRepo: Repository<Wallet>);
    getOverview(userId: number): Promise<{
        income: number;
        expense: number;
        balance: number;
        totalBalance: number;
        transactionCount: number;
        month: string;
    }>;
    getRecentTransactions(userId: number, limit?: number): Promise<Transaction[]>;
    getExpenseByCategory(userId: number, month: string): Promise<{
        categoryId: any;
        categoryName: any;
        categoryIcon: any;
        categoryColor: any;
        total: number;
        count: number;
        percentage: number;
    }[]>;
    getDailyTrend(userId: number, month: string): Promise<{
        day: number;
        date: string;
        income: number;
        expense: number;
    }[]>;
    getMonthlyComparison(userId: number): Promise<{
        month: string;
        income: number;
        expense: number;
    }[]>;
}
