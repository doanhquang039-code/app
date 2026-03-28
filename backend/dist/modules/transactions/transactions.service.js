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
let TransactionsService = class TransactionsService {
    transactionRepository;
    constructor(transactionRepository) {
        this.transactionRepository = transactionRepository;
    }
    async create(userId, dto) {
        const transaction = this.transactionRepository.create({
            ...dto,
            userId,
            date: new Date(dto.date),
        });
        return this.transactionRepository.save(transaction);
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
        if (query.type) {
            qb.andWhere('t.type = :type', { type: query.type });
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
        Object.assign(transaction, dto);
        if (dto.date)
            transaction.date = new Date(dto.date);
        return this.transactionRepository.save(transaction);
    }
    async remove(userId, id) {
        const transaction = await this.findOne(userId, id);
        await this.transactionRepository.remove(transaction);
        return { message: 'Xóa thành công' };
    }
    async getSummary(userId, month) {
        const [year, m] = month.split('-');
        const result = await this.transactionRepository
            .createQueryBuilder('t')
            .select('t.type', 'type')
            .addSelect('SUM(t.amount)', 'total')
            .where('t.userId = :userId', { userId })
            .andWhere('MONTH(t.date) = :month AND YEAR(t.date) = :year', {
            month: parseInt(m),
            year: parseInt(year),
        })
            .groupBy('t.type')
            .getRawMany();
        const income = result.find((r) => r.type === 'income')?.total || 0;
        const expense = result.find((r) => r.type === 'expense')?.total || 0;
        return { income, expense, balance: income - expense };
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map