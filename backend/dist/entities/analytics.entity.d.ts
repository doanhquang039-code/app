import { User } from './user.entity';
export declare class AnalyticsData {
    id: number;
    userId: number;
    date: Date;
    totalIncome: number;
    totalExpense: number;
    savingsAmount: number;
    savingsRatePercentage: number;
    period: string;
    categoryBreakdown: string;
    trends: string;
    createdAt: Date;
    user: User;
}
export declare class SpendingForecast {
    id: number;
    userId: number;
    categoryId: number;
    month: number;
    year: number;
    predictedAmount: number;
    actualAmount: number;
    confidence: number;
    notes: string;
    createdAt: Date;
    user: User;
}
