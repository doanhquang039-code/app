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
exports.PerformanceController = void 0;
const common_1 = require("@nestjs/common");
const performance_service_1 = require("../services/performance.service");
const cache_service_1 = require("../services/cache.service");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
let PerformanceController = class PerformanceController {
    performanceService;
    cacheService;
    constructor(performanceService, cacheService) {
        this.performanceService = performanceService;
        this.cacheService = cacheService;
    }
    async getMetrics(hours = '24') {
        const hoursNum = parseInt(hours) || 24;
        return await this.performanceService.getApiPerformanceMetrics(hoursNum);
    }
    async getSlowQueries(threshold = '1000') {
        const thresholdNum = parseInt(threshold) || 1000;
        return await this.performanceService.getSlowQueries(thresholdNum);
    }
    async getErrorRate(hours = '24') {
        const hoursNum = parseInt(hours) || 24;
        return await this.performanceService.getErrorRate(hoursNum);
    }
    async getDatabaseSize() {
        return await this.performanceService.getDatabaseSize();
    }
    async getTableSizes() {
        return await this.performanceService.getTableSizes();
    }
    async getCacheStats() {
        return await this.cacheService.getStats();
    }
    async clearCache() {
        await this.cacheService.clear();
        return { message: 'Cache cleared successfully' };
    }
    async cleanupCache() {
        await this.cacheService.cleanup();
        return { message: 'Expired cache cleaned up successfully' };
    }
    async optimizeIndexes() {
        await this.performanceService.optimizeIndexes();
        return { message: 'Database indexes optimized successfully' };
    }
    async updateStatistics() {
        await this.performanceService.updateStatistics();
        return { message: 'Database statistics updated successfully' };
    }
};
exports.PerformanceController = PerformanceController;
__decorate([
    (0, common_1.Get)('metrics'),
    __param(0, (0, common_1.Query)('hours')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('slow-queries'),
    __param(0, (0, common_1.Query)('threshold')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getSlowQueries", null);
__decorate([
    (0, common_1.Get)('error-rate'),
    __param(0, (0, common_1.Query)('hours')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getErrorRate", null);
__decorate([
    (0, common_1.Get)('database-size'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getDatabaseSize", null);
__decorate([
    (0, common_1.Get)('table-sizes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getTableSizes", null);
__decorate([
    (0, common_1.Get)('cache-stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getCacheStats", null);
__decorate([
    (0, common_1.Get)('clear-cache'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "clearCache", null);
__decorate([
    (0, common_1.Get)('cleanup-cache'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "cleanupCache", null);
__decorate([
    (0, common_1.Get)('optimize-indexes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "optimizeIndexes", null);
__decorate([
    (0, common_1.Get)('update-statistics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "updateStatistics", null);
exports.PerformanceController = PerformanceController = __decorate([
    (0, common_1.Controller)('api/performance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [performance_service_1.PerformanceService,
        cache_service_1.CacheService])
], PerformanceController);
//# sourceMappingURL=performance.controller.js.map