import { PerformanceService } from '../services/performance.service';
import { CacheService } from '../services/cache.service';
export declare class PerformanceController {
    private readonly performanceService;
    private readonly cacheService;
    constructor(performanceService: PerformanceService, cacheService: CacheService);
    getMetrics(hours?: string): Promise<any>;
    getSlowQueries(threshold?: string): Promise<any>;
    getErrorRate(hours?: string): Promise<any>;
    getDatabaseSize(): Promise<any>;
    getTableSizes(): Promise<any>;
    getCacheStats(): Promise<any>;
    clearCache(): Promise<{
        message: string;
    }>;
    cleanupCache(): Promise<{
        message: string;
    }>;
    optimizeIndexes(): Promise<{
        message: string;
    }>;
    updateStatistics(): Promise<{
        message: string;
    }>;
}
