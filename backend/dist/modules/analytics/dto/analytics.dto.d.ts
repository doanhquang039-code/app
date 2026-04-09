export declare class CreateAnalyticsDto {
    totalIncome: number;
    totalExpense: number;
    savingsAmount: number;
    savingsRatePercentage?: number;
    categoryBreakdown?: string;
    trends?: string;
}
export declare class CreateForecastDto {
    categoryId: number;
    month: number;
    year: number;
    predictedAmount: number;
    confidence?: number;
    notes?: string;
}
