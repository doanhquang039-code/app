"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const query_cache_entity_1 = require("../../entities/query-cache.entity");
let CacheService = class CacheService {
    cacheManager;
    queryCacheRepo;
    constructor(cacheManager, queryCacheRepo) {
        this.cacheManager = cacheManager;
        this.queryCacheRepo = queryCacheRepo;
    }
    async get(key) {
        try {
            const redisValue = await this.cacheManager.get(key);
            if (redisValue) {
                return redisValue;
            }
            const dbCache = await this.queryCacheRepo.findOne({
                where: {
                    cache_key: key,
                    expires_at: (0, typeorm_2.MoreThan)(new Date()),
                },
            });
            if (dbCache) {
                const value = JSON.parse(dbCache.cache_value);
                await this.cacheManager.set(key, value, dbCache.expires_at.getTime() - Date.now());
                await this.queryCacheRepo.update(dbCache.id, {
                    hit_count: dbCache.hit_count + 1,
                });
                return value;
            }
            return null;
        }
        catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }
    async set(key, value, options = {}) {
        const ttl = options.ttl || 3600;
        const expiresAt = new Date(Date.now() + ttl * 1000);
        try {
            await this.cacheManager.set(key, value, ttl);
            if (options.useDatabase) {
                const existing = await this.queryCacheRepo.findOne({ where: { cache_key: key } });
                if (existing) {
                    await this.queryCacheRepo.update(existing.id, {
                        cache_value: JSON.stringify(value),
                        expires_at: expiresAt,
                        updated_at: new Date(),
                    });
                }
                else {
                    await this.queryCacheRepo.save({
                        cache_key: key,
                        cache_value: JSON.stringify(value),
                        expires_at: expiresAt,
                    });
                }
            }
        }
        catch (error) {
            console.error('Cache set error:', error);
        }
    }
    async delete(key) {
        try {
            await this.cacheManager.del(key);
            await this.queryCacheRepo.delete({ cache_key: key });
        }
        catch (error) {
            console.error('Cache delete error:', error);
        }
    }
    async deletePattern(pattern) {
        try {
            const keys = await this.cacheManager.store.keys(pattern);
            if (keys && keys.length > 0) {
                await Promise.all(keys.map(key => this.cacheManager.del(key)));
            }
            await this.queryCacheRepo
                .createQueryBuilder()
                .delete()
                .where('cache_key LIKE :pattern', { pattern: `%${pattern}%` })
                .execute();
        }
        catch (error) {
            console.error('Cache delete pattern error:', error);
        }
    }
    async clear() {
        try {
            await this.cacheManager.reset();
            await this.queryCacheRepo.clear();
        }
        catch (error) {
            console.error('Cache clear error:', error);
        }
    }
    async getOrSet(key, factory, options = {}) {
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }
        const value = await factory();
        await this.set(key, value, options);
        return value;
    }
    async invalidateByTags(tags) {
        for (const tag of tags) {
            await this.deletePattern(`*:${tag}:*`);
        }
    }
    async getStats() {
        const dbStats = await this.queryCacheRepo
            .createQueryBuilder('cache')
            .select('COUNT(*)', 'total')
            .addSelect('SUM(hit_count)', 'total_hits')
            .addSelect('AVG(hit_count)', 'avg_hits')
            .getRawOne();
        return {
            database: dbStats,
            redis: {
                connected: true,
            },
        };
    }
    async cleanup() {
        await this.queryCacheRepo.delete({
            expires_at: (0, typeorm_2.LessThan)(new Date()),
        });
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __param(1, (0, typeorm_1.InjectRepository)(query_cache_entity_1.QueryCache)),
    __metadata("design:paramtypes", [Object, typeorm_2.Repository])
], CacheService);
//# sourceMappingURL=cache.service.js.map