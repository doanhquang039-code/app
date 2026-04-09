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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const analytics_entity_1 = require("../../entities/analytics.entity");
const transaction_entity_1 = require("../../entities/transaction.entity");
const category_entity_1 = require("../../entities/category.entity");
let AnalyticsService = class AnalyticsService {
    analyticsRepository;
    forecastRepository;
    transactionRepository;
    categoryRepository;
    constructor(analyticsRepository, forecastRepository, transactionRepository, categoryRepository) {
        this.analyticsRepository = analyticsRepository;
        this.forecastRepository = forecastRepository;
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }
    async generateDailyAnalytics(userId, date) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        const transactions = await this.transactionRepository.find({
            where: {
                userId,
            },
        });
        const dayTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= startDate && tDate <= endDate;
        });
        const totalIncome = dayTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const totalExpense = dayTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const savingsAmount = totalIncome - totalExpense;
        const savingsRatePercentage = totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0;
        const categoryBreakdown = await this.getCategoryBreakdown(userId, dayTransactions);
        const analytics = this.analyticsRepository.create({
            userId,
            date,
            totalIncome,
            totalExpense,
            savingsAmount,
            savingsRatePercentage,
            period: 'daily',
            categoryBreakdown: JSON.stringify(categoryBreakdown),
        });
        return this.analyticsRepository.save(analytics);
    }
    async generateWeeklyAnalytics(userId, startDate) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        const transactions = await this.transactionRepository.find({
            where: { userId },
        });
        const weekTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= startDate && tDate <= endDate;
        });
        const totalIncome = weekTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const totalExpense = weekTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const savingsAmount = totalIncome - totalExpense;
        const savingsRatePercentage = totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0;
        const categoryBreakdown = await this.getCategoryBreakdown(userId, weekTransactions);
        const trends = await this.calculateDailyTrends(weekTransactions);
        const analytics = this.analyticsRepository.create({
            userId,
            date: startDate,
            totalIncome,
            totalExpense,
            savingsAmount,
            savingsRatePercentage,
            period: 'weekly',
            categoryBreakdown: JSON.stringify(categoryBreakdown),
            trends: JSON.stringify(trends),
        });
        return this.analyticsRepository.save(analytics);
    }
    async generateMonthlyAnalytics(userId, month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const transactions = await this.transactionRepository.find({
            where: { userId },
        });
        const monthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= startDate && tDate <= endDate;
        });
        const totalIncome = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const totalExpense = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const savingsAmount = totalIncome - totalExpense;
        const savingsRatePercentage = totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0;
        const categoryBreakdown = await this.getCategoryBreakdown(userId, monthTransactions);
        const trends = await this.calculateDailyTrends(monthTransactions);
        const analytics = this.analyticsRepository.create({
            userId,
            date: startDate,
            totalIncome,
            totalExpense,
            savingsAmount,
            savingsRatePercentage,
            period: 'monthly',
            categoryBreakdown: JSON.stringify(categoryBreakdown),
            trends: JSON.stringify(trends),
        });
        return this.analyticsRepository.save(analytics);
    }
    async getAnalyticsRange(userId, startDate, endDate, period) {
        return this.analyticsRepository.find({
            where: {
                userId,
                period,
            },
            order: { date: 'ASC' },
        });
    }
    async compareMonths(userId, currentMonth, currentYear, previousMonth, previousYear) {
        const currentAnalytics = await this.generateMonthlyAnalytics(userId, currentMonth, currentYear);
        const previousAnalytics = await this.generateMonthlyAnalytics(userId, previousMonth, previousYear);
        const expenseDiff = Number(currentAnalytics.totalExpense) - Number(previousAnalytics.totalExpense);
        const expenseDiffPercentage = Number(previousAnalytics.totalExpense) > 0
            ? (expenseDiff / Number(previousAnalytics.totalExpense)) * 100
            : 0;
        const incomeDiff = Number(currentAnalytics.totalIncome) - Number(previousAnalytics.totalIncome);
        const incomeDiffPercentage = Number(previousAnalytics.totalIncome) > 0
            ? (incomeDiff / Number(previousAnalytics.totalIncome)) * 100
            : 0;
        return {
            current: currentAnalytics,
            previous: previousAnalytics,
            comparison: {
                expenseDiff,
                expenseDiffPercentage,
                incomeDiff,
                incomeDiffPercentage,
                savingsDiff: Number(currentAnalytics.savingsAmount) - Number(previousAnalytics.savingsAmount),
            },
        };
    }
    async createForecast(userId, createForecastDto) {
        const forecast = this.forecastRepository.create({
            ...createForecastDto,
            userId,
        });
        return this.forecastRepository.save(forecast);
    }
    async getForecastsForMonth(userId, month, year) {
        return this.forecastRepository.find({
            where: { userId, month, year },
        });
    }
    async updateForecastWithActual(id, userId, actualAmount) {
        await this.forecastRepository.update({ id, userId }, { actualAmount });
        return this.forecastRepository.findOne({ where: { id, userId } });
    }
    async getCategoryBreakdown(userId, transactions) {
        const breakdown = {};
        for (const transaction of transactions) {
            if (transaction.type === 'expense') {
                const category = await this.categoryRepository.findOne({ where: { id: transaction.categoryId } });
                const categoryName = category?.name || 'Uncategorized';
                breakdown[categoryName] = (breakdown[categoryName] || 0) + Number(transaction.amount);
            }
        }
        return breakdown;
    }
    async calculateDailyTrends(transactions) {
        const trends = {};
        transactions.forEach(t => {
            const date = new Date(t.date).toISOString().split('T')[0];
            if (!trends[date]) {
                trends[date] = { income: 0, expense: 0 };
            }
            if (t.type === 'income') {
                trends[date].income += Number(t.amount);
            }
            else {
                trends[date].expense += Number(t.amount);
            }
        });
        return trends;
    }
    async getSpendingTrend(userId, days = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const transactions = await this.transactionRepository.find({
            where: { userId },
        });
        const trend = {};
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            trend[dateStr] = 0;
        }
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
            const dateStr = new Date(t.date).toISOString().split('T')[0];
            if (trend.hasOwnProperty(dateStr)) {
                trend[dateStr] += Number(t.amount);
            }
        });
        return trend;
    }
    async getPredictedMonthlyExpense(userId) {
        const forecasts = await this.forecastRepository.find({
            where: { userId },
        });
        const totalPredicted = forecasts.reduce((sum, f) => sum + Number(f.predictedAmount), 0);
        return totalPredicted;
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(analytics_entity_1.AnalyticsData)),
    __param(1, (0, typeorm_1.InjectRepository)(analytics_entity_1.SpendingForecast)),
    __param(2, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(3, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map