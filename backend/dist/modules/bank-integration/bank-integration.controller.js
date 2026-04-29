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
exports.BankIntegrationController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const bank_integration_service_1 = require("./bank-integration.service");
const plaid_service_1 = require("./plaid.service");
const swagger_1 = require("@nestjs/swagger");
let BankIntegrationController = class BankIntegrationController {
    bankService;
    plaidService;
    constructor(bankService, plaidService) {
        this.bankService = bankService;
        this.plaidService = plaidService;
    }
    async createPlaidLinkToken(req) {
        return await this.plaidService.createLinkToken(req.user.userId);
    }
    async exchangePlaidToken(req, data) {
        return await this.plaidService.exchangePublicToken(req.user.userId, data.publicToken);
    }
    async getPlaidAccounts(req) {
        return await this.plaidService.getAccounts(req.user.userId);
    }
    async syncPlaidTransactions(req, accountId) {
        return await this.plaidService.syncTransactions(req.user.userId, accountId);
    }
    async createBankAccount(req, data) {
        return await this.bankService.createBankAccount(req.user.userId, data);
    }
    async getBankAccounts(req) {
        return await this.bankService.getUserBankAccounts(req.user.userId);
    }
    async getBankAccount(req, id) {
        return await this.bankService.getBankAccount(req.user.userId, id);
    }
    async updateBankAccount(req, id, data) {
        return await this.bankService.updateBankAccount(req.user.userId, id, data);
    }
    async deleteBankAccount(req, id) {
        await this.bankService.deleteBankAccount(req.user.userId, id);
        return { success: true, message: 'Đã xóa tài khoản ngân hàng' };
    }
    async syncBankAccount(req, id) {
        return await this.bankService.syncBankAccount(req.user.userId, id);
    }
    async setPrimaryAccount(req, id) {
        return await this.bankService.setPrimaryAccount(req.user.userId, id);
    }
    async getBankTransactions(req, accountId, startDate, endDate) {
        return await this.bankService.getBankTransactions(req.user.userId, {
            accountId,
            startDate,
            endDate,
        });
    }
    async getUnreconciledTransactions(req) {
        return await this.bankService.getUnreconciledTransactions(req.user.userId);
    }
    async reconcileTransaction(req, id, data) {
        return await this.bankService.reconcileTransaction(req.user.userId, id, data.transactionId);
    }
    async createTransactionFromBank(req, id) {
        return await this.bankService.createTransactionFromBankTransaction(req.user.userId, id);
    }
    async autoReconcile(req) {
        return await this.bankService.autoReconcileTransactions(req.user.userId);
    }
    async getBankStats(req) {
        return await this.bankService.getBankAccountStats(req.user.userId);
    }
    async getBalanceHistory(req, accountId, days) {
        return await this.bankService.getBalanceHistory(req.user.userId, accountId, days ? Number(days) : 30);
    }
};
exports.BankIntegrationController = BankIntegrationController;
__decorate([
    (0, common_1.Post)('plaid/link-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo Plaid Link token để kết nối ngân hàng' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BankIntegrationController.prototype, "createPlaidLinkToken", null);
__decorate([
    (0, common_1.Post)('plaid/exchange-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Exchange public token for access token' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BankIntegrationController.prototype, "exchangePlaidToken", null);
__decorate([
    (0, common_1.Get)('plaid/accounts'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách tài khoản từ Plaid' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BankIntegrationController.prototype, "getPlaidAccounts", null);
__decorate([
    (0, common_1.Post)('plaid/sync/:accountId'),
    (0, swagger_1.ApiOperation)({ summary: 'Đồng bộ giao dịch từ Plaid' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], BankIntegrationController.prototype, "syncPlaidTransactions", null);
__decorate([
    (0, common_1.Post)('accounts'),
    (0, swagger_1.ApiOperation)({ summary: 'Thêm tài khoản ngân hàng thủ công' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BankIntegrationController.prototype, "createBankAccount", null);
__decorate([
    (0, common_1.Get)('accounts'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách tài khoản ngân hàng' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BankIntegrationController.prototype, "getBankAccounts", null);
__decorate([
    (0, common_1.Get)('accounts/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết tài khoản ngân hàng' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], BankIntegrationController.prototype, "getBankAccount", null);
__decorate([
    (0, common_1.Put)('accounts/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật tài khoản ngân hàng' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], BankIntegrationController.prototype, "updateBankAccount", null);
__decorate([
    (0, common_1.Delete)('accounts/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa tài khoản ngân hàng' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], BankIntegrationController.prototype, "deleteBankAccount", null);
__decorate([
    (0, common_1.Put)('accounts/:id/sync'),
    (0, swagger_1.ApiOperation)({ summary: 'Đồng bộ tài khoản ngân hàng' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], BankIntegrationController.prototype, "syncBankAccount", null);
__decorate([
    (0, common_1.Put)('accounts/:id/set-primary'),
    (0, swagger_1.ApiOperation)({ summary: 'Đặt tài khoản chính' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], BankIntegrationController.prototype, "setPrimaryAccount", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách giao dịch ngân hàng' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('accountId')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String, String]),
    __metadata("design:returntype", Promise)
], BankIntegrationController.prototype, "getBankTransactions", null);
__decorate([
    (0, common_1.Get)('transactions/unreconciled'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy giao dịch chưa đối soát' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BankIntegrationController.prototype, "getUnreconciledTransactions", null);
__decorate([
    (0, common_1.Post)('transactions/:id/reconcile'),
    (0, swagger_1.ApiOperation)({ summary: 'Đối soát giao dịch ngân hàng với giao dịch thủ công' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], BankIntegrationController.prototype, "reconcileTransaction", null);
__decorate([
    (0, common_1.Post)('transactions/:id/create-transaction'),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo giao dịch từ giao dịch ngân hàng' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], BankIntegrationController.prototype, "createTransactionFromBank", null);
__decorate([
    (0, common_1.Post)('transactions/auto-reconcile'),
    (0, swagger_1.ApiOperation)({ summary: 'Tự động đối soát giao dịch' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BankIntegrationController.prototype, "autoReconcile", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Thống kê tài khoản ngân hàng' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BankIntegrationController.prototype, "getBankStats", null);
__decorate([
    (0, common_1.Get)('balance-history'),
    (0, swagger_1.ApiOperation)({ summary: 'Lịch sử số dư tài khoản' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('accountId')),
    __param(2, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], BankIntegrationController.prototype, "getBalanceHistory", null);
exports.BankIntegrationController = BankIntegrationController = __decorate([
    (0, swagger_1.ApiTags)('Bank Integration'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('bank-integration'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [bank_integration_service_1.BankIntegrationService,
        plaid_service_1.PlaidService])
], BankIntegrationController);
//# sourceMappingURL=bank-integration.controller.js.map