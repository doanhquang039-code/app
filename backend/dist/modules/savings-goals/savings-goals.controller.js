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
exports.SavingsGoalsController = void 0;
const common_1 = require("@nestjs/common");
const savings_goals_service_1 = require("./savings-goals.service");
const create_savings_goal_dto_1 = require("./dto/create-savings-goal.dto");
const update_savings_goal_dto_1 = require("./dto/update-savings-goal.dto");
const query_savings_goal_dto_1 = require("./dto/query-savings-goal.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let SavingsGoalsController = class SavingsGoalsController {
    savingsGoalsService;
    constructor(savingsGoalsService) {
        this.savingsGoalsService = savingsGoalsService;
    }
    create(req, dto) {
        return this.savingsGoalsService.create(req.user.userId, dto);
    }
    findAll(req, query) {
        return this.savingsGoalsService.findAll(req.user.userId, query);
    }
    findOne(req, id) {
        return this.savingsGoalsService.findOne(req.user.userId, +id);
    }
    getProgress(req, id) {
        return this.savingsGoalsService.getProgress(req.user.userId, +id);
    }
    update(req, id, dto) {
        return this.savingsGoalsService.update(req.user.userId, +id, dto);
    }
    remove(req, id) {
        return this.savingsGoalsService.remove(req.user.userId, +id);
    }
    addToGoal(req, id, body) {
        return this.savingsGoalsService.addToGoal(req.user.userId, +id, body.amount);
    }
    withdrawFromGoal(req, id, body) {
        return this.savingsGoalsService.withdrawFromGoal(req.user.userId, +id, body.amount);
    }
    updateStatus(req, id, body) {
        return this.savingsGoalsService.updateStatus(req.user.userId, +id, body.status);
    }
};
exports.SavingsGoalsController = SavingsGoalsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_savings_goal_dto_1.CreateSavingsGoalDto]),
    __metadata("design:returntype", void 0)
], SavingsGoalsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_savings_goal_dto_1.QuerySavingsGoalDto]),
    __metadata("design:returntype", void 0)
], SavingsGoalsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SavingsGoalsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/progress'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SavingsGoalsController.prototype, "getProgress", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_savings_goal_dto_1.UpdateSavingsGoalDto]),
    __metadata("design:returntype", void 0)
], SavingsGoalsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SavingsGoalsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/add'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SavingsGoalsController.prototype, "addToGoal", null);
__decorate([
    (0, common_1.Post)(':id/withdraw'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SavingsGoalsController.prototype, "withdrawFromGoal", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], SavingsGoalsController.prototype, "updateStatus", null);
exports.SavingsGoalsController = SavingsGoalsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('savings-goals'),
    __metadata("design:paramtypes", [savings_goals_service_1.SavingsGoalsService])
], SavingsGoalsController);
//# sourceMappingURL=savings-goals.controller.js.map