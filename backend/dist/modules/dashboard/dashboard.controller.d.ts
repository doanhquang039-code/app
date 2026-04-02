import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getOverview(req: any): Promise<{
        income: number;
        expense: number;
        balance: number;
        totalBalance: number;
        transactionCount: number;
        month: string;
    }>;
    getRecentTransactions(req: any, limit?: string): Promise<import("../../entities/transaction.entity").Transaction[]>;
    getExpenseByCategory(req: any, month: string): Promise<{
        categoryId: any;
        categoryName: any;
        categoryIcon: any;
        categoryColor: any;
        total: number;
        count: number;
        percentage: number;
    }[]>;
    getDailyTrend(req: any, month: string): Promise<{
        day: number;
        date: string;
        income: number;
        expense: number;
    }[]>;
    getMonthlyComparison(req: any): Promise<{
        month: string;
        income: number;
        expense: number;
    }[]>;
}
