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
exports.BankAccountsController = void 0;
const common_1 = require("@nestjs/common");
const bank_accounts_service_1 = require("./bank-accounts.service");
const bank_account_dto_1 = require("./dto/bank-account.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let BankAccountsController = class BankAccountsController {
    bankAccountsService;
    constructor(bankAccountsService) {
        this.bankAccountsService = bankAccountsService;
    }
    create(req, createBankAccountDto) {
        return this.bankAccountsService.create(req.user.id, createBankAccountDto);
    }
    findAll(req) {
        return this.bankAccountsService.findAll(req.user.id);
    }
    async getTotalBalance(req) {
        const totalBalance = await this.bankAccountsService.getTotalBalance(req.user.id);
        return { totalBalance };
    }
    findOne(id, req) {
        return this.bankAccountsService.findOne(+id, req.user.id);
    }
    update(id, req, updateBankAccountDto) {
        return this.bankAccountsService.update(+id, req.user.id, updateBankAccountDto);
    }
    remove(id, req) {
        return this.bankAccountsService.remove(+id, req.user.id);
    }
    updateBalance(id, req, { balance }) {
        return this.bankAccountsService.updateBalance(+id, req.user.id, balance);
    }
    getAccountsByType(accountType, req) {
        return this.bankAccountsService.getAccountsByType(req.user.id, accountType);
    }
};
exports.BankAccountsController = BankAccountsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, bank_account_dto_1.CreateBankAccountDto]),
    __metadata("design:returntype", void 0)
], BankAccountsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BankAccountsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('total-balance'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BankAccountsController.prototype, "getTotalBalance", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BankAccountsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, bank_account_dto_1.UpdateBankAccountDto]),
    __metadata("design:returntype", void 0)
], BankAccountsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BankAccountsController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)(':id/balance'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], BankAccountsController.prototype, "updateBalance", null);
__decorate([
    (0, common_1.Get)('type/:accountType'),
    __param(0, (0, common_1.Param)('accountType')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BankAccountsController.prototype, "getAccountsByType", null);
exports.BankAccountsController = BankAccountsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('bank-accounts'),
    __metadata("design:paramtypes", [bank_accounts_service_1.BankAccountsService])
], BankAccountsController);
//# sourceMappingURL=bank-accounts.controller.js.map