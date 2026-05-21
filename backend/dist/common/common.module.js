"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const cache_service_1 = require("./services/cache.service");
const performance_service_1 = require("./services/performance.service");
const performance_controller_1 = require("./controllers/performance.controller");
const query_cache_entity_1 = require("../entities/query-cache.entity");
const daily_statistics_entity_1 = require("../entities/daily-statistics.entity");
const monthly_statistics_entity_1 = require("../entities/monthly-statistics.entity");
const category_pattern_entity_1 = require("../entities/category-pattern.entity");
const api_log_entity_1 = require("../entities/api-log.entity");
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                query_cache_entity_1.QueryCache,
                daily_statistics_entity_1.DailyStatistics,
                monthly_statistics_entity_1.MonthlyStatistics,
                category_pattern_entity_1.CategoryPattern,
                api_log_entity_1.ApiLog,
            ]),
            cache_manager_1.CacheModule.register({
                ttl: 3600,
                max: 1000,
            }),
        ],
        controllers: [performance_controller_1.PerformanceController],
        providers: [cache_service_1.CacheService, performance_service_1.PerformanceService],
        exports: [cache_service_1.CacheService, performance_service_1.PerformanceService],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map