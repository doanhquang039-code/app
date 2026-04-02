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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../../entities/transaction.entity");
const wallet_entity_1 = require("../../entities/wallet.entity");
let DashboardService = class DashboardService {
    transactionRepo;
    walletRepo;
    constructor(transactionRepo, walletRepo) {
        this.transactionRepo = transactionRepo;
        this.walletRepo = walletRepo;
    }
    async getOverview(userId) {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const result = await this.transactionRepo
            .createQueryBuilder('t')
            .select('t.type', 'type')
            .addSelect('SUM(t.amount)', 'total')
            .where('t.userId = :userId', { userId })
            .andWhere('MONTH(t.date) = :month AND YEAR(t.date) = :year', {
            month,
            year,
        })
            .groupBy('t.type')
            .getRawMany();
        const income = Number(result.find((r) => r.type === 'income')?.total) || 0;
        const expense = Number(result.find((r) => r.type === 'expense')?.total) || 0;
        const walletResult = await this.walletRepo
            .createQueryBuilder('w')
            .select('SUM(w.balance)', 'totalBalance')
            .where('w.userId = :userId', { userId })
            .getRawOne();
        const totalBalance = Number(walletResult?.totalBalance) || 0;
        const transactionCount = await this.transactionRepo
            .createQueryBuilder('t')
            .where('t.userId = :userId', { userId })
            .andWhere('MONTH(t.date) = :month AND YEAR(t.date) = :year', {
            month,
            year,
        })
            .getCount();
        return {
            income,
            expense,
            balance: income - expense,
            totalBalance,
            transactionCount,
            month: `${year}-${String(month).padStart(2, '0')}`,
        };
    }
    async getRecentTransactions(userId, limit = 10) {
        return this.transactionRepo.find({
            where: { userId },
            relations: ['category', 'wallet'],
            order: { date: 'DESC' },
            take: limit,
        });
    }
    async getExpenseByCategory(userId, month) {
        const [year, m] = month.split('-');
        const result = await this.transactionRepo
            .createQueryBuilder('t')
            .leftJoin('t.category', 'c')
            .select('c.id', 'categoryId')
            .addSelect('c.name', 'categoryName')
            .addSelect('c.icon', 'categoryIcon')
            .addSelect('c.color', 'categoryColor')
            .addSelect('SUM(t.amount)', 'total')
            .addSelect('COUNT(t.id)', 'count')
            .where('t.userId = :userId', { userId })
            .andWhere('t.type = :type', { type: 'expense' })
            .andWhere('MONTH(t.date) = :month AND YEAR(t.date) = :year', {
            month: parseInt(m),
            year: parseInt(year),
        })
            .groupBy('c.id')
            .addGroupBy('c.name')
            .addGroupBy('c.icon')
            .addGroupBy('c.color')
            .orderBy('total', 'DESC')
            .getRawMany();
        const grandTotal = result.reduce((s, r) => s + Number(r.total), 0);
        return result.map((r) => ({
            categoryId: r.categoryId,
            categoryName: r.categoryName,
            categoryIcon: r.categoryIcon,
            categoryColor: r.categoryColor,
            total: Number(r.total),
            count: Number(r.count),
            percentage: grandTotal > 0
                ? Math.round((Number(r.total) / grandTotal) * 100)
                : 0,
        }));
    }
    async getDailyTrend(userId, month) {
        const [year, m] = month.split('-');
        const result = await this.transactionRepo
            .createQueryBuilder('t')
            .select('DAY(t.date)', 'day')
            .addSelect('t.type', 'type')
            .addSelect('SUM(t.amount)', 'total')
            .where('t.userId = :userId', { userId })
            .andWhere('MONTH(t.date) = :month AND YEAR(t.date) = :year', {
            month: parseInt(m),
            year: parseInt(year),
        })
            .groupBy('DAY(t.date)')
            .addGroupBy('t.type')
            .orderBy('day', 'ASC')
            .getRawMany();
        const daysInMonth = new Date(parseInt(year), parseInt(m), 0).getDate();
        const dailyData = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const incomeRow = result.find((r) => Number(r.day) === d && r.type === 'income');
            const expenseRow = result.find((r) => Number(r.day) === d && r.type === 'expense');
            dailyData.push({
                day: d,
                date: `${year}-${m}-${String(d).padStart(2, '0')}`,
                income: Number(incomeRow?.total) || 0,
                expense: Number(expenseRow?.total) || 0,
            });
        }
        return dailyData;
    }
    async getMonthlyComparison(userId) {
        const result = await this.transactionRepo
            .createQueryBuilder('t')
            .select('YEAR(t.date)', 'year')
            .addSelect('MONTH(t.date)', 'month')
            .addSelect('t.type', 'type')
            .addSelect('SUM(t.amount)', 'total')
            .where('t.userId = :userId', { userId })
            .andWhere('t.date >= DATEADD(MONTH, -6, GETDATE())')
            .groupBy('YEAR(t.date)')
            .addGroupBy('MONTH(t.date)')
            .addGroupBy('t.type')
            .orderBy('year', 'ASC')
            .addOrderBy('month', 'ASC')
            .getRawMany();
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const label = `${y}-${String(m).padStart(2, '0')}`;
            const incomeRow = result.find((r) => Number(r.year) === y && Number(r.month) === m && r.type === 'income');
            const expenseRow = result.find((r) => Number(r.year) === y && Number(r.month) === m && r.type === 'expense');
            months.push({
                month: label,
                income: Number(incomeRow?.total) || 0,
                expense: Number(expenseRow?.total) || 0,
            });
        }
        return months;
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map