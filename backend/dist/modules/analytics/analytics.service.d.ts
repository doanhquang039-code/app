import { Repository } from 'typeorm';
import { AnalyticsData, SpendingForecast } from '../../entities/analytics.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Category } from '../../entities/category.entity';
import { CreateForecastDto } from './dto/analytics.dto';
export declare class AnalyticsService {
    private analyticsRepository;
    private forecastRepository;
    private transactionRepository;
    private categoryRepository;
    constructor(analyticsRepository: Repository<AnalyticsData>, forecastRepository: Repository<SpendingForecast>, transactionRepository: Repository<Transaction>, categoryRepository: Repository<Category>);
    generateDailyAnalytics(userId: number, date: Date): Promise<AnalyticsData>;
    generateWeeklyAnalytics(userId: number, startDate: Date): Promise<AnalyticsData>;
    generateMonthlyAnalytics(userId: number, month: number, year: number): Promise<AnalyticsData>;
    getAnalyticsRange(userId: number, startDate: Date, endDate: Date, period: string): Promise<AnalyticsData[]>;
    compareMonths(userId: number, currentMonth: number, currentYear: number, previousMonth: number, previousYear: number): Promise<{
        current: AnalyticsData;
        previous: AnalyticsData;
        comparison: {
            expenseDiff: number;
            expenseDiffPercentage: number;
            incomeDiff: number;
            incomeDiffPercentage: number;
            savingsDiff: number;
        };
    }>;
    createForecast(userId: number, createForecastDto: CreateForecastDto): Promise<SpendingForecast>;
    getForecastsForMonth(userId: number, month: number, year: number): Promise<SpendingForecast[]>;
    updateForecastWithActual(id: number, userId: number, actualAmount: number): Promise<SpendingForecast | null>;
    private getCategoryBreakdown;
    private calculateDailyTrends;
    getSpendingTrend(userId: number, days?: number): Promise<any>;
    getPredictedMonthlyExpense(userId: number): Promise<number>;
}
