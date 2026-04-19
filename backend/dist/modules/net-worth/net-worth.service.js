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
exports.NetWorthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const net_worth_snapshot_entity_1 = require("../../entities/net-worth-snapshot.entity");
const wallet_entity_1 = require("../../entities/wallet.entity");
const bank_account_entity_1 = require("../../entities/bank-account.entity");
const credit_card_entity_1 = require("../../entities/credit-card.entity");
const investment_entity_1 = require("../../entities/investment.entity");
const debt_entity_1 = require("../../entities/debt.entity");
let NetWorthService = class NetWorthService {
    snapshotRepo;
    walletRepo;
    bankRepo;
    cardRepo;
    investmentRepo;
    debtRepo;
    constructor(snapshotRepo, walletRepo, bankRepo, cardRepo, investmentRepo, debtRepo) {
        this.snapshotRepo = snapshotRepo;
        this.walletRepo = walletRepo;
        this.bankRepo = bankRepo;
        this.cardRepo = cardRepo;
        this.investmentRepo = investmentRepo;
        this.debtRepo = debtRepo;
    }
    async computeBreakdown(userId) {
        const walletRow = await this.walletRepo
            .createQueryBuilder('w')
            .select('COALESCE(SUM(w.balance), 0)', 'sum')
            .where('w.userId = :userId', { userId })
            .getRawOne();
        const bankRow = await this.bankRepo
            .createQueryBuilder('b')
            .select('COALESCE(SUM(b.balance), 0)', 'sum')
            .where('b.userId = :userId', { userId })
            .andWhere('b.isActive = :active', { active: true })
            .getRawOne();
        const cardRow = await this.cardRepo
            .createQueryBuilder('c')
            .select('COALESCE(SUM(c.currentBalance), 0)', 'sum')
            .where('c.userId = :userId', { userId })
            .andWhere('c.isActive = :active', { active: true })
            .getRawOne();
        const investments = await this.investmentRepo.find({
            where: { userId, status: 'holding' },
        });
        const investmentTotal = investments.reduce((s, i) => s + Number(i.currentValue ?? i.totalInvested ?? 0), 0);
        const debts = await this.debtRepo.find({ where: { userId } });
        let receivablesTotal = 0;
        let borrowingsTotal = 0;
        for (const d of debts) {
            if (d.status === 'cancelled' || d.status === 'paid')
                continue;
            const remaining = Number(d.totalAmount) - Number(d.paidAmount ?? 0);
            if (d.type === 'lend')
                receivablesTotal += Math.max(0, remaining);
            if (d.type === 'borrow')
                borrowingsTotal += Math.max(0, remaining);
        }
        const walletTotal = Number(walletRow?.sum ?? 0);
        const bankTotal = Number(bankRow?.sum ?? 0);
        const creditCardDebtTotal = Number(cardRow?.sum ?? 0);
        const assets = walletTotal + bankTotal + investmentTotal + receivablesTotal;
        const liabilities = borrowingsTotal + creditCardDebtTotal;
        const netWorth = assets - liabilities;
        return {
            walletTotal,
            bankTotal,
            investmentTotal,
            receivablesTotal,
            borrowingsTotal,
            creditCardDebtTotal,
            netWorth,
            currency: 'VND',
        };
    }
    async captureSnapshot(userId, note) {
        const breakdown = await this.computeBreakdown(userId);
        const snapshotDate = new Date();
        snapshotDate.setHours(0, 0, 0, 0);
        let existing = await this.snapshotRepo.findOne({
            where: { userId, snapshotDate },
        });
        if (existing) {
            Object.assign(existing, { ...breakdown, note: note ?? existing.note });
            return this.snapshotRepo.save(existing);
        }
        const row = this.snapshotRepo.create({
            userId,
            snapshotDate,
            ...breakdown,
            note,
        });
        return this.snapshotRepo.save(row);
    }
    async findRange(userId, from, to) {
        const qb = this.snapshotRepo
            .createQueryBuilder('s')
            .where('s.userId = :userId', { userId })
            .orderBy('s.snapshotDate', 'ASC');
        if (from)
            qb.andWhere('s.snapshotDate >= :from', { from });
        if (to)
            qb.andWhere('s.snapshotDate <= :to', { to });
        return qb.getMany();
    }
    async findLatest(userId, take = 12) {
        return this.snapshotRepo.find({
            where: { userId },
            order: { snapshotDate: 'DESC' },
            take,
        });
    }
};
exports.NetWorthService = NetWorthService;
exports.NetWorthService = NetWorthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(net_worth_snapshot_entity_1.NetWorthSnapshot)),
    __param(1, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __param(2, (0, typeorm_1.InjectRepository)(bank_account_entity_1.BankAccount)),
    __param(3, (0, typeorm_1.InjectRepository)(credit_card_entity_1.CreditCard)),
    __param(4, (0, typeorm_1.InjectRepository)(investment_entity_1.Investment)),
    __param(5, (0, typeorm_1.InjectRepository)(debt_entity_1.Debt)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], NetWorthService);
//# sourceMappingURL=net-worth.service.js.map