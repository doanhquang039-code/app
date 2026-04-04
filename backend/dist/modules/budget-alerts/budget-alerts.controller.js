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
exports.BudgetAlertsController = void 0;
const common_1 = require("@nestjs/common");
const budget_alerts_service_1 = require("./budget-alerts.service");
const create_budget_alert_dto_1 = require("./dto/create-budget-alert.dto");
const update_budget_alert_dto_1 = require("./dto/update-budget-alert.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let BudgetAlertsController = class BudgetAlertsController {
    budgetAlertsService;
    constructor(budgetAlertsService) {
        this.budgetAlertsService = budgetAlertsService;
    }
    create(req, dto) {
        return this.budgetAlertsService.create(req.user.userId, dto);
    }
    findAll(req) {
        return this.budgetAlertsService.findAll(req.user.userId);
    }
    findOne(req, id) {
        return this.budgetAlertsService.findOne(req.user.userId, +id);
    }
    checkStatus(req, budgetId) {
        return this.budgetAlertsService.checkBudgetStatus(req.user.userId, +budgetId);
    }
    update(req, id, dto) {
        return this.budgetAlertsService.update(req.user.userId, +id, dto);
    }
    remove(req, id) {
        return this.budgetAlertsService.remove(req.user.userId, +id);
    }
};
exports.BudgetAlertsController = BudgetAlertsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_budget_alert_dto_1.CreateBudgetAlertDto]),
    __metadata("design:returntype", void 0)
], BudgetAlertsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BudgetAlertsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BudgetAlertsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('budget/:budgetId/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('budgetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BudgetAlertsController.prototype, "checkStatus", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_budget_alert_dto_1.UpdateBudgetAlertDto]),
    __metadata("design:returntype", void 0)
], BudgetAlertsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BudgetAlertsController.prototype, "remove", null);
exports.BudgetAlertsController = BudgetAlertsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('budget-alerts'),
    __metadata("design:paramtypes", [budget_alerts_service_1.BudgetAlertsService])
], BudgetAlertsController);
//# sourceMappingURL=budget-alerts.controller.js.map