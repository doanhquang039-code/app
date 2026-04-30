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
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
let RedisService = class RedisService {
    cacheManager;
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
    }
    async get(key) {
        return await this.cacheManager.get(key);
    }
    async set(key, value, ttl) {
        await this.cacheManager.set(key, value, ttl);
    }
    async del(key) {
        await this.cacheManager.del(key);
    }
    async reset() {
        await this.cacheManager.reset();
    }
    async setUserSession(userId, data, ttl = 3600) {
        await this.set(`user:session:${userId}`, data, ttl);
    }
    async getUserSession(userId) {
        return await this.get(`user:session:${userId}`);
    }
    async deleteUserSession(userId) {
        await this.del(`user:session:${userId}`);
    }
    async cacheTransactions(userId, transactions, ttl = 300) {
        await this.set(`transactions:${userId}`, transactions, ttl);
    }
    async getCachedTransactions(userId) {
        return await this.get(`transactions:${userId}`);
    }
    async invalidateTransactionCache(userId) {
        await this.del(`transactions:${userId}`);
    }
    async cacheAnalytics(userId, period, data, ttl = 600) {
        await this.set(`analytics:${userId}:${period}`, data, ttl);
    }
    async getCachedAnalytics(userId, period) {
        return await this.get(`analytics:${userId}:${period}`);
    }
    async incrementRateLimit(key, ttl = 60) {
        const current = await this.get(key) || 0;
        const newValue = current + 1;
        await this.set(key, newValue, ttl);
        return newValue;
    }
    async checkRateLimit(key, limit) {
        const current = await this.get(key) || 0;
        return current < limit;
    }
    async publish(channel, message) {
        console.log(`Publishing to ${channel}:`, message);
    }
    async subscribe(channel, callback) {
        console.log(`Subscribed to ${channel}`);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], RedisService);
//# sourceMappingURL=redis.service.js.map