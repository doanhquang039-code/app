import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  // User session management
  async setUserSession(userId: number, data: any, ttl: number = 3600): Promise<void> {
    await this.set(`user:session:${userId}`, data, ttl);
  }

  async getUserSession(userId: number): Promise<any> {
    return await this.get(`user:session:${userId}`);
  }

  async deleteUserSession(userId: number): Promise<void> {
    await this.del(`user:session:${userId}`);
  }

  // Transaction cache
  async cacheTransactions(userId: number, transactions: any[], ttl: number = 300): Promise<void> {
    await this.set(`transactions:${userId}`, transactions, ttl);
  }

  async getCachedTransactions(userId: number): Promise<any[] | undefined> {
    return await this.get(`transactions:${userId}`);
  }

  async invalidateTransactionCache(userId: number): Promise<void> {
    await this.del(`transactions:${userId}`);
  }

  // Analytics cache
  async cacheAnalytics(userId: number, period: string, data: any, ttl: number = 600): Promise<void> {
    await this.set(`analytics:${userId}:${period}`, data, ttl);
  }

  async getCachedAnalytics(userId: number, period: string): Promise<any> {
    return await this.get(`analytics:${userId}:${period}`);
  }

  // Rate limiting
  async incrementRateLimit(key: string, ttl: number = 60): Promise<number> {
    const current = await this.get<number>(key) || 0;
    const newValue = current + 1;
    await this.set(key, newValue, ttl);
    return newValue;
  }

  async checkRateLimit(key: string, limit: number): Promise<boolean> {
    const current = await this.get<number>(key) || 0;
    return current < limit;
  }

  // Pub/Sub for real-time features
  async publish(channel: string, message: any): Promise<void> {
    // Implementation depends on Redis client
    console.log(`Publishing to ${channel}:`, message);
  }

  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    // Implementation depends on Redis client
    console.log(`Subscribed to ${channel}`);
  }
}
