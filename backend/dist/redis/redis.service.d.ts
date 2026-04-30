import type { Cache } from 'cache-manager';
export declare class RedisService {
    private cacheManager;
    constructor(cacheManager: Cache);
    get<T>(key: string): Promise<T | undefined>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    reset(): Promise<void>;
    setUserSession(userId: number, data: any, ttl?: number): Promise<void>;
    getUserSession(userId: number): Promise<any>;
    deleteUserSession(userId: number): Promise<void>;
    cacheTransactions(userId: number, transactions: any[], ttl?: number): Promise<void>;
    getCachedTransactions(userId: number): Promise<any[] | undefined>;
    invalidateTransactionCache(userId: number): Promise<void>;
    cacheAnalytics(userId: number, period: string, data: any, ttl?: number): Promise<void>;
    getCachedAnalytics(userId: number, period: string): Promise<any>;
    incrementRateLimit(key: string, ttl?: number): Promise<number>;
    checkRateLimit(key: string, limit: number): Promise<boolean>;
    publish(channel: string, message: any): Promise<void>;
    subscribe(channel: string, callback: (message: any) => void): Promise<void>;
}
