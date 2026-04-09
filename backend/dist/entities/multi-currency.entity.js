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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeRateHistory = exports.MultiCurrencyWallet = exports.Currency = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const wallet_entity_1 = require("./wallet.entity");
let Currency = class Currency {
    id;
    code;
    name;
    symbol;
    exchangeRate;
    icon;
    isActive;
    createdAt;
};
exports.Currency = Currency;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Currency.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Currency.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Currency.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Currency.prototype, "symbol", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 8, default: 1 }),
    __metadata("design:type", Number)
], Currency.prototype, "exchangeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Currency.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Currency.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Currency.prototype, "createdAt", void 0);
exports.Currency = Currency = __decorate([
    (0, typeorm_1.Entity)('Currencies')
], Currency);
let MultiCurrencyWallet = class MultiCurrencyWallet {
    id;
    userId;
    walletId;
    currencyCode;
    balance;
    createdAt;
    user;
    wallet;
};
exports.MultiCurrencyWallet = MultiCurrencyWallet;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MultiCurrencyWallet.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], MultiCurrencyWallet.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], MultiCurrencyWallet.prototype, "walletId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MultiCurrencyWallet.prototype, "currencyCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MultiCurrencyWallet.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MultiCurrencyWallet.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], MultiCurrencyWallet.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => wallet_entity_1.Wallet),
    (0, typeorm_1.JoinColumn)({ name: 'walletId' }),
    __metadata("design:type", wallet_entity_1.Wallet)
], MultiCurrencyWallet.prototype, "wallet", void 0);
exports.MultiCurrencyWallet = MultiCurrencyWallet = __decorate([
    (0, typeorm_1.Entity)('MultiCurrencyWallets')
], MultiCurrencyWallet);
let ExchangeRateHistory = class ExchangeRateHistory {
    id;
    fromCurrency;
    toCurrency;
    rate;
    date;
    createdAt;
};
exports.ExchangeRateHistory = ExchangeRateHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ExchangeRateHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ExchangeRateHistory.prototype, "fromCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ExchangeRateHistory.prototype, "toCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 8 }),
    __metadata("design:type", Number)
], ExchangeRateHistory.prototype, "rate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], ExchangeRateHistory.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ExchangeRateHistory.prototype, "createdAt", void 0);
exports.ExchangeRateHistory = ExchangeRateHistory = __decorate([
    (0, typeorm_1.Entity)('ExchangeRateHistories')
], ExchangeRateHistory);
//# sourceMappingURL=multi-currency.entity.js.map