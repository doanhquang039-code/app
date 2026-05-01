import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Budget } from '../entities/budget.entity';
export declare class PredictionService {
    private transactionRepo;
    private budgetRepo;
    constructor(transactionRepo: Repository<Transaction>, budgetRepo: Repository<Budget>);
    predictBudgetOverrun(userId: number, budgetId: number): Promise<any>;
    predictNextTransaction(userId: number): Promise<any>;
    predictSavingsPotential(userId: number): Promise<any>;
    predictGoalAchievement(userId: number, goalAmount: number, targetDate: Date): Promise<any>;
    private analyzeTransactionPatterns;
    private predictNext;
    private getMaxKey;
}
