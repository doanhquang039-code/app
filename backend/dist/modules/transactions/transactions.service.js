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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../../entities/transaction.entity");
const wallet_entity_1 = require("../../entities/wallet.entity");
let TransactionsService = class TransactionsService {
    transactionRepository;
    walletRepository;
    constructor(transactionRepository, walletRepository) {
        this.transactionRepository = transactionRepository;
        this.walletRepository = walletRepository;
    }
    async bulkCreate(userId, items) {
        const results = [];
        const errors = [];
        for (let i = 0; i < items.length; i++) {
            try {
                const saved = await this.create(userId, items[i]);
                results.push(saved);
            }
            catch (e) {
                const message = e instanceof Error ? e.message : 'Lỗi không xác định';
                errors.push({ index: i, message });
            }
        }
        return { created: results.length, results, errors };
    }
    async create(userId, dto) {
        const transaction = this.transactionRepository.create({
            ...dto,
            userId,
            date: new Date(dto.date),
        });
        const saved = await this.transactionRepository.save(transaction);
        await this.updateWalletBalance(dto.walletId, dto.amount, dto.type, 'add');
        return saved;
    }
    async findAll(userId, query) {
        const qb = this.transactionRepository
            .createQueryBuilder('t')
            .leftJoinAndSelect('t.category', 'category')
            .leftJoinAndSelect('t.wallet', 'wallet')
            .where('t.userId = :userId', { userId })
            .orderBy('t.date', 'DESC');
        if (query.month) {
            const [year, month] = query.month.split('-');
            qb.andWhere('MONTH(t.date) = :month AND YEAR(t.date) = :year', {
                month: parseInt(month),
                year: parseInt(year),
            });
        }
        if (query.categoryId) {
            qb.andWhere('t.categoryId = :categoryId', {
                categoryId: query.categoryId,
            });
        }
        if (query.walletId) {
            qb.andWhere('t.walletId = :walletId', { walletId: query.walletId });
        }
        if (query.type) {
            qb.andWhere('t.type = :type', { type: query.type });
        }
        if (query.startDate) {
            qb.andWhere('t.date >= :startDate', { startDate: new Date(query.startDate) });
        }
        if (query.endDate) {
            qb.andWhere('t.date <= :endDate', { endDate: new Date(query.endDate) });
        }
        if (query.limit) {
            qb.take(query.limit);
        }
        return qb.getMany();
    }
    async findOne(userId, id) {
        const transaction = await this.transactionRepository.findOne({
            where: { id, userId },
            relations: ['category', 'wallet'],
        });
        if (!transaction)
            throw new common_1.NotFoundException('Không tìm thấy giao dịch');
        return transaction;
    }
    async update(userId, id, dto) {
        const transaction = await this.findOne(userId, id);
        await this.updateWalletBalance(transaction.walletId, Number(transaction.amount), transaction.type, 'revert');
        Object.assign(transaction, dto);
        if (dto.date)
            transaction.date = new Date(dto.date);
        const saved = await this.transactionRepository.save(transaction);
        await this.updateWalletBalance(saved.walletId, Number(saved.amount), saved.type, 'add');
        return saved;
    }
    async remove(userId, id) {
        const transaction = await this.findOne(userId, id);
        await this.updateWalletBalance(transaction.walletId, Number(transaction.amount), transaction.type, 'revert');
        await this.transactionRepository.remove(transaction);
        return { message: 'Xóa thành công' };
    }
    async getSummary(userId, month) {
        const qb = this.transactionRepository
            .createQueryBuilder('t')
            .select('t.type', 'type')
            .addSelect('SUM(t.amount)', 'total')
            .where('t.userId = :userId', { userId });
        if (month) {
            const [year, m] = month.split('-');
            qb.andWhere('MONTH(t.date) = :month AND YEAR(t.date) = :year', {
                month: parseInt(m),
                year: parseInt(year),
            });
        }
        const result = await qb.groupBy('t.type').getRawMany();
        const totalIncome = Number(result.find((r) => r.type === 'income')?.total) || 0;
        const totalExpense = Number(result.find((r) => r.type === 'expense')?.total) || 0;
        const balance = totalIncome - totalExpense;
        return {
            totalIncome,
            totalExpense,
            balance,
            income: totalIncome,
            expense: totalExpense,
        };
    }
    async updateWalletBalance(walletId, amount, type, action) {
        const wallet = await this.walletRepository.findOne({
            where: { id: walletId },
        });
        if (!wallet)
            return;
        let adjustment = amount;
        if (type === 'expense') {
            adjustment = -amount;
        }
        if (action === 'revert') {
            adjustment = -adjustment;
        }
        wallet.balance = Number(wallet.balance) + adjustment;
        await this.walletRepository.save(wallet);
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map