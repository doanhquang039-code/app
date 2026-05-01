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
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../../entities/transaction.entity");
const budget_entity_1 = require("../../entities/budget.entity");
const category_entity_1 = require("../../entities/category.entity");
let SearchService = class SearchService {
    transactionRepo;
    budgetRepo;
    categoryRepo;
    constructor(transactionRepo, budgetRepo, categoryRepo) {
        this.transactionRepo = transactionRepo;
        this.budgetRepo = budgetRepo;
        this.categoryRepo = categoryRepo;
    }
    async searchTransactions(userId, filters) {
        const { query, type, categoryId, minAmount, maxAmount, startDate, endDate, tags, sortBy = 'date', sortOrder = 'DESC', page = 1, limit = 20, } = filters;
        const queryBuilder = this.transactionRepo
            .createQueryBuilder('transaction')
            .where('transaction.userId = :userId', { userId });
        if (query) {
            queryBuilder.andWhere('transaction.note LIKE :query', {
                query: `%${query}%`,
            });
        }
        if (type) {
            queryBuilder.andWhere('transaction.type = :type', { type });
        }
        if (categoryId) {
            queryBuilder.andWhere('transaction.categoryId = :categoryId', {
                categoryId,
            });
        }
        if (minAmount !== undefined) {
            queryBuilder.andWhere('transaction.amount >= :minAmount', { minAmount });
        }
        if (maxAmount !== undefined) {
            queryBuilder.andWhere('transaction.amount <= :maxAmount', { maxAmount });
        }
        if (startDate) {
            queryBuilder.andWhere('transaction.date >= :startDate', { startDate });
        }
        if (endDate) {
            queryBuilder.andWhere('transaction.date <= :endDate', { endDate });
        }
        queryBuilder.orderBy(`transaction.${sortBy}`, sortOrder);
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);
        const [transactions, total] = await queryBuilder.getManyAndCount();
        return {
            data: transactions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async advancedSearch(userId, searchParams) {
        const results = {
            transactions: [],
            budgets: [],
            categories: [],
            summary: {
                totalResults: 0,
                transactionCount: 0,
                budgetCount: 0,
                categoryCount: 0,
            },
        };
        const { query } = searchParams;
        if (query) {
            const transactions = await this.transactionRepo.find({
                where: [
                    { userId, note: (0, typeorm_2.Like)(`%${query}%`) },
                ],
                take: 10,
                order: { date: 'DESC' },
            });
            results.transactions = transactions;
            results.summary.transactionCount = transactions.length;
        }
        const categories = await this.categoryRepo.find({
            where: { name: (0, typeorm_2.Like)(`%${query}%`) },
            take: 5,
        });
        results.categories = categories;
        results.summary.categoryCount = categories.length;
        results.summary.totalResults =
            results.summary.transactionCount +
                results.summary.budgetCount +
                results.summary.categoryCount;
        return results;
    }
    async getFilterOptions(userId) {
        const categories = await this.categoryRepo.find();
        const oldestTransaction = await this.transactionRepo.findOne({
            where: { userId },
            order: { date: 'ASC' },
        });
        const newestTransaction = await this.transactionRepo.findOne({
            where: { userId },
            order: { date: 'DESC' },
        });
        const amountStats = await this.transactionRepo
            .createQueryBuilder('transaction')
            .select('MIN(transaction.amount)', 'min')
            .addSelect('MAX(transaction.amount)', 'max')
            .where('transaction.userId = :userId', { userId })
            .getRawOne();
        return {
            categories: categories.map((c) => ({ id: c.id, name: c.name })),
            dateRange: {
                min: oldestTransaction?.date || new Date(),
                max: newestTransaction?.date || new Date(),
            },
            amountRange: {
                min: amountStats?.min || 0,
                max: amountStats?.max || 0,
            },
            types: ['income', 'expense'],
            sortOptions: [
                { value: 'date', label: 'Date' },
                { value: 'amount', label: 'Amount' },
                { value: 'createdAt', label: 'Created At' },
            ],
        };
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(budget_entity_1.Budget)),
    __param(2, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SearchService);
//# sourceMappingURL=search.service.js.map