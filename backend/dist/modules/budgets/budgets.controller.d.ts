import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
export declare class BudgetsController {
    private readonly budgetsService;
    constructor(budgetsService: BudgetsService);
    create(req: any, dto: CreateBudgetDto): Promise<import("../../entities/budget.entity").Budget>;
    findAll(req: any, month?: string): Promise<{
        id: number;
        userId: number;
        categoryId: number;
        categoryName: string;
        amount: number;
        spent: number;
        remaining: number;
        period: string;
        month: string;
        startDate: string;
        endDate: string;
        createdAt: Date;
    }[]>;
    getBudgetStatus(req: any, month: string): Promise<{
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
    findOne(req: any, id: string): Promise<import("../../entities/budget.entity").Budget>;
    update(req: any, id: string, dto: UpdateBudgetDto): Promise<import("../../entities/budget.entity").Budget>;
    remove(req: any, id: string): Promise<{
        message: string;
    }>;
}
