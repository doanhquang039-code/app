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
exports.RecurringTransactionsController = void 0;
const common_1 = require("@nestjs/common");
const recurring_transactions_service_1 = require("./recurring-transactions.service");
const create_recurring_transaction_dto_1 = require("./dto/create-recurring-transaction.dto");
const update_recurring_transaction_dto_1 = require("./dto/update-recurring-transaction.dto");
const query_recurring_transaction_dto_1 = require("./dto/query-recurring-transaction.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let RecurringTransactionsController = class RecurringTransactionsController {
    recurringService;
    constructor(recurringService) {
        this.recurringService = recurringService;
    }
    create(req, dto) {
        return this.recurringService.create(req.user.userId, dto);
    }
    findAll(req, query) {
        return this.recurringService.findAll(req.user.userId, query);
    }
    findOne(req, id) {
        return this.recurringService.findOne(req.user.userId, +id);
    }
    update(req, id, dto) {
        return this.recurringService.update(req.user.userId, +id, dto);
    }
    remove(req, id) {
        return this.recurringService.remove(req.user.userId, +id);
    }
    toggleActive(req, id, body) {
        return this.recurringService.toggleActive(req.user.userId, +id, body.isActive);
    }
};
exports.RecurringTransactionsController = RecurringTransactionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_recurring_transaction_dto_1.CreateRecurringTransactionDto]),
    __metadata("design:returntype", void 0)
], RecurringTransactionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_recurring_transaction_dto_1.QueryRecurringTransactionDto]),
    __metadata("design:returntype", void 0)
], RecurringTransactionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RecurringTransactionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_recurring_transaction_dto_1.UpdateRecurringTransactionDto]),
    __metadata("design:returntype", void 0)
], RecurringTransactionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RecurringTransactionsController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/toggle'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], RecurringTransactionsController.prototype, "toggleActive", null);
exports.RecurringTransactionsController = RecurringTransactionsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('recurring-transactions'),
    __metadata("design:paramtypes", [recurring_transactions_service_1.RecurringTransactionsService])
], RecurringTransactionsController);
//# sourceMappingURL=recurring-transactions.controller.js.map