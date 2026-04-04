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
exports.FinancialInsightsController = void 0;
const common_1 = require("@nestjs/common");
const financial_insights_service_1 = require("./financial-insights.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let FinancialInsightsController = class FinancialInsightsController {
    financialInsightsService;
    constructor(financialInsightsService) {
        this.financialInsightsService = financialInsightsService;
    }
    getSpendingByCategory(req, month) {
        return this.financialInsightsService.getSpendingByCategory(req.user.userId, month);
    }
    getMonthlyTrend(req, months) {
        return this.financialInsightsService.getMonthlyTrend(req.user.userId, months ? parseInt(months) : 6);
    }
    getRecommendations(req) {
        return this.financialInsightsService.getRecommendations(req.user.userId);
    }
    getSpendingForecast(req, months) {
        return this.financialInsightsService.getSpendingForecast(req.user.userId, months ? parseInt(months) : 3);
    }
    getFinancialSummary(req) {
        return this.financialInsightsService.getFinancialSummary(req.user.userId);
    }
};
exports.FinancialInsightsController = FinancialInsightsController;
__decorate([
    (0, common_1.Get)('spending-by-category'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FinancialInsightsController.prototype, "getSpendingByCategory", null);
__decorate([
    (0, common_1.Get)('monthly-trend'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FinancialInsightsController.prototype, "getMonthlyTrend", null);
__decorate([
    (0, common_1.Get)('recommendations'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FinancialInsightsController.prototype, "getRecommendations", null);
__decorate([
    (0, common_1.Get)('spending-forecast'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FinancialInsightsController.prototype, "getSpendingForecast", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FinancialInsightsController.prototype, "getFinancialSummary", null);
exports.FinancialInsightsController = FinancialInsightsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('financial-insights'),
    __metadata("design:paramtypes", [financial_insights_service_1.FinancialInsightsService])
], FinancialInsightsController);
//# sourceMappingURL=financial-insights.controller.js.map