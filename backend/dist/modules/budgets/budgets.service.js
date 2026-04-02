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
        const exists = await this.budgetRepo.findOne({
            where: {
                userId,
                categoryId: dto.categoryId,
                month: dto.month,
            },
        });
        if (exists) {
            throw new common_1.ConflictException('Đã tồn tại ngân sách cho danh mục này trong tháng này');
        }
        const budget = this.budgetRepo.create({ ...dto, userId });
        return this.budgetRepo.save(budget);
    }
    async findAll(userId, month) {
        const where = { userId };
        if (month)
            where.month = month;
        return this.budgetRepo.find({
            where,
            relations: ['category'],
            order: { createdAt: 'DESC' },
        });
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
        const budgets = await this.findAll(userId, month);
        if (budgets.length === 0) {
            return { budgets: [], totalBudget: 0, totalSpent: 0 };
        }
        const [year, m] = month.split('-');
        const result = await Promise.all(budgets.map(async (budget) => {
            const spentResult = await this.transactionRepo
                .createQueryBuilder('t')
                .select('SUM(t.amount)', 'total')
                .where('t.userId = :userId', { userId })
                .andWhere('t.categoryId = :categoryId', {
                categoryId: budget.categoryId,
            })
                .andWhere('t.type = :type', { type: 'expense' })
                .andWhere('MONTH(t.date) = :month AND YEAR(t.date) = :year', {
                month: parseInt(m),
                year: parseInt(year),
            })
                .getRawOne();
            const spent = Number(spentResult?.total) || 0;
            const budgetAmount = Number(budget.amount);
            const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;
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
                categoryName: budget.category?.name || '',
                categoryIcon: budget.category?.icon || '',
                budgetAmount,
                spent,
                remaining: budgetAmount - spent,
                percentage,
                status,
            };
        }));
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