import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Budget } from '../entities/budget.entity';
export declare class RecommendationService {
    private transactionRepo;
    private budgetRepo;
    constructor(transactionRepo: Repository<Transaction>, budgetRepo: Repository<Budget>);
    getPersonalizedRecommendations(userId: number): Promise<any[]>;
    private getSpendingRecommendations;
    private getSavingsRecommendations;
    private getBudgetRecommendations;
    private groupByCategory;
}
