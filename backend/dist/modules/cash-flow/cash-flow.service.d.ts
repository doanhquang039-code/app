import { Repository } from 'typeorm';
import { Budget } from '../../entities/budget.entity';
import { Subscription } from '../../entities/subscription.entity';
import { Transaction } from '../../entities/transaction.entity';
type DailyCashFlow = {
    date: string;
    income: number;
    expense: number;
    net: number;
    cumulative: number;
};
type UpcomingBill = {
    id: number;
    name: string;
    amount: number;
    date: Date;
    dueIn: number;
};
export declare class CashFlowService {
    private readonly transactionRepo;
    private readonly budgetRepo;
    private readonly subscriptionRepo;
    constructor(transactionRepo: Repository<Transaction>, budgetRepo: Repository<Budget>, subscriptionRepo: Repository<Subscription>);
    getSummary(userId: number, requestedDays?: number): Promise<{
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
        trend: DailyCashFlow[];
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
        upcomingBills: UpcomingBill[];
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
    private buildDailyTrend;
    private buildCategoryBreakdown;
    private getTopTransactions;
    private getLargestExpenseDay;
    private buildForecast;
    private buildInsights;
    private getBudgetRisks;
    private getUpcomingBills;
    private calculateHealthScore;
    private isIncome;
    private clampDays;
    private startOfDay;
    private endOfDay;
    private formatDayKey;
    private daysBetween;
    private isSameDay;
}
export {};
