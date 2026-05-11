import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DailyStatistics } from '../../entities/daily-statistics.entity';
import { MonthlyStatistics } from '../../entities/monthly-statistics.entity';
import { CategoryPattern } from '../../entities/category-pattern.entity';
import { ApiLog } from '../../entities/api-log.entity';

/**
 * Performance Optimization Service
 * Handles background jobs, statistics calculation, and performance monitoring
 */

@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(DailyStatistics)
    private dailyStatsRepo: Repository<DailyStatistics>,
    @InjectRepository(MonthlyStatistics)
    private monthlyStatsRepo: Repository<MonthlyStatistics>,
    @InjectRepository(CategoryPattern)
    private categoryPatternsRepo: Repository<CategoryPattern>,
    @InjectRepository(ApiLog)
    private apiLogsRepo: Repository<ApiLog>,
  ) {}

  /**
   * Calculate daily statistics for a user
   */
  async calculateDailyStats(userId: number, date: Date): Promise<void> {
    const query = `
      EXEC sp_calculate_daily_statistics @user_id = ${userId}, @stat_date = '${date.toISOString().split('T')[0]}'
    `;
    
    await this.dailyStatsRepo.query(query);
  }

  /**
   * Calculate monthly statistics for a user
   */
  async calculateMonthlyStats(userId: number, year: number, month: number): Promise<void> {
    const stats = await this.dailyStatsRepo
      .createQueryBuilder('ds')
      .select('SUM(ds.total_income)', 'total_income')
      .addSelect('SUM(ds.total_expense)', 'total_expense')
      .addSelect('SUM(ds.net_amount)', 'net_amount')
      .addSelect('SUM(ds.transaction_count)', 'transaction_count')
      .addSelect('AVG(ds.total_expense)', 'avg_daily_expense')
      .where('ds.user_id = :userId', { userId })
      .andWhere('YEAR(ds.stat_date) = :year', { year })
      .andWhere('MONTH(ds.stat_date) = :month', { month })
      .getRawOne();

    if (stats) {
      const savingsRate = stats.total_income > 0
        ? ((stats.total_income - stats.total_expense) / stats.total_income) * 100
        : 0;

      const existing = await this.monthlyStatsRepo.findOne({
        where: { user_id: userId, year, month },
      });

      if (existing) {
        await this.monthlyStatsRepo.update(existing.id, {
          total_income: stats.total_income || 0,
          total_expense: stats.total_expense || 0,
          net_amount: stats.net_amount || 0,
          transaction_count: stats.transaction_count || 0,
          avg_daily_expense: stats.avg_daily_expense || 0,
          savings_rate: savingsRate,
          updated_at: new Date(),
        });
      } else {
        await this.monthlyStatsRepo.save({
          user_id: userId,
          year,
          month,
          total_income: stats.total_income || 0,
          total_expense: stats.total_expense || 0,
          net_amount: stats.net_amount || 0,
          transaction_count: stats.transaction_count || 0,
          avg_daily_expense: stats.avg_daily_expense || 0,
          savings_rate: savingsRate,
        });
      }
    }
  }

  /**
   * Calculate category spending patterns
   */
  async calculateCategoryPatterns(userId: number, year: number, month: number): Promise<void> {
    const patterns = await this.dailyStatsRepo.query(`
      SELECT 
        t.category_id,
        SUM(t.amount) as total_amount,
        COUNT(*) as transaction_count,
        AVG(t.amount) as avg_amount
      FROM transactions t
      WHERE t.user_id = ${userId}
        AND YEAR(t.transaction_date) = ${year}
        AND MONTH(t.transaction_date) = ${month}
        AND t.type = 'expense'
      GROUP BY t.category_id
    `);

    const totalExpense = patterns.reduce((sum, p) => sum + parseFloat(p.total_amount), 0);

    for (const pattern of patterns) {
      const percentage = totalExpense > 0 
        ? (parseFloat(pattern.total_amount) / totalExpense) * 100 
        : 0;

      // Determine trend (compare with previous month)
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      
      const prevPattern = await this.categoryPatternsRepo.findOne({
        where: {
          user_id: userId,
          category_id: pattern.category_id,
          year: prevYear,
          month: prevMonth,
        },
      });

      let trend = 'STABLE';
      if (prevPattern) {
        const change = ((parseFloat(pattern.total_amount) - prevPattern.total_amount) / prevPattern.total_amount) * 100;
        if (change > 10) trend = 'INCREASING';
        else if (change < -10) trend = 'DECREASING';
      }

      const existingPattern = await this.categoryPatternsRepo.findOne({
        where: {
          user_id: userId,
          category_id: pattern.category_id,
          year,
          month,
        },
      });

      if (existingPattern) {
        await this.categoryPatternsRepo.update(existingPattern.id, {
          total_amount: pattern.total_amount,
          transaction_count: pattern.transaction_count,
          avg_amount: pattern.avg_amount,
          percentage_of_total: percentage,
          trend,
        });
      } else {
        await this.categoryPatternsRepo.save({
          user_id: userId,
          category_id: pattern.category_id,
          year,
          month,
          total_amount: pattern.total_amount,
          transaction_count: pattern.transaction_count,
          avg_amount: pattern.avg_amount,
          percentage_of_total: percentage,
          trend,
        });
      }
    }
  }

  /**
   * Cron job: Calculate daily statistics (runs at midnight)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async calculateAllDailyStats(): Promise<void> {
    console.log('Starting daily statistics calculation...');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Get all active users
    const users = await this.dailyStatsRepo.query(`
      SELECT DISTINCT user_id FROM transactions 
      WHERE CAST(transaction_date AS DATE) = '${yesterday.toISOString().split('T')[0]}'
    `);

    for (const user of users) {
      await this.calculateDailyStats(user.user_id, yesterday);
    }

    console.log(`Daily statistics calculated for ${users.length} users`);
  }

  /**
   * Cron job: Calculate monthly statistics (runs on 1st of month)
   */
  @Cron('0 1 1 * *') // At 01:00 on day 1 of every month
  async calculateAllMonthlyStats(): Promise<void> {
    console.log('Starting monthly statistics calculation...');
    
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth() + 1;

    // Get all users who had transactions last month
    const users = await this.dailyStatsRepo.query(`
      SELECT DISTINCT user_id FROM transactions 
      WHERE YEAR(transaction_date) = ${year} AND MONTH(transaction_date) = ${month}
    `);

    for (const user of users) {
      await this.calculateMonthlyStats(user.user_id, year, month);
      await this.calculateCategoryPatterns(user.user_id, year, month);
    }

    console.log(`Monthly statistics calculated for ${users.length} users`);
  }

  /**
   * Cron job: Cleanup old logs (runs weekly)
   */
  @Cron(CronExpression.EVERY_WEEK)
  async cleanupOldLogs(): Promise<void> {
    console.log('Starting log cleanup...');
    
    await this.dailyStatsRepo.query('EXEC sp_cleanup_old_logs @days_to_keep = 90');
    
    console.log('Log cleanup completed');
  }

  /**
   * Get API performance metrics
   */
  async getApiPerformanceMetrics(hours: number = 24): Promise<any> {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    const metrics = await this.apiLogsRepo
      .createQueryBuilder('log')
      .select('log.endpoint', 'endpoint')
      .addSelect('COUNT(*)', 'request_count')
      .addSelect('AVG(log.response_time_ms)', 'avg_response_time')
      .addSelect('MAX(log.response_time_ms)', 'max_response_time')
      .addSelect('MIN(log.response_time_ms)', 'min_response_time')
      .addSelect('SUM(CASE WHEN log.status_code >= 500 THEN 1 ELSE 0 END)', 'error_count')
      .where('log.created_at >= :since', { since })
      .groupBy('log.endpoint')
      .orderBy('request_count', 'DESC')
      .limit(20)
      .getRawMany();

    return metrics;
  }

  /**
   * Get slow queries
   */
  async getSlowQueries(threshold: number = 1000): Promise<any> {
    return await this.apiLogsRepo
      .createQueryBuilder('log')
      .select('log.endpoint', 'endpoint')
      .addSelect('log.method', 'method')
      .addSelect('log.response_time_ms', 'response_time')
      .addSelect('log.created_at', 'timestamp')
      .where('log.response_time_ms > :threshold', { threshold })
      .orderBy('log.response_time_ms', 'DESC')
      .limit(50)
      .getRawMany();
  }

  /**
   * Get error rate
   */
  async getErrorRate(hours: number = 24): Promise<any> {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    const stats = await this.apiLogsRepo
      .createQueryBuilder('log')
      .select('COUNT(*)', 'total_requests')
      .addSelect('SUM(CASE WHEN log.status_code >= 400 THEN 1 ELSE 0 END)', 'error_count')
      .addSelect('SUM(CASE WHEN log.status_code >= 500 THEN 1 ELSE 0 END)', 'server_error_count')
      .where('log.created_at >= :since', { since })
      .getRawOne();

    const errorRate = stats.total_requests > 0
      ? (stats.error_count / stats.total_requests) * 100
      : 0;

    return {
      total_requests: parseInt(stats.total_requests),
      error_count: parseInt(stats.error_count),
      server_error_count: parseInt(stats.server_error_count),
      error_rate: errorRate.toFixed(2) + '%',
    };
  }

  /**
   * Optimize database indexes
   */
  async optimizeIndexes(): Promise<void> {
    // Rebuild fragmented indexes
    await this.dailyStatsRepo.query(`
      DECLARE @TableName VARCHAR(255);
      DECLARE @IndexName VARCHAR(255);
      DECLARE @FragmentationPercent FLOAT;
      
      DECLARE index_cursor CURSOR FOR
      SELECT 
        OBJECT_NAME(ips.object_id) AS TableName,
        i.name AS IndexName,
        ips.avg_fragmentation_in_percent
      FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') ips
      INNER JOIN sys.indexes i ON ips.object_id = i.object_id AND ips.index_id = i.index_id
      WHERE ips.avg_fragmentation_in_percent > 30
        AND i.name IS NOT NULL;
      
      OPEN index_cursor;
      FETCH NEXT FROM index_cursor INTO @TableName, @IndexName, @FragmentationPercent;
      
      WHILE @@FETCH_STATUS = 0
      BEGIN
        EXEC('ALTER INDEX ' + @IndexName + ' ON ' + @TableName + ' REBUILD');
        FETCH NEXT FROM index_cursor INTO @TableName, @IndexName, @FragmentationPercent;
      END;
      
      CLOSE index_cursor;
      DEALLOCATE index_cursor;
    `);
  }

  /**
   * Update statistics
   */
  async updateStatistics(): Promise<void> {
    await this.dailyStatsRepo.query('EXEC sp_updatestats');
  }

  /**
   * Get database size
   */
  async getDatabaseSize(): Promise<any> {
    const result = await this.dailyStatsRepo.query(`
      SELECT 
        SUM(size) * 8 / 1024 AS size_mb
      FROM sys.master_files
      WHERE database_id = DB_ID()
    `);

    return {
      size_mb: result[0].size_mb,
      size_gb: (result[0].size_mb / 1024).toFixed(2),
    };
  }

  /**
   * Get table sizes
   */
  async getTableSizes(): Promise<any> {
    return await this.dailyStatsRepo.query(`
      SELECT 
        t.NAME AS TableName,
        p.rows AS RowCounts,
        SUM(a.total_pages) * 8 / 1024 AS TotalSpaceMB,
        SUM(a.used_pages) * 8 / 1024 AS UsedSpaceMB,
        (SUM(a.total_pages) - SUM(a.used_pages)) * 8 / 1024 AS UnusedSpaceMB
      FROM sys.tables t
      INNER JOIN sys.indexes i ON t.OBJECT_ID = i.object_id
      INNER JOIN sys.partitions p ON i.object_id = p.OBJECT_ID AND i.index_id = p.index_id
      INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
      WHERE t.is_ms_shipped = 0
      GROUP BY t.Name, p.Rows
      ORDER BY TotalSpaceMB DESC
    `);
  }
}
