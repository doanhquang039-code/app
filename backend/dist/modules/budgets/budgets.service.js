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
exports.BudgetsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const budget_entity_1 = require("../../entities/budget.entity");
const transaction_entity_1 = require("../../entities/transaction.entity");
let BudgetsService = class BudgetsService {
    budgetRepo;
    transactionRepo;
    constructor(budgetRepo, transactionRepo) {
        this.budgetRepo = budgetRepo;
        this.transactionRepo = transactionRepo;
    }
    async create(userId, dto) {
        if (!dto.month && dto.startDate) {
            const d = new Date(dto.startDate);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            dto.month = `${y}-${m}`;
        }
        if (!dto.month) {
            const now = new Date();
            dto.month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }
        const exists = dto.categoryId
            ? await this.budgetRepo.findOne({
                where: { userId, categoryId: dto.categoryId, month: dto.month },
            })
            : null;
        if (exists) {
            throw new common_1.ConflictException('Đã tồn tại ngân sách cho danh mục này trong tháng này');
        }
        const budget = this.budgetRepo.create({ ...dto, userId });
        return this.budgetRepo.save(budget);
    }
    async findAll(userId, month) {
        const where = { userId };
        if (!month) {
            const now = new Date();
            month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }
        where.month = month;
        const budgets = await this.budgetRepo.find({
            where,
            relations: ['category'],
            order: { createdAt: 'DESC' },
        });
        const [year, m] = month.split('-');
        const enriched = await Promise.all(budgets.map(async (budget) => {
            const qb = this.transactionRepo
                .createQueryBuilder('t')
                .select('SUM(t.amount)', 'total')
                .where('t.userId = :userId', { userId })
                .andWhere('t.type = :type', { type: 'expense' })
                .andWhere('MONTH(t.date) = :month AND YEAR(t.date) = :year', {
                month: parseInt(m),
                year: parseInt(year),
            });
            if (budget.categoryId) {
                qb.andWhere('t.categoryId = :categoryId', {
                    categoryId: budget.categoryId,
                });
            }
            const spentResult = await qb.getRawOne();
            const spent = Number(spentResult?.total) || 0;
            const amount = Number(budget.amount);
            return {
                id: budget.id,
                userId: budget.userId,
                categoryId: budget.categoryId,
                categoryName: budget.category?.name ?? null,
                amount,
                spent,
                remaining: amount - spent,
                period: 'monthly',
                month: budget.month,
                startDate: `${year}-${m}-01`,
                endDate: new Date(parseInt(year), parseInt(m), 0).toISOString().split('T')[0],
                createdAt: budget.createdAt,
            };
        }));
        return enriched;
    }
    async findOne(userId, id) {
        const budget = await this.budgetRepo.findOne({
            where: { id, userId },
            relations: ['category'],
        });
        if (!budget)
            throw new common_1.NotFoundException('Không tìm thấy ngân sách');
        return budget;
    }
    async update(userId, id, dto) {
        const budget = await this.findOne(userId, id);
        Object.assign(budget, dto);
        return this.budgetRepo.save(budget);
    }
    async remove(userId, id) {
        const budget = await this.findOne(userId, id);
        await this.budgetRepo.remove(budget);
        return { message: 'Xóa ngân sách thành công' };
    }
    async getBudgetStatus(userId, month) {
        const enriched = await this.findAll(userId, month);
        if (enriched.length === 0) {
            return { budgets: [], totalBudget: 0, totalSpent: 0 };
        }
        const result = enriched.map((budget) => {
            const percentage = budget.amount > 0
                ? Math.round((budget.spent / budget.amount) * 100)
                : 0;
            let status;
            if (percentage >= 100) {
                status = 'exceeded';
            }
            else if (percentage >= 80) {
                status = 'warning';
            }
            else {
                status = 'safe';
            }
            return {
                id: budget.id,
                categoryId: budget.categoryId,
                categoryName: budget.categoryName ?? '',
                budgetAmount: budget.amount,
                spent: budget.spent,
                remaining: budget.remaining,
                percentage,
                status,
            };
        });
        const totalBudget = result.reduce((s, b) => s + b.budgetAmount, 0);
        const totalSpent = result.reduce((s, b) => s + b.spent, 0);
        return {
            budgets: result,
            totalBudget,
            totalSpent,
            totalRemaining: totalBudget - totalSpent,
            overallPercentage: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
        };
    }
};
exports.BudgetsService = BudgetsService;
exports.BudgetsService = BudgetsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(budget_entity_1.Budget)),
    __param(1, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], BudgetsService);
//# sourceMappingURL=budgets.service.js.map