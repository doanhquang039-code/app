import type { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { QueryCache } from '../../entities/query-cache.entity';
interface CacheOptions {
    ttl?: number;
    useDatabase?: boolean;
    tags?: string[];
}
export declare class CacheService {
    private cacheManager;
    private queryCacheRepo;
    constructor(cacheManager: Cache, queryCacheRepo: Repository<QueryCache>);
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
    delete(key: string): Promise<void>;
    deletePattern(pattern: string): Promise<void>;
    clear(): Promise<void>;
    getOrSet<T>(key: string, factory: () => Promise<T>, options?: CacheOptions): Promise<T>;
    invalidateByTags(tags: string[]): Promise<void>;
    getStats(): Promise<any>;
    cleanup(): Promise<void>;
}
export {};
