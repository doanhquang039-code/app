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
exports.AdvancedDashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../../entities/transaction.entity");
const budget_entity_1 = require("../../entities/budget.entity");
const user_entity_1 = require("../../entities/user.entity");
let AdvancedDashboardService = class AdvancedDashboardService {
    transactionRepo;
    budgetRepo;
    userRepo;
    constructor(transactionRepo, budgetRepo, userRepo) {
        this.transactionRepo = transactionRepo;
        this.budgetRepo = budgetRepo;
        this.userRepo = userRepo;
    }
    async getAdvancedDashboard(userId) {
        const [overview, spendingTrend, categoryBreakdown, budgetStatus, recentTransactions, insights,] = await Promise.all([
            this.getOverview(userId),
            this.getSpendingTrend(userId),
            this.getCategoryBreakdown(userId),
            this.getBudgetStatus(userId),
            this.getRecentTransactions(userId),
            this.getInsights(userId),
        ]);
        return {
            overview,
            spendingTrend,
            categoryBreakdown,
            budgetStatus,
            recentTransactions,
            insights,
            timestamp: new Date(),
        };
    }
    async getOverview(userId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const transactions = await this.transactionRepo.find({
            where: {
                userId,
                date: (0, typeorm_2.Between)(startOfMonth, endOfMonth),
            },
        });
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const expenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const balance = income - expenses;
        const savingsRate = income > 0 ? (balance / income) * 100 : 0;
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        const prevTransactions = await this.transactionRepo.find({
            where: {
                userId,
                date: (0, typeorm_2.Between)(prevMonthStart, prevMonthEnd),
            },
        });
        const prevIncome = prevTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const prevExpenses = prevTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        return {
            totalBalance: balance,
            monthlyIncome: income,
            monthlyExpenses: expenses,
            savingsRate,
            incomeChange: prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : 0,
            expensesChange: prevExpenses > 0 ? ((expenses - prevExpenses) / prevExpenses) * 100 : 0,
            balanceChange: prevIncome - prevExpenses > 0 ? ((balance - (prevIncome - prevExpenses)) / (prevIncome - prevExpenses)) * 100 : 0,
        };
    }
    async getSpendingTrend(userId) {
        const months = 6;
        const trend = [];
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            const transactions = await this.transactionRepo.find({
                where: {
                    userId,
                    date: (0, typeorm_2.Between)(startOfMonth, endOfMonth),
                },
            });
            const income = transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + Number(t.amount), 0);
            const expenses = transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + Number(t.amount), 0);
            trend.push({
                month: date.toLocaleString('default', { month: 'short' }),
                income,
                expenses,
                savings: income - expenses,
            });
        }
        return trend;
    }
    async getCategoryBreakdown(userId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const transactions = await this.transactionRepo.find({
            where: {
                userId,
                type: 'expense',
                date: (0, typeorm_2.Between)(startOfMonth, now),
            },
        });
        const categoryMap = new Map();
        transactions.forEach(t => {
            const category = t.categoryId?.toString() || 'Uncategorized';
            categoryMap.set(category, (categoryMap.get(category) || 0) + Number(t.amount));
        });
        const total = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);
        return Array.from(categoryMap.entries())
            .map(([category, amount]) => ({
            category,
            amount,
            percentage: total > 0 ? (amount / total) * 100 : 0,
        }))
            .sort((a, b) => b.amount - a.amount);
    }
    async getBudgetStatus(userId) {
        const budgets = await this.budgetRepo.find({ where: { userId } });
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const budgetStatus = [];
        for (const budget of budgets) {
            if (budget.month !== currentMonth)
                continue;
            const [year, month] = budget.month.split('-').map(Number);
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            const transactions = await this.transactionRepo.find({
                where: {
                    userId,
                    categoryId: budget.categoryId,
                    type: 'expense',
                    date: (0, typeorm_2.Between)(startDate, endDate),
                },
            });
            const spent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
            const percentage = (spent / Number(budget.amount)) * 100;
            budgetStatus.push({
                budgetId: budget.id,
                category: budget.categoryId,
                budgetAmount: Number(budget.amount),
                spent,
                remaining: Number(budget.amount) - spent,
                percentage,
                status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'good',
            });
        }
        return budgetStatus;
    }
    async getRecentTransactions(userId, limit = 10) {
        const transactions = await this.transactionRepo.find({
            where: { userId },
            order: { date: 'DESC', createdAt: 'DESC' },
            take: limit,
        });
        return transactions.map(t => ({
            id: t.id,
            type: t.type,
            amount: Number(t.amount),
            category: t.categoryId,
            note: t.note,
            date: t.date,
            createdAt: t.createdAt,
        }));
    }
    async getInsights(userId) {
        const insights = [];
        const velocity = await this.getSpendingVelocity(userId);
        if (velocity.isHigh) {
            insights.push({
                type: 'warning',
                title: 'High Spending Velocity',
                message: `You're spending ${velocity.dailyRate.toFixed(2)} per day, which is ${velocity.percentageAboveAverage.toFixed(1)}% above your average.`,
                priority: 8,
            });
        }
        const budgetStatus = await this.getBudgetStatus(userId);
        const exceededBudgets = budgetStatus.filter(b => b.status === 'exceeded');
        if (exceededBudgets.length > 0) {
            insights.push({
                type: 'alert',
                title: 'Budget Exceeded',
                message: `You've exceeded ${exceededBudgets.length} budget(s) this month.`,
                priority: 9,
            });
        }
        const overview = await this.getOverview(userId);
        if (overview.savingsRate < 20) {
            insights.push({
                type: 'tip',
                title: 'Increase Savings',
                message: `Your savings rate is ${overview.savingsRate.toFixed(1)}%. Try to reach at least 20%.`,
                priority: 7,
            });
        }
        return insights;
    }
    async getSpendingVelocity(userId) {
        const now = new Date();
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const recent = await this.transactionRepo.find({
            where: {
                userId,
                type: 'expense',
                date: (0, typeorm_2.Between)(last7Days, now),
            },
        });
        const historical = await this.transactionRepo.find({
            where: {
                userId,
                type: 'expense',
                date: (0, typeorm_2.Between)(last30Days, now),
            },
        });
        const recentTotal = recent.reduce((sum, t) => sum + Number(t.amount), 0);
        const historicalTotal = historical.reduce((sum, t) => sum + Number(t.amount), 0);
        const recentDailyRate = recentTotal / 7;
        const historicalDailyRate = historicalTotal / 30;
        const percentageAboveAverage = historicalDailyRate > 0
            ? ((recentDailyRate - historicalDailyRate) / historicalDailyRate) * 100
            : 0;
        return {
            dailyRate: recentDailyRate,
            averageDailyRate: historicalDailyRate,
            percentageAboveAverage,
            isHigh: percentageAboveAverage > 20,
        };
    }
    async getRealTimeStats(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTransactions = await this.transactionRepo.find({
            where: {
                userId,
                date: (0, typeorm_2.Between)(today, new Date()),
            },
        });
        const todayIncome = todayTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const todayExpenses = todayTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        return {
            todayIncome,
            todayExpenses,
            todayBalance: todayIncome - todayExpenses,
            transactionCount: todayTransactions.length,
            lastTransaction: todayTransactions[todayTransactions.length - 1] || null,
        };
    }
};
exports.AdvancedDashboardService = AdvancedDashboardService;
exports.AdvancedDashboardService = AdvancedDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(budget_entity_1.Budget)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdvancedDashboardService);
//# sourceMappingURL=advanced-dashboard.service.js.map