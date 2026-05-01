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
exports.AdvancedDashboardController = void 0;
const common_1 = require("@nestjs/common");
const advanced_dashboard_service_1 = require("./advanced-dashboard.service");
let AdvancedDashboardController = class AdvancedDashboardController {
    advancedDashboardService;
    constructor(advancedDashboardService) {
        this.advancedDashboardService = advancedDashboardService;
    }
    async getAdvancedDashboard(userId) {
        return await this.advancedDashboardService.getAdvancedDashboard(userId);
    }
    async getRealTimeStats(userId) {
        return await this.advancedDashboardService.getRealTimeStats(userId);
    }
};
exports.AdvancedDashboardController = AdvancedDashboardController;
__decorate([
    (0, common_1.Get)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdvancedDashboardController.prototype, "getAdvancedDashboard", null);
__decorate([
    (0, common_1.Get)(':userId/realtime'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdvancedDashboardController.prototype, "getRealTimeStats", null);
exports.AdvancedDashboardController = AdvancedDashboardController = __decorate([
    (0, common_1.Controller)('dashboard/advanced'),
    __metadata("design:paramtypes", [advanced_dashboard_service_1.AdvancedDashboardService])
], AdvancedDashboardController);
//# sourceMappingURL=advanced-dashboard.controller.js.map