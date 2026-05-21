import { CashFlowService } from './cash-flow.service';
export declare class CashFlowController {
    private readonly cashFlowService;
    constructor(cashFlowService: CashFlowService);
    getSummary(req: any, days?: string): Promise<{
        rangeDays: number;
        income: number;
        expense: number;
        net: number;
        dailyBurn: number;
        dailyIncome: number;
        projectedExpense: number;
        projectedNet: number;
        runwayDays: number;
        savingsRate: number;
        expenseRatio: number;
        largestExpenseDay: {
            date: string;
            amount: number;
            net: number;
        } | null;
        healthScore: number;
        trend: {
            date: string;
            income: number;
            expense: number;
            net: number;
            cumulative: number;
        }[];
        forecast: {
            date: string;
            balance: number;
            bills: number;
        }[];
        categoryData: {
            name: string;
            value: number;
        }[];
        budgetRisks: {
            id: number;
            name: string;
            amount: number;
            spent: number;
            percent: number;
        }[];
        upcomingBills: {
            id: number;
            name: string;
            amount: number;
            date: Date;
            dueIn: number;
        }[];
        topTransactions: {
            id: number;
            amount: number;
            date: Date;
            category: string;
            description: string;
        }[];
        insights: {
            type: "success" | "warning" | "danger" | "info";
            title: string;
            description: string;
            action: string;
        }[];
    }>;
}
