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
exports.FinancialReportsController = void 0;
const common_1 = require("@nestjs/common");
const financial_reports_service_1 = require("./financial-reports.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let FinancialReportsController = class FinancialReportsController {
    reportsService;
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    generateMonthly(req, month, year) {
        return this.reportsService.generateMonthlyReport(req.user.id, month, year);
    }
    generateQuarterly(req, quarter, year) {
        return this.reportsService.generateQuarterlyReport(req.user.id, quarter, year);
    }
    generateYearly(req, year) {
        return this.reportsService.generateYearlyReport(req.user.id, year);
    }
    getReports(req, reportType) {
        return this.reportsService.getReportsByUser(req.user.id, reportType);
    }
    getReport(id, req) {
        return this.reportsService.getReport(+id, req.user.id);
    }
    exportAsJSON(id, req) {
        return this.reportsService.exportReportAsJSON(+id, req.user.id);
    }
    async exportAsCSV(id, req) {
        const csv = await this.reportsService.exportReportAsCSV(+id, req.user.id);
        return { csv };
    }
    deleteReport(id, req) {
        return this.reportsService.deleteReport(+id, req.user.id);
    }
};
exports.FinancialReportsController = FinancialReportsController;
__decorate([
    (0, common_1.Post)('monthly'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", void 0)
], FinancialReportsController.prototype, "generateMonthly", null);
__decorate([
    (0, common_1.Post)('quarterly'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('quarter')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", void 0)
], FinancialReportsController.prototype, "generateQuarterly", null);
__decorate([
    (0, common_1.Post)('yearly'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], FinancialReportsController.prototype, "generateYearly", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('reportType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FinancialReportsController.prototype, "getReports", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FinancialReportsController.prototype, "getReport", null);
__decorate([
    (0, common_1.Get)(':id/export/json'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FinancialReportsController.prototype, "exportAsJSON", null);
__decorate([
    (0, common_1.Get)(':id/export/csv'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FinancialReportsController.prototype, "exportAsCSV", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FinancialReportsController.prototype, "deleteReport", null);
exports.FinancialReportsController = FinancialReportsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('financial-reports'),
    __metadata("design:paramtypes", [financial_reports_service_1.FinancialReportsService])
], FinancialReportsController);
//# sourceMappingURL=financial-reports.controller.js.map