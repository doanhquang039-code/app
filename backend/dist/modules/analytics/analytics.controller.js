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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("./analytics.service");
const analytics_dto_1 = require("./dto/analytics.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let AnalyticsController = class AnalyticsController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    generateDaily(date, req) {
        return this.analyticsService.generateDailyAnalytics(req.user.id, new Date(date));
    }
    generateWeekly(startDate, req) {
        return this.analyticsService.generateWeeklyAnalytics(req.user.id, new Date(startDate));
    }
    generateMonthly(req, month, year) {
        return this.analyticsService.generateMonthlyAnalytics(req.user.id, month, year);
    }
    getAnalyticsRange(req, startDate, endDate, period = 'monthly') {
        return this.analyticsService.getAnalyticsRange(req.user.id, new Date(startDate), new Date(endDate), period);
    }
    compareMonths(req, currentMonth, currentYear, previousMonth, previousYear) {
        return this.analyticsService.compareMonths(req.user.id, currentMonth, currentYear, previousMonth, previousYear);
    }
    getSpendingTrend(req, days = 30) {
        return this.analyticsService.getSpendingTrend(req.user.id, days);
    }
    async getPredictedExpense(req) {
        const predicted = await this.analyticsService.getPredictedMonthlyExpense(req.user.id);
        return { predictedMonthlyExpense: predicted };
    }
    createForecast(req, createForecastDto) {
        return this.analyticsService.createForecast(req.user.id, createForecastDto);
    }
    getForecastsForMonth(req, month, year) {
        return this.analyticsService.getForecastsForMonth(req.user.id, month, year);
    }
    updateForecast(id, req, { actualAmount }) {
        return this.analyticsService.updateForecastWithActual(+id, req.user.id, actualAmount);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Post)('daily/:date'),
    __param(0, (0, common_1.Param)('date')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "generateDaily", null);
__decorate([
    (0, common_1.Post)('weekly/:startDate'),
    __param(0, (0, common_1.Param)('startDate')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "generateWeekly", null);
__decorate([
    (0, common_1.Post)('monthly'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "generateMonthly", null);
__decorate([
    (0, common_1.Get)('range'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getAnalyticsRange", null);
__decorate([
    (0, common_1.Get)('compare-months'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('currentMonth')),
    __param(2, (0, common_1.Query)('currentYear')),
    __param(3, (0, common_1.Query)('previousMonth')),
    __param(4, (0, common_1.Query)('previousYear')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, Number, Number]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "compareMonths", null);
__decorate([
    (0, common_1.Get)('spending-trend'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getSpendingTrend", null);
__decorate([
    (0, common_1.Get)('predicted-expense'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getPredictedExpense", null);
__decorate([
    (0, common_1.Post)('forecast'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, analytics_dto_1.CreateForecastDto]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "createForecast", null);
__decorate([
    (0, common_1.Get)('forecast'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getForecastsForMonth", null);
__decorate([
    (0, common_1.Put)('forecast/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "updateForecast", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map