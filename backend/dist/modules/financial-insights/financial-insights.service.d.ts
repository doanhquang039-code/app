import { Repository } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { Category } from '../../entities/category.entity';
export declare class FinancialInsightsService {
    private transactionRepository;
    private categoryRepository;
    constructor(transactionRepository: Repository<Transaction>, categoryRepository: Repository<Category>);
    getSpendingByCategory(userId: number, month?: string): Promise<{
        period: string;
        totalSpent: number;
        byCategory: {
            category: string;
            amount: number;
            percentage: number;
        }[];
    }>;
    getMonthlyTrend(userId: number, months?: number): Promise<{}>;
    getRecommendations(userId: number): Promise<{
        period: string;
        totalRecommendations: number;
        recommendations: {
            type: string;
            title: string;
            description: string;
            priority: string;
        }[];
    }>;
    getSpendingForecast(userId: number, months?: number): Promise<{
        basedOnMonths: number;
        forecast: {
            month: string;
            projectedIncome: number;
            projectedExpense: number;
            projectedNet: number;
        }[];
    }>;
    getFinancialSummary(userId: number): Promise<{
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
    private getLastMonthString;
    private formatCurrency;
    getHealthScore(userId: number): Promise<{
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
