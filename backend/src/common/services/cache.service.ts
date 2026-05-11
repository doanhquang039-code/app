import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { QueryCache } from '../../entities/query-cache.entity';

/**
 * Advanced Caching Service
 * Provides multi-layer caching with Redis and Database fallback
 */

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  useDatabase?: boolean; // Store in database cache table
  tags?: string[]; // Cache tags for invalidation
}

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(QueryCache)
    private queryCacheRepo: Repository<QueryCache>,
  ) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Try Redis first
      const redisValue = await this.cacheManager.get<T>(key);
      if (redisValue) {
        return redisValue;
      }

      // Fallback to database cache
      const dbCache = await this.queryCacheRepo.findOne({
        where: {
          cache_key: key,
          expires_at: MoreThan(new Date()),
        },
      });

      if (dbCache) {
        const value = JSON.parse(dbCache.cache_value);
        // Restore to Redis
        await this.cacheManager.set(key, value, dbCache.expires_at.getTime() - Date.now());
        
        // Update hit count
        await this.queryCacheRepo.update(dbCache.id, {
          hit_count: dbCache.hit_count + 1,
        });
        
        return value;
      }

      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const ttl = options.ttl || 3600; // Default 1 hour
    const expiresAt = new Date(Date.now() + ttl * 1000);

    try {
      // Set in Redis
      await this.cacheManager.set(key, value, ttl);

      // Optionally store in database
      if (options.useDatabase) {
        const existing = await this.queryCacheRepo.findOne({ where: { cache_key: key } });
        if (existing) {
          await this.queryCacheRepo.update(existing.id, {
            cache_value: JSON.stringify(value),
            expires_at: expiresAt,
            updated_at: new Date(),
          });
        } else {
          await this.queryCacheRepo.save({
            cache_key: key,
            cache_value: JSON.stringify(value),
            expires_at: expiresAt,
          });
        }
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      await this.queryCacheRepo.delete({ cache_key: key });
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      // For Redis
      const keys = await this.cacheManager.store.keys(pattern);
      if (keys && keys.length > 0) {
        await Promise.all(keys.map(key => this.cacheManager.del(key)));
      }

      // For database
      await this.queryCacheRepo
        .createQueryBuilder()
        .delete()
        .where('cache_key LIKE :pattern', { pattern: `%${pattern}%` })
        .execute();
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      await this.cacheManager.reset();
      await this.queryCacheRepo.clear();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Get or set cache (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Generate value
    const value = await factory();

    // Store in cache
    await this.set(key, value, options);

    return value;
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    for (const tag of tags) {
      await this.deletePattern(`*:${tag}:*`);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    const dbStats = await this.queryCacheRepo
      .createQueryBuilder('cache')
      .select('COUNT(*)', 'total')
      .addSelect('SUM(hit_count)', 'total_hits')
      .addSelect('AVG(hit_count)', 'avg_hits')
      .getRawOne();

    return {
      database: dbStats,
      redis: {
        // Redis stats would come from Redis INFO command
        connected: true,
      },
    };
  }

  /**
   * Cleanup expired cache
   */
  async cleanup(): Promise<void> {
    await this.queryCacheRepo.delete({
      expires_at: LessThan(new Date()),
    });
  }
}
