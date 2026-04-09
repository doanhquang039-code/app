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
exports.MultiCurrencyController = void 0;
const common_1 = require("@nestjs/common");
const multi_currency_service_1 = require("./multi-currency.service");
const multi_currency_dto_1 = require("./dto/multi-currency.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let MultiCurrencyController = class MultiCurrencyController {
    multiCurrencyService;
    constructor(multiCurrencyService) {
        this.multiCurrencyService = multiCurrencyService;
    }
    getAllCurrencies() {
        return this.multiCurrencyService.getAllCurrencies();
    }
    getCurrency(code) {
        return this.multiCurrencyService.getCurrency(code);
    }
    createCurrency(createCurrencyDto) {
        return this.multiCurrencyService.createCurrency(createCurrencyDto);
    }
    updateExchangeRate(code, updateRateDto) {
        return this.multiCurrencyService.updateExchangeRate(code, updateRateDto);
    }
    async convertCurrency(amount, fromCurrency, toCurrency) {
        return this.multiCurrencyService.convertCurrency(amount, fromCurrency, toCurrency);
    }
    createMultiWallet(req, createWalletDto) {
        return this.multiCurrencyService.createMultiCurrencyWallet(req.user.id, createWalletDto);
    }
    getWalletCurrencies(walletId, req) {
        return this.multiCurrencyService.getWalletCurrencies(req.user.id, +walletId);
    }
    updateWalletBalance(walletId, currencyCode, req, { balance }) {
        return this.multiCurrencyService.updateWalletBalance(req.user.id, +walletId, currencyCode, balance);
    }
    async getTotalInUSD(walletId, req) {
        const total = await this.multiCurrencyService.getTotalWalletBalanceInUSD(req.user.id, +walletId);
        return { totalInUSD: total };
    }
    async getTotalInCurrency(walletId, req, currency = 'USD') {
        const total = await this.multiCurrencyService.getTotalWalletBalanceInCurrency(req.user.id, +walletId, currency);
        return { [currency]: total };
    }
    getBalanceReport(walletId, req) {
        return this.multiCurrencyService.getMultiCurrencyBalanceReport(req.user.id, +walletId);
    }
    getExchangeHistory(fromCurrency, toCurrency, days = 30) {
        return this.multiCurrencyService.getExchangeRateHistory(fromCurrency, toCurrency, days);
    }
};
exports.MultiCurrencyController = MultiCurrencyController;
__decorate([
    (0, common_1.Get)('currencies'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MultiCurrencyController.prototype, "getAllCurrencies", null);
__decorate([
    (0, common_1.Get)('currencies/:code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MultiCurrencyController.prototype, "getCurrency", null);
__decorate([
    (0, common_1.Post)('currencies'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [multi_currency_dto_1.CreateCurrencyDto]),
    __metadata("design:returntype", void 0)
], MultiCurrencyController.prototype, "createCurrency", null);
__decorate([
    (0, common_1.Put)('currencies/:code/exchange-rate'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, multi_currency_dto_1.UpdateExchangeRateDto]),
    __metadata("design:returntype", void 0)
], MultiCurrencyController.prototype, "updateExchangeRate", null);
__decorate([
    (0, common_1.Get)('convert'),
    __param(0, (0, common_1.Query)('amount')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], MultiCurrencyController.prototype, "convertCurrency", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('wallets'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, multi_currency_dto_1.CreateMultiWalletDto]),
    __metadata("design:returntype", void 0)
], MultiCurrencyController.prototype, "createMultiWallet", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('wallets/:walletId/currencies'),
    __param(0, (0, common_1.Param)('walletId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MultiCurrencyController.prototype, "getWalletCurrencies", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('wallets/:walletId/currencies/:currencyCode/balance'),
    __param(0, (0, common_1.Param)('walletId')),
    __param(1, (0, common_1.Param)('currencyCode')),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], MultiCurrencyController.prototype, "updateWalletBalance", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('wallets/:walletId/total-usd'),
    __param(0, (0, common_1.Param)('walletId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MultiCurrencyController.prototype, "getTotalInUSD", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('wallets/:walletId/total'),
    __param(0, (0, common_1.Param)('walletId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('currency')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], MultiCurrencyController.prototype, "getTotalInCurrency", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('wallets/:walletId/report'),
    __param(0, (0, common_1.Param)('walletId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MultiCurrencyController.prototype, "getBalanceReport", null);
__decorate([
    (0, common_1.Get)('exchange-history'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __param(2, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", void 0)
], MultiCurrencyController.prototype, "getExchangeHistory", null);
exports.MultiCurrencyController = MultiCurrencyController = __decorate([
    (0, common_1.Controller)('multi-currency'),
    __metadata("design:paramtypes", [multi_currency_service_1.MultiCurrencyService])
], MultiCurrencyController);
//# sourceMappingURL=multi-currency.controller.js.map