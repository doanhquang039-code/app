import { FinancialInsightsService } from './financial-insights.service';
export declare class FinancialInsightsController {
    private financialInsightsService;
    constructor(financialInsightsService: FinancialInsightsService);
    getSpendingByCategory(req: any, month?: string): Promise<{
        period: string;
        totalSpent: number;
        byCategory: {
            category: string;
            amount: number;
            percentage: number;
        }[];
    }>;
    getMonthlyTrend(req: any, months?: string): Promise<{}>;
    getRecommendations(req: any): Promise<{
        period: string;
        totalRecommendations: number;
        recommendations: {
            type: string;
            title: string;
            description: string;
            priority: string;
        }[];
    }>;
    getSpendingForecast(req: any, months?: string): Promise<{
        basedOnMonths: number;
        forecast: {
            month: string;
            projectedIncome: number;
            projectedExpense: number;
            projectedNet: number;
        }[];
    }>;
    getFinancialSummary(req: any): Promise<{
        allTime: {
            totalIncome: number;
            totalExpense: number;
            net: number;
        };
        lastMonth: {
            month: string;
            income: number;
            expense: number;
            net: number;
            savingsRate: number;
        };
    }>;
    getHealthScore(req: any): Promise<{
        score: number;
        label: string;
        breakdown: {
            savingsScore: number;
            expenseScore: number;
            incomeScore: number;
            trackingScore: number;
            netScore: number;
        };
        tips: string[];
    }>;
}
