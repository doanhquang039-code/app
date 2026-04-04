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
exports.FinancialInsightsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../../entities/transaction.entity");
const category_entity_1 = require("../../entities/category.entity");
let FinancialInsightsService = class FinancialInsightsService {
    transactionRepository;
    categoryRepository;
    constructor(transactionRepository, categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }
    async getSpendingByCategory(userId, month) {
        const qb = this.transactionRepository
            .createQueryBuilder('t')
            .leftJoinAndSelect('t.category', 'category')
            .where('t.userId = :userId', { userId })
            .andWhere('t.type = :type', { type: 'expense' });
        if (month) {
            const [year, monthNum] = month.split('-');
            qb.andWhere('MONTH(t.date) = :month AND YEAR(t.date) = :year', {
                month: parseInt(monthNum),
                year: parseInt(year),
            });
        }
        const transactions = await qb.getMany();
        const byCategory = {};
        let totalSpent = 0;
        transactions.forEach((t) => {
            const categoryName = t.category?.name || 'Uncategorized';
            if (!byCategory[categoryName]) {
                byCategory[categoryName] = 0;
            }
            byCategory[categoryName] += Number(t.amount);
            totalSpent += Number(t.amount);
        });
        return {
            period: month || 'all-time',
            totalSpent,
            byCategory: Object.entries(byCategory).map(([name, amount]) => ({
                category: name,
                amount: amount,
                percentage: Math.round((amount / totalSpent) * 100),
            })),
        };
    }
    async getMonthlyTrend(userId, months = 6) {
        const transactions = await this.transactionRepository.find({
            where: { userId },
        });
        const trends = {};
        const now = new Date();
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthTransactions = transactions.filter((t) => {
                const tDate = new Date(t.date);
                return (tDate.getFullYear() === date.getFullYear() &&
                    tDate.getMonth() === date.getMonth());
            });
            const income = monthTransactions
                .filter((t) => t.type === 'income')
                .reduce((sum, t) => sum + Number(t.amount), 0);
            const expense = monthTransactions
                .filter((t) => t.type === 'expense')
                .reduce((sum, t) => sum + Number(t.amount), 0);
            trends[monthKey] = {
                income,
                expense,
                net: income - expense,
            };
        }
        return trends;
    }
    async getRecommendations(userId) {
        const recommendations = [];
        const lastMonth = this.getLastMonthString();
        const spending = await this.getSpendingByCategory(userId, lastMonth);
        const topCategories = spending.byCategory
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 3);
        if (topCategories.some((c) => c.percentage > 40)) {
            recommendations.push({
                type: 'warning',
                title: 'Chi tiêu tập trung quá cao',
                description: `${topCategories[0].category} chiếm ${topCategories[0].percentage}% chi tiêu. Cân nhắc giảm bớt chi tiêu ở mục này.`,
                priority: 'high',
            });
        }
        const monthlyTrend = await this.getMonthlyTrend(userId, 1);
        const lastMonthData = monthlyTrend[lastMonth];
        if (lastMonthData && lastMonthData.expense > lastMonthData.income * 0.8) {
            recommendations.push({
                type: 'warning',
                title: 'Chi tiêu cao so với thu nhập',
                description: `Chi tiêu (${this.formatCurrency(lastMonthData.expense)}) gần bằng thu nhập. Hãy tìm cách giảm chi tiêu.`,
                priority: 'high',
            });
        }
        if (lastMonthData && lastMonthData.net > 0) {
            recommendations.push({
                type: 'success',
                title: 'Bạn có dư tiền tiết kiệm',
                description: `Tháng này bạn tiết kiệm ${this.formatCurrency(lastMonthData.net)}. Hãy thêm vào mục tiêu tiết kiệm!`,
                priority: 'medium',
            });
        }
        if (lastMonthData && lastMonthData.income === 0) {
            recommendations.push({
                type: 'info',
                title: 'Chưa có doanh thu',
                description: 'Bạn chưa ghi nhận bất kỳ khoản thu nhập nào tháng này.',
                priority: 'low',
            });
        }
        const trendEntries = Object.entries(monthlyTrend).sort();
        if (trendEntries.length >= 3) {
            const lastThreeMonths = trendEntries.slice(-3);
            const avgExpense = lastThreeMonths.reduce((sum, [_, data]) => sum + data.expense, 0) / 3;
            const currentExpense = lastMonthData?.expense || 0;
            if (currentExpense > avgExpense * 1.2) {
                recommendations.push({
                    type: 'warning',
                    title: 'Chi tiêu tăng đột biến',
                    description: `Chi tiêu tháng này cao hơn 20% so với trung bình 3 tháng gần đây.`,
                    priority: 'medium',
                });
            }
        }
        return {
            period: lastMonth,
            totalRecommendations: recommendations.length,
            recommendations: recommendations.sort((a, b) => {
                const priorityMap = { high: 0, medium: 1, low: 2 };
                return (priorityMap[a.priority] || 3) - (priorityMap[b.priority] || 3);
            }),
        };
    }
    async getSpendingForecast(userId, months = 3) {
        const trends = await this.getMonthlyTrend(userId, 6);
        const trendValues = Object.values(trends);
        const lastThreeMonths = trendValues.slice(-3);
        const avgExpense = lastThreeMonths.reduce((sum, t) => sum + t.expense, 0) / 3;
        const avgIncome = lastThreeMonths.reduce((sum, t) => sum + t.income, 0) / 3;
        const forecast = [];
        const now = new Date();
        for (let i = 1; i <= months; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            forecast.push({
                month: monthKey,
                projectedIncome: Math.round(avgIncome),
                projectedExpense: Math.round(avgExpense),
                projectedNet: Math.round(avgIncome - avgExpense),
            });
        }
        return {
            basedOnMonths: 3,
            forecast,
        };
    }
    async getFinancialSummary(userId) {
        const transactions = await this.transactionRepository.find({
            where: { userId },
        });
        const totalIncome = transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const totalExpense = transactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const lastMonth = this.getLastMonthString();
        const lastMonthTransactions = transactions.filter((t) => {
            const tDate = new Date(t.date);
            const [year, month] = lastMonth.split('-');
            return (tDate.getFullYear() === parseInt(year) &&
                tDate.getMonth() === parseInt(month) - 1);
        });
        const lastMonthIncome = lastMonthTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const lastMonthExpense = lastMonthTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        return {
            allTime: {
                totalIncome,
                totalExpense,
                net: totalIncome - totalExpense,
            },
            lastMonth: {
                month: lastMonth,
                income: lastMonthIncome,
                expense: lastMonthExpense,
                net: lastMonthIncome - lastMonthExpense,
                savingsRate: lastMonthIncome > 0
                    ? Math.round(((lastMonthIncome - lastMonthExpense) / lastMonthIncome) * 100)
                    : 0,
            },
        };
    }
    getLastMonthString() {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
    }
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(amount);
    }
};
exports.FinancialInsightsService = FinancialInsightsService;
exports.FinancialInsightsService = FinancialInsightsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], FinancialInsightsService);
//# sourceMappingURL=financial-insights.service.js.map