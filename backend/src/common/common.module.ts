import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from './services/cache.service';
import { PerformanceService } from './services/performance.service';
import { PerformanceController } from './controllers/performance.controller';
import { QueryCache } from '../entities/query-cache.entity';
import { DailyStatistics } from '../entities/daily-statistics.entity';
import { MonthlyStatistics } from '../entities/monthly-statistics.entity';
import { CategoryPattern } from '../entities/category-pattern.entity';
import { ApiLog } from '../entities/api-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QueryCache,
      DailyStatistics,
      MonthlyStatistics,
      CategoryPattern,
      ApiLog,
    ]),
    CacheModule.register({
      ttl: 3600, // 1 hour default
      max: 1000, // Maximum number of items in cache
    }),
  ],
  controllers: [PerformanceController],
  providers: [CacheService, PerformanceService],
  exports: [CacheService, PerformanceService],
})
export class CommonModule {}
