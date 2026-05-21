import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PerformanceService } from '../services/performance.service';
import { CacheService } from '../services/cache.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('api/performance')
@UseGuards(JwtAuthGuard)
export class PerformanceController {
  constructor(
    private readonly performanceService: PerformanceService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Get API performance metrics
   * GET /api/performance/metrics?hours=24
   */
  @Get('metrics')
  async getMetrics(@Query('hours') hours: string = '24') {
    const hoursNum = parseInt(hours) || 24;
    return await this.performanceService.getApiPerformanceMetrics(hoursNum);
  }

  /**
   * Get slow queries
   * GET /api/performance/slow-queries?threshold=1000
   */
  @Get('slow-queries')
  async getSlowQueries(@Query('threshold') threshold: string = '1000') {
    const thresholdNum = parseInt(threshold) || 1000;
    return await this.performanceService.getSlowQueries(thresholdNum);
  }

  /**
   * Get error rate
   * GET /api/performance/error-rate?hours=24
   */
  @Get('error-rate')
  async getErrorRate(@Query('hours') hours: string = '24') {
    const hoursNum = parseInt(hours) || 24;
    return await this.performanceService.getErrorRate(hoursNum);
  }

  /**
   * Get database size
   * GET /api/performance/database-size
   */
  @Get('database-size')
  async getDatabaseSize() {
    return await this.performanceService.getDatabaseSize();
  }

  /**
   * Get table sizes
   * GET /api/performance/table-sizes
   */
  @Get('table-sizes')
  async getTableSizes() {
    return await this.performanceService.getTableSizes();
  }

  /**
   * Get cache statistics
   * GET /api/performance/cache-stats
   */
  @Get('cache-stats')
  async getCacheStats() {
    return await this.cacheService.getStats();
  }

  /**
   * Clear cache
   * POST /api/performance/clear-cache
   */
  @Get('clear-cache')
  async clearCache() {
    await this.cacheService.clear();
    return { message: 'Cache cleared successfully' };
  }

  /**
   * Cleanup expired cache
   * POST /api/performance/cleanup-cache
   */
  @Get('cleanup-cache')
  async cleanupCache() {
    await this.cacheService.cleanup();
    return { message: 'Expired cache cleaned up successfully' };
  }

  /**
   * Optimize database indexes
   * POST /api/performance/optimize-indexes
   */
  @Get('optimize-indexes')
  async optimizeIndexes() {
    await this.performanceService.optimizeIndexes();
    return { message: 'Database indexes optimized successfully' };
  }

  /**
   * Update database statistics
   * POST /api/performance/update-statistics
   */
  @Get('update-statistics')
  async updateStatistics() {
    await this.performanceService.updateStatistics();
    return { message: 'Database statistics updated successfully' };
  }
}
