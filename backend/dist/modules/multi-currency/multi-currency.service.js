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
exports.MultiCurrencyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const multi_currency_entity_1 = require("../../entities/multi-currency.entity");
let MultiCurrencyService = class MultiCurrencyService {
    currencyRepository;
    multiWalletRepository;
    exchangeHistoryRepository;
    constructor(currencyRepository, multiWalletRepository, exchangeHistoryRepository) {
        this.currencyRepository = currencyRepository;
        this.multiWalletRepository = multiWalletRepository;
        this.exchangeHistoryRepository = exchangeHistoryRepository;
    }
    async createCurrency(createCurrencyDto) {
        const currency = this.currencyRepository.create(createCurrencyDto);
        return this.currencyRepository.save(currency);
    }
    async getAllCurrencies() {
        return this.currencyRepository.find({
            where: { isActive: true },
            order: { code: 'ASC' },
        });
    }
    async getCurrency(code) {
        return this.currencyRepository.findOne({
            where: { code },
        });
    }
    async updateExchangeRate(code, updateRateDto) {
        const currency = await this.currencyRepository.findOne({ where: { code } });
        if (!currency)
            throw new Error('Currency not found');
        const oldRate = currency.exchangeRate;
        currency.exchangeRate = updateRateDto.exchangeRate;
        await this.exchangeHistoryRepository.save({
            fromCurrency: code,
            toCurrency: 'USD',
            rate: updateRateDto.exchangeRate,
            date: new Date(),
        });
        return this.currencyRepository.save(currency);
    }
    async createMultiCurrencyWallet(userId, createWalletDto) {
        const wallet = this.multiWalletRepository.create({
            ...createWalletDto,
            userId,
        });
        return this.multiWalletRepository.save(wallet);
    }
    async getWalletCurrencies(userId, walletId) {
        return this.multiWalletRepository.find({
            where: { userId, walletId },
        });
    }
    async updateWalletBalance(userId, walletId, currencyCode, newBalance) {
        let wallet = await this.multiWalletRepository.findOne({
            where: { userId, walletId, currencyCode },
        });
        if (!wallet) {
            wallet = this.multiWalletRepository.create({
                userId,
                walletId,
                currencyCode,
                balance: newBalance,
            });
        }
        else {
            wallet.balance = newBalance;
        }
        return this.multiWalletRepository.save(wallet);
    }
    async convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) {
            return { amount, fromCurrency, toCurrency, convertedAmount: amount, rate: 1 };
        }
        const from = await this.getCurrency(fromCurrency);
        const to = await this.getCurrency(toCurrency);
        if (!from || !to)
            throw new Error('Invalid currency code');
        const usdAmount = amount / Number(from.exchangeRate);
        const convertedAmount = usdAmount * Number(to.exchangeRate);
        const rate = Number(to.exchangeRate) / Number(from.exchangeRate);
        return {
            amount,
            fromCurrency,
            toCurrency,
            convertedAmount,
            rate,
            timestamp: new Date(),
        };
    }
    async convertToBaseCurrency(amount, currencyCode) {
        const currency = await this.getCurrency(currencyCode);
        if (!currency)
            throw new Error('Currency not found');
        return amount / Number(currency.exchangeRate);
    }
    async convertFromBaseCurrency(amount, currencyCode) {
        const currency = await this.getCurrency(currencyCode);
        if (!currency)
            throw new Error('Currency not found');
        return amount * Number(currency.exchangeRate);
    }
    async getTotalWalletBalanceInUSD(userId, walletId) {
        const wallets = await this.getWalletCurrencies(userId, walletId);
        let totalUSD = 0;
        for (const wallet of wallets) {
            const currency = await this.getCurrency(wallet.currencyCode);
            if (currency) {
                const usdAmount = await this.convertToBaseCurrency(Number(wallet.balance), wallet.currencyCode);
                totalUSD += usdAmount;
            }
        }
        return totalUSD;
    }
    async getTotalWalletBalanceInCurrency(userId, walletId, targetCurrency) {
        const totalUSD = await this.getTotalWalletBalanceInUSD(userId, walletId);
        return this.convertFromBaseCurrency(totalUSD, targetCurrency);
    }
    async getExchangeRateHistory(fromCurrency, toCurrency, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        return this.exchangeHistoryRepository.find({
            where: {
                fromCurrency,
                toCurrency,
            },
        });
    }
    async getMultiCurrencyBalanceReport(userId, walletId) {
        const wallets = await this.getWalletCurrencies(userId, walletId);
        const report = {
            walletId,
            currencies: {},
            totalInUSD: 0,
            totalInEUR: 0,
            totalInVND: 0,
        };
        for (const wallet of wallets) {
            const currency = await this.getCurrency(wallet.currencyCode);
            if (currency) {
                report.currencies[wallet.currencyCode] = {
                    balance: Number(wallet.balance),
                    currency: currency.name,
                    symbol: currency.symbol,
                };
                const usdAmount = await this.convertToBaseCurrency(Number(wallet.balance), wallet.currencyCode);
                report.totalInUSD += usdAmount;
            }
        }
        report.totalInEUR = await this.convertFromBaseCurrency(report.totalInUSD, 'EUR');
        report.totalInVND = await this.convertFromBaseCurrency(report.totalInUSD, 'VND');
        return report;
    }
};
exports.MultiCurrencyService = MultiCurrencyService;
exports.MultiCurrencyService = MultiCurrencyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(multi_currency_entity_1.Currency)),
    __param(1, (0, typeorm_1.InjectRepository)(multi_currency_entity_1.MultiCurrencyWallet)),
    __param(2, (0, typeorm_1.InjectRepository)(multi_currency_entity_1.ExchangeRateHistory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MultiCurrencyService);
//# sourceMappingURL=multi-currency.service.js.map