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
exports.BankIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bank_account_entity_1 = require("../../entities/bank-account.entity");
const bank_transaction_entity_1 = require("../../entities/bank-transaction.entity");
const transaction_entity_1 = require("../../entities/transaction.entity");
let BankIntegrationService = class BankIntegrationService {
    bankAccountRepo;
    bankTransactionRepo;
    transactionRepo;
    constructor(bankAccountRepo, bankTransactionRepo, transactionRepo) {
        this.bankAccountRepo = bankAccountRepo;
        this.bankTransactionRepo = bankTransactionRepo;
        this.transactionRepo = transactionRepo;
    }
    async createBankAccount(userId, data) {
        const account = this.bankAccountRepo.create({
            userId,
            ...data,
            connectionType: data.connectionType || 'MANUAL',
            status: 'ACTIVE',
        });
        return await this.bankAccountRepo.save(account);
    }
    async getUserBankAccounts(userId) {
        return await this.bankAccountRepo.find({
            where: { userId, isActive: true },
            order: { isPrimary: 'DESC', createdAt: 'DESC' },
        });
    }
    async getBankAccount(userId, accountId) {
        const account = await this.bankAccountRepo.findOne({
            where: { id: accountId, userId },
        });
        if (!account) {
            throw new common_1.NotFoundException('Bank account not found');
        }
        return account;
    }
    async updateBankAccount(userId, accountId, data) {
        const account = await this.getBankAccount(userId, accountId);
        Object.assign(account, data);
        return await this.bankAccountRepo.save(account);
    }
    async deleteBankAccount(userId, accountId) {
        const account = await this.getBankAccount(userId, accountId);
        account.isActive = false;
        await this.bankAccountRepo.save(account);
    }
    async setPrimaryAccount(userId, accountId) {
        await this.bankAccountRepo.update({ userId }, { isPrimary: false });
        const account = await this.getBankAccount(userId, accountId);
        account.isPrimary = true;
        return await this.bankAccountRepo.save(account);
    }
    async syncBankAccount(userId, accountId) {
        const account = await this.getBankAccount(userId, accountId);
        try {
            account.lastSyncedAt = new Date();
            account.syncError = '';
            await this.bankAccountRepo.save(account);
            return {
                success: true,
                message: 'Đã đồng bộ tài khoản',
                lastSyncedAt: account.lastSyncedAt,
            };
        }
        catch (error) {
            account.syncError = error.message;
            await this.bankAccountRepo.save(account);
            throw error;
        }
    }
    async getBankTransactions(userId, filters) {
        const where = {};
        if (filters.accountId) {
            const account = await this.getBankAccount(userId, filters.accountId);
            where.bankAccountId = account.id;
        }
        if (filters.startDate && filters.endDate) {
            where.transactionDate = (0, typeorm_2.Between)(new Date(filters.startDate), new Date(filters.endDate));
        }
        return await this.bankTransactionRepo.find({
            where,
            relations: ['bankAccount', 'transaction'],
            order: { transactionDate: 'DESC' },
        });
    }
    async getUnreconciledTransactions(userId) {
        const accounts = await this.getUserBankAccounts(userId);
        const accountIds = accounts.map((a) => a.id);
        return await this.bankTransactionRepo.find({
            where: {
                bankAccountId: accountIds,
                isReconciled: false,
                status: 'POSTED',
            },
            relations: ['bankAccount'],
            order: { transactionDate: 'DESC' },
            take: 100,
        });
    }
    async reconcileTransaction(userId, bankTransactionId, transactionId) {
        const bankTxn = await this.bankTransactionRepo.findOne({
            where: { id: bankTransactionId },
            relations: ['bankAccount'],
        });
        if (!bankTxn) {
            throw new common_1.NotFoundException('Bank transaction not found');
        }
        await this.getBankAccount(userId, bankTxn.bankAccountId);
        const transaction = await this.transactionRepo.findOne({
            where: { id: transactionId, userId },
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        bankTxn.transactionId = transactionId;
        bankTxn.isReconciled = true;
        return await this.bankTransactionRepo.save(bankTxn);
    }
    async createTransactionFromBankTransaction(userId, bankTransactionId) {
        const bankTxn = await this.bankTransactionRepo.findOne({
            where: { id: bankTransactionId },
            relations: ['bankAccount'],
        });
        if (!bankTxn) {
            throw new common_1.NotFoundException('Bank transaction not found');
        }
        await this.getBankAccount(userId, bankTxn.bankAccountId);
        const transaction = this.transactionRepo.create({
            userId,
            type: bankTxn.type === 'DEBIT' ? 'EXPENSE' : 'INCOME',
            amount: Math.abs(bankTxn.amount),
            date: bankTxn.transactionDate,
        });
        const savedTransaction = await this.transactionRepo.save(transaction);
        bankTxn.transactionId = savedTransaction.id;
        bankTxn.isReconciled = true;
        await this.bankTransactionRepo.save(bankTxn);
        return savedTransaction;
    }
    async autoReconcileTransactions(userId) {
        const unreconciledBankTxns = await this.getUnreconciledTransactions(userId);
        const userTransactions = await this.transactionRepo.find({
            where: { userId },
            order: { date: 'DESC' },
            take: 500,
        });
        let reconciledCount = 0;
        const matches = [];
        for (const bankTxn of unreconciledBankTxns) {
            const match = userTransactions.find((txn) => {
                const amountMatch = Math.abs(parseFloat(txn.amount.toString()) - Math.abs(bankTxn.amount)) < 0.01;
                const dateMatch = this.isSameDay(new Date(txn.date), bankTxn.transactionDate);
                const descMatch = bankTxn.description ? true : false;
                return amountMatch && dateMatch;
            });
            if (match) {
                await this.reconcileTransaction(userId, bankTxn.id, match.id);
                reconciledCount++;
                matches.push({
                    bankTransactionId: bankTxn.id,
                    transactionId: match.id,
                });
            }
        }
        return {
            success: true,
            reconciledCount,
            totalUnreconciled: unreconciledBankTxns.length,
            matches,
        };
    }
    isSameDay(date1, date2) {
        return (date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate());
    }
    similarDescription(desc1, desc2) {
        const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
        const norm1 = normalize(desc1);
        const norm2 = normalize(desc2);
        return norm1.includes(norm2) || norm2.includes(norm1);
    }
    async getBankAccountStats(userId) {
        const accounts = await this.getUserBankAccounts(userId);
        const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance.toString()), 0);
        const byType = accounts.reduce((acc, account) => {
            if (!acc[account.accountType]) {
                acc[account.accountType] = { count: 0, balance: 0 };
            }
            acc[account.accountType].count += 1;
            acc[account.accountType].balance += parseFloat(account.balance.toString());
            return acc;
        }, {});
        const connected = accounts.filter((a) => a.connectionType !== 'MANUAL').length;
        const manual = accounts.filter((a) => a.connectionType === 'MANUAL').length;
        return {
            totalAccounts: accounts.length,
            totalBalance: Math.round(totalBalance),
            connectedAccounts: connected,
            manualAccounts: manual,
            byType,
            accounts: accounts.map((a) => ({
                id: a.id,
                bankName: a.bankName,
                accountType: a.accountType,
                balance: a.balance,
                lastSyncedAt: a.lastSyncedAt,
            })),
        };
    }
    async getBalanceHistory(userId, accountId, days = 30) {
        const account = await this.getBankAccount(userId, accountId);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const transactions = await this.bankTransactionRepo.find({
            where: {
                bankAccountId: accountId,
                transactionDate: (0, typeorm_2.Between)(startDate, new Date()),
            },
            order: { transactionDate: 'ASC' },
        });
        const history = [];
        let currentBalance = parseFloat(account.balance.toString());
        for (let i = transactions.length - 1; i >= 0; i--) {
            const txn = transactions[i];
            history.unshift({
                date: txn.transactionDate,
                balance: currentBalance,
                change: txn.amount,
            });
            currentBalance -= txn.amount;
        }
        return history;
    }
};
exports.BankIntegrationService = BankIntegrationService;
exports.BankIntegrationService = BankIntegrationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bank_account_entity_1.BankAccount)),
    __param(1, (0, typeorm_1.InjectRepository)(bank_transaction_entity_1.BankTransaction)),
    __param(2, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BankIntegrationService);
//# sourceMappingURL=bank-integration.service.js.map