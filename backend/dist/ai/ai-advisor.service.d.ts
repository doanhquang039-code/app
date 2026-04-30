import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Budget } from '../entities/budget.entity';
import { SavingsGoal } from '../entities/savings-goal.entity';
export interface AIInsight {
    type: 'warning' | 'tip' | 'achievement' | 'prediction';
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
    actionable?: boolean;
    action?: string;
}
export declare class AIAdvisorService {
    private transactionRepo;
    private budgetRepo;
    private savingsGoalRepo;
    constructor(transactionRepo: Repository<Transaction>, budgetRepo: Repository<Budget>, savingsGoalRepo: Repository<SavingsGoal>);
    getFinancialInsights(userId: number): Promise<AIInsight[]>;
    private analyzeSpendingPatterns;
    private analyzeBudgets;
    private analyzeSavingsGoals;
    private predictFutureSpending;
    getChatbotResponse(userId: number, message: string): Promise<string>;
}
