import { Repository } from 'typeorm';
import { DailyStatistics } from '../../entities/daily-statistics.entity';
import { MonthlyStatistics } from '../../entities/monthly-statistics.entity';
import { CategoryPattern } from '../../entities/category-pattern.entity';
import { ApiLog } from '../../entities/api-log.entity';
export declare class PerformanceService {
    private dailyStatsRepo;
    private monthlyStatsRepo;
    private categoryPatternsRepo;
    private apiLogsRepo;
    constructor(dailyStatsRepo: Repository<DailyStatistics>, monthlyStatsRepo: Repository<MonthlyStatistics>, categoryPatternsRepo: Repository<CategoryPattern>, apiLogsRepo: Repository<ApiLog>);
    calculateDailyStats(userId: number, date: Date): Promise<void>;
    calculateMonthlyStats(userId: number, year: number, month: number): Promise<void>;
    calculateCategoryPatterns(userId: number, year: number, month: number): Promise<void>;
    calculateAllDailyStats(): Promise<void>;
    calculateAllMonthlyStats(): Promise<void>;
    cleanupOldLogs(): Promise<void>;
    getApiPerformanceMetrics(hours?: number): Promise<any>;
    getSlowQueries(threshold?: number): Promise<any>;
    getErrorRate(hours?: number): Promise<any>;
    optimizeIndexes(): Promise<void>;
    updateStatistics(): Promise<void>;
    getDatabaseSize(): Promise<any>;
    getTableSizes(): Promise<any>;
}
