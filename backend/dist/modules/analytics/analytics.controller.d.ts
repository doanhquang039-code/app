import { AnalyticsService } from './analytics.service';
import { CreateForecastDto } from './dto/analytics.dto';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    generateDaily(date: string, req: any): Promise<import("../../entities/analytics.entity").AnalyticsData>;
    generateWeekly(startDate: string, req: any): Promise<import("../../entities/analytics.entity").AnalyticsData>;
    generateMonthly(req: any, month: number, year: number): Promise<import("../../entities/analytics.entity").AnalyticsData>;
    getAnalyticsRange(req: any, startDate: string, endDate: string, period?: string): Promise<import("../../entities/analytics.entity").AnalyticsData[]>;
    compareMonths(req: any, currentMonth: number, currentYear: number, previousMonth: number, previousYear: number): Promise<{
        current: import("../../entities/analytics.entity").AnalyticsData;
        previous: import("../../entities/analytics.entity").AnalyticsData;
        comparison: {
            expenseDiff: number;
            expenseDiffPercentage: number;
            incomeDiff: number;
            incomeDiffPercentage: number;
            savingsDiff: number;
        };
    }>;
    getSpendingTrend(req: any, days?: number): Promise<any>;
    getPredictedExpense(req: any): Promise<{
        predictedMonthlyExpense: number;
    }>;
    createForecast(req: any, createForecastDto: CreateForecastDto): Promise<import("../../entities/analytics.entity").SpendingForecast>;
    getForecastsForMonth(req: any, month: number, year: number): Promise<import("../../entities/analytics.entity").SpendingForecast[]>;
    updateForecast(id: string, req: any, { actualAmount }: {
        actualAmount: number;
    }): Promise<import("../../entities/analytics.entity").SpendingForecast | null>;
}
