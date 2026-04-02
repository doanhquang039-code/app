import { Repository } from 'typeorm';
import { Budget } from '../../entities/budget.entity';
import { Transaction } from '../../entities/transaction.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
export declare class BudgetsService {
    private budgetRepo;
    private transactionRepo;
    constructor(budgetRepo: Repository<Budget>, transactionRepo: Repository<Transaction>);
    create(userId: number, dto: CreateBudgetDto): Promise<Budget>;
    findAll(userId: number, month?: string): Promise<Budget[]>;
    findOne(userId: number, id: number): Promise<Budget>;
    update(userId: number, id: number, dto: UpdateBudgetDto): Promise<Budget>;
    remove(userId: number, id: number): Promise<{
        message: string;
    }>;
    getBudgetStatus(userId: number, month: string): Promise<{
        budgets: never[];
        totalBudget: number;
        totalSpent: number;
        totalRemaining?: undefined;
        overallPercentage?: undefined;
    } | {
        budgets: {
            id: number;
            categoryId: number;
            categoryName: string;
            categoryIcon: string;
            budgetAmount: number;
            spent: number;
            remaining: number;
            percentage: number;
            status: "safe" | "warning" | "exceeded";
        }[];
        totalBudget: number;
        totalSpent: number;
        totalRemaining: number;
        overallPercentage: number;
    }>;
}
