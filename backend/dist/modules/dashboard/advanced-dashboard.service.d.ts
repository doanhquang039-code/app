import { Repository } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { Budget } from '../../entities/budget.entity';
import { User } from '../../entities/user.entity';
export declare class AdvancedDashboardService {
    private transactionRepo;
    private budgetRepo;
    private userRepo;
    constructor(transactionRepo: Repository<Transaction>, budgetRepo: Repository<Budget>, userRepo: Repository<User>);
    getAdvancedDashboard(userId: number): Promise<any>;
    private getOverview;
    private getSpendingTrend;
    private getCategoryBreakdown;
    private getBudgetStatus;
    private getRecentTransactions;
    private getInsights;
    private getSpendingVelocity;
    getRealTimeStats(userId: number): Promise<any>;
}
