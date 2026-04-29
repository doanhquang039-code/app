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
exports.PlaidService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bank_account_entity_1 = require("../../entities/bank-account.entity");
const bank_transaction_entity_1 = require("../../entities/bank-transaction.entity");
const config_1 = require("@nestjs/config");
let PlaidService = class PlaidService {
    bankAccountRepo;
    bankTransactionRepo;
    configService;
    plaidClient;
    constructor(bankAccountRepo, bankTransactionRepo, configService) {
        this.bankAccountRepo = bankAccountRepo;
        this.bankTransactionRepo = bankTransactionRepo;
        this.configService = configService;
    }
    async createLinkToken(userId) {
        try {
            return {
                linkToken: `link-sandbox-${Date.now()}`,
                expiration: new Date(Date.now() + 3600000).toISOString(),
            };
        }
        catch (error) {
            throw new Error(`Failed to create link token: ${error.message}`);
        }
    }
    async exchangePublicToken(userId, publicToken) {
        try {
            const accessToken = `access-sandbox-${Date.now()}`;
            const itemId = `item-sandbox-${Date.now()}`;
            const accounts = await this.getAccountsFromPlaid(accessToken);
            const savedAccounts = [];
            for (const account of accounts) {
                const bankAccount = this.bankAccountRepo.create({
                    userId,
                    bankName: account.institution_name || 'Unknown Bank',
                    accountNumber: account.mask || '****',
                    accountType: this.mapAccountType(account.type),
                    accountHolderName: account.name,
                    balance: account.balances.current || 0,
                    currency: account.balances.iso_currency_code || 'VND',
                    plaidAccessToken: accessToken,
                    plaidItemId: itemId,
                    plaidAccountId: account.account_id,
                    connectionType: 'PLAID',
                    status: 'ACTIVE',
                    autoSync: true,
                });
                const saved = await this.bankAccountRepo.save(bankAccount);
                savedAccounts.push(saved);
            }
            return {
                success: true,
                message: 'Đã kết nối ngân hàng thành công',
                accounts: savedAccounts,
            };
        }
        catch (error) {
            throw new Error(`Failed to exchange token: ${error.message}`);
        }
    }
    async getAccountsFromPlaid(accessToken) {
        return [
            {
                account_id: 'acc_123',
                name: 'Checking Account',
                mask: '1234',
                type: 'depository',
                subtype: 'checking',
                institution_name: 'Vietcombank',
                balances: {
                    current: 10000000,
                    available: 9500000,
                    iso_currency_code: 'VND',
                },
            },
            {
                account_id: 'acc_456',
                name: 'Savings Account',
                mask: '5678',
                type: 'depository',
                subtype: 'savings',
                institution_name: 'Vietcombank',
                balances: {
                    current: 50000000,
                    available: 50000000,
                    iso_currency_code: 'VND',
                },
            },
        ];
    }
    async getAccounts(userId) {
        return await this.bankAccountRepo.find({
            where: { userId, connectionType: 'PLAID', isActive: true },
        });
    }
    async syncTransactions(userId, accountId) {
        const account = await this.bankAccountRepo.findOne({
            where: { id: accountId, userId },
        });
        if (!account || !account.plaidAccessToken) {
            throw new Error('Bank account not found or not connected via Plaid');
        }
        try {
            const transactions = this.getMockTransactions(account.plaidAccountId);
            let importedCount = 0;
            for (const txn of transactions) {
                const existing = await this.bankTransactionRepo.findOne({
                    where: {
                        bankAccountId: accountId,
                        externalTransactionId: txn.transaction_id,
                    },
                });
                if (!existing) {
                    const bankTransaction = this.bankTransactionRepo.create({
                        bankAccountId: accountId,
                        externalTransactionId: txn.transaction_id,
                        transactionDate: new Date(txn.date),
                        postedDate: new Date(txn.authorized_date || txn.date),
                        amount: txn.amount,
                        type: txn.amount < 0 ? 'CREDIT' : 'DEBIT',
                        description: txn.name,
                        merchantName: txn.merchant_name,
                        category: txn.category?.[0],
                        status: 'POSTED',
                        rawData: JSON.stringify(txn),
                    });
                    await this.bankTransactionRepo.save(bankTransaction);
                    importedCount++;
                }
            }
            account.lastSyncedAt = new Date();
            await this.bankAccountRepo.save(account);
            return {
                success: true,
                message: `Đã đồng bộ ${importedCount} giao dịch mới`,
                importedCount,
                totalTransactions: transactions.length,
            };
        }
        catch (error) {
            account.syncError = error.message;
            await this.bankAccountRepo.save(account);
            throw error;
        }
    }
    getMockTransactions(accountId) {
        return [
            {
                transaction_id: 'txn_001',
                account_id: accountId,
                date: '2026-04-28',
                authorized_date: '2026-04-28',
                name: 'Starbucks Coffee',
                merchant_name: 'Starbucks',
                amount: 85000,
                category: ['Food and Drink', 'Restaurants', 'Coffee Shop'],
            },
            {
                transaction_id: 'txn_002',
                account_id: accountId,
                date: '2026-04-27',
                authorized_date: '2026-04-27',
                name: 'Grab Ride',
                merchant_name: 'Grab',
                amount: 45000,
                category: ['Travel', 'Taxi'],
            },
            {
                transaction_id: 'txn_003',
                account_id: accountId,
                date: '2026-04-26',
                authorized_date: '2026-04-26',
                name: 'Salary Deposit',
                merchant_name: 'Company ABC',
                amount: -15000000,
                category: ['Income', 'Payroll'],
            },
        ];
    }
    mapAccountType(plaidType) {
        const typeMap = {
            depository: 'CHECKING',
            credit: 'CREDIT_CARD',
            loan: 'LOAN',
            investment: 'INVESTMENT',
        };
        return typeMap[plaidType] || 'CHECKING';
    }
};
exports.PlaidService = PlaidService;
exports.PlaidService = PlaidService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bank_account_entity_1.BankAccount)),
    __param(1, (0, typeorm_1.InjectRepository)(bank_transaction_entity_1.BankTransaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], PlaidService);
//# sourceMappingURL=plaid.service.js.map