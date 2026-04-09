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
exports.SharedExpensesController = void 0;
const common_1 = require("@nestjs/common");
const shared_expenses_service_1 = require("./shared-expenses.service");
const shared_expense_dto_1 = require("./dto/shared-expense.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let SharedExpensesController = class SharedExpensesController {
    sharedExpensesService;
    constructor(sharedExpensesService) {
        this.sharedExpensesService = sharedExpensesService;
    }
    createGroup(req, createGroupDto) {
        return this.sharedExpensesService.createGroup(req.user.id, createGroupDto);
    }
    getGroups(req) {
        return this.sharedExpensesService.getGroupsForUser(req.user.id);
    }
    getGroupDetails(groupId, req) {
        return this.sharedExpensesService.getGroupDetails(+groupId, req.user.id);
    }
    updateGroup(groupId, req, updateGroupDto) {
        return this.sharedExpensesService.updateGroup(+groupId, req.user.id, updateGroupDto);
    }
    deleteGroup(groupId, req) {
        return this.sharedExpensesService.deleteGroup(+groupId, req.user.id);
    }
    addMember(groupId, memberId, req) {
        return this.sharedExpensesService.addMemberToGroup(+groupId, +memberId, req.user.id);
    }
    removeMember(groupId, memberId, req) {
        return this.sharedExpensesService.removeMemberFromGroup(+groupId, +memberId, req.user.id);
    }
    createExpense(groupId, req, createExpenseDto) {
        return this.sharedExpensesService.createSharedExpense(req.user.id, +groupId, createExpenseDto);
    }
    getGroupExpenses(groupId, req) {
        return this.sharedExpensesService.getGroupExpenses(+groupId, req.user.id);
    }
    getExpenseDetails(groupId, expenseId, req) {
        return this.sharedExpensesService.getExpenseDetails(+expenseId, req.user.id);
    }
    deleteExpense(groupId, expenseId, req) {
        return this.sharedExpensesService.deleteExpense(+expenseId, req.user.id);
    }
    getSettlements(groupId, req) {
        return this.sharedExpensesService.getSettlementsForGroup(+groupId, req.user.id);
    }
    getMySettlements(groupId, req) {
        return this.sharedExpensesService.getSettlementsForUser(+groupId, req.user.id);
    }
    settlePayment(settlementId, req) {
        return this.sharedExpensesService.settlePayment(+settlementId, req.user.id);
    }
    getBalance(groupId, req) {
        return this.sharedExpensesService.getGroupBalance(+groupId, req.user.id);
    }
    getExpenseSummary(groupId, req) {
        return this.sharedExpensesService.getExpenseSummary(+groupId, req.user.id);
    }
};
exports.SharedExpensesController = SharedExpensesController;
__decorate([
    (0, common_1.Post)('groups'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, shared_expense_dto_1.CreateGroupDto]),
    __metadata("design:returntype", void 0)
], SharedExpensesController.prototype, "createGroup", null);
__decorate([
    (0, common_1.Get)('groups'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SharedExpensesController.prototype, "getGroups", null);
__decorate([
    (0, common_1.Get)('groups/:groupId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SharedExpensesController.prototype, "getGroupDetails", null);
__decorate([
    (0, common_1.Put)('groups/:groupId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, shared_expense_dto_1.UpdateGroupDto]),
    __metadata("design:returntype", void 0)
], SharedExpensesController.prototype, "updateGroup", null);
__decorate([
    (0, common_1.Delete)('groups/:groupId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SharedExpensesController.prototype, "deleteGroup", null);
__decorate([
    (0, common_1.Post)('groups/:groupId/members/:memberId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('memberId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SharedExpensesController.prototype, "addMember", null);
__decorate([
    (0, common_1.Delete)('groups/:groupId/members/:memberId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('memberId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SharedExpensesController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Post)('groups/:groupId/expenses'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, shared_expense_dto_1.CreateSharedExpenseDto]),
    __metadata("design:returntype", void 0)
], SharedExpensesController.prototype, "createExpense", null);
__decorate([
    (0, common_1.Get)('groups/:groupId/expenses'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SharedExpensesController.prototype, "getGroupExpenses", null);
__decorate([
    (0, common_1.Get)('groups/:groupId/expenses/:expenseId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('expenseId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SharedExpensesController.prototype, "getExpenseDetails", null);
__decorate([
    (0, common_1.Delete)('groups/:groupId/expenses/:expenseId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('expenseId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SharedExpensesController.prototype, "deleteExpense", null);
__decorate([
    (0, common_1.Get)('groups/:groupId/settlements'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SharedExpensesController.prototype, "getSettlements", null);
__decorate([
    (0, common_1.Get)('groups/:groupId/my-settlements'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SharedExpensesController.prototype, "getMySettlements", null);
__decorate([
    (0, common_1.Put)('settlements/:settlementId/settle'),
    __param(0, (0, common_1.Param)('settlementId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SharedExpensesController.prototype, "settlePayment", null);
__decorate([
    (0, common_1.Get)('groups/:groupId/balance'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SharedExpensesController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)('groups/:groupId/summary'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SharedExpensesController.prototype, "getExpenseSummary", null);
exports.SharedExpensesController = SharedExpensesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('shared-expenses'),
    __metadata("design:paramtypes", [shared_expenses_service_1.SharedExpensesService])
], SharedExpensesController);
//# sourceMappingURL=shared-expenses.controller.js.map