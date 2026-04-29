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
exports.OpenBankingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bank_account_entity_1 = require("../../entities/bank-account.entity");
const bank_transaction_entity_1 = require("../../entities/bank-transaction.entity");
let OpenBankingService = class OpenBankingService {
    bankAccountRepo;
    bankTransactionRepo;
    constructor(bankAccountRepo, bankTransactionRepo) {
        this.bankAccountRepo = bankAccountRepo;
        this.bankTransactionRepo = bankTransactionRepo;
    }
    async connectBank(userId, bankCode, credentials) {
        const bankInfo = this.getBankInfo(bankCode);
        const account = this.bankAccountRepo.create({
            userId,
            bankName: bankInfo.name,
            accountNumber: credentials.accountNumber,
            accountType: 'CHECKING',
            accountHolderName: credentials.accountHolderName,
            balance: 0,
            bankCode,
            connectionType: 'OPEN_BANKING',
            status: 'ACTIVE',
            autoSync: true,
        });
        const savedAccount = await this.bankAccountRepo.save(account);
        await this.syncBankData(savedAccount.id);
        return {
            success: true,
            message: `Đã kết nối ${bankInfo.name} thành công`,
            account: savedAccount,
        };
    }
    async syncBankData(accountId) {
        const account = await this.bankAccountRepo.findOne({
            where: { id: accountId },
        });
        if (!account) {
            throw new Error('Bank account not found');
        }
        const transactions = this.getMockBankTransactions(account.bankCode);
        let importedCount = 0;
        for (const txn of transactions) {
            const existing = await this.bankTransactionRepo.findOne({
                where: {
                    bankAccountId: accountId,
                    externalTransactionId: txn.id,
                },
            });
            if (!existing) {
                const bankTransaction = this.bankTransactionRepo.create({
                    bankAccountId: accountId,
                    externalTransactionId: txn.id,
                    transactionDate: new Date(txn.date),
                    amount: txn.amount,
                    type: txn.type,
                    description: txn.description,
                    merchantName: txn.merchant,
                    status: 'POSTED',
                });
                await this.bankTransactionRepo.save(bankTransaction);
                importedCount++;
            }
        }
        account.lastSyncedAt = new Date();
        await this.bankAccountRepo.save(account);
        return {
            success: true,
            importedCount,
        };
    }
    getBankInfo(bankCode) {
        const banks = {
            VCB: { name: 'Vietcombank', code: 'VCB' },
            TCB: { name: 'Techcombank', code: 'TCB' },
            VTB: { name: 'Vietinbank', code: 'VTB' },
            BIDV: { name: 'BIDV', code: 'BIDV' },
            ACB: { name: 'ACB', code: 'ACB' },
            MB: { name: 'MB Bank', code: 'MB' },
            VPB: { name: 'VPBank', code: 'VPB' },
            TPB: { name: 'TPBank', code: 'TPB' },
        };
        return banks[bankCode] || { name: 'Unknown Bank', code: bankCode };
    }
    getMockBankTransactions(bankCode) {
        return [
            {
                id: `${bankCode}_001`,
                date: '2026-04-29',
                amount: -150000,
                type: 'DEBIT',
                description: 'Mua sắm tại Vinmart',
                merchant: 'Vinmart',
            },
            {
                id: `${bankCode}_002`,
                date: '2026-04-28',
                amount: -85000,
                type: 'DEBIT',
                description: 'Thanh toán Grab',
                merchant: 'Grab',
            },
            {
                id: `${bankCode}_003`,
                date: '2026-04-27',
                amount: 5000000,
                type: 'CREDIT',
                description: 'Chuyển khoản đến',
                merchant: 'Transfer',
            },
        ];
    }
    getSupportedBanks() {
        return [
            { code: 'VCB', name: 'Vietcombank', logo: '/banks/vcb.png' },
            { code: 'TCB', name: 'Techcombank', logo: '/banks/tcb.png' },
            { code: 'VTB', name: 'Vietinbank', logo: '/banks/vtb.png' },
            { code: 'BIDV', name: 'BIDV', logo: '/banks/bidv.png' },
            { code: 'ACB', name: 'ACB', logo: '/banks/acb.png' },
            { code: 'MB', name: 'MB Bank', logo: '/banks/mb.png' },
            { code: 'VPB', name: 'VPBank', logo: '/banks/vpb.png' },
            { code: 'TPB', name: 'TPBank', logo: '/banks/tpb.png' },
        ];
    }
};
exports.OpenBankingService = OpenBankingService;
exports.OpenBankingService = OpenBankingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bank_account_entity_1.BankAccount)),
    __param(1, (0, typeorm_1.InjectRepository)(bank_transaction_entity_1.BankTransaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], OpenBankingService);
//# sourceMappingURL=open-banking.service.js.map