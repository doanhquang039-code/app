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
exports.PredictionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../entities/transaction.entity");
const budget_entity_1 = require("../entities/budget.entity");
let PredictionService = class PredictionService {
    transactionRepo;
    budgetRepo;
    constructor(transactionRepo, budgetRepo) {
        this.transactionRepo = transactionRepo;
        this.budgetRepo = budgetRepo;
    }
    async predictBudgetOverrun(userId, budgetId) {
        const budget = await this.budgetRepo.findOne({ where: { id: budgetId } });
        if (!budget)
            return null;
        const transactions = await this.transactionRepo.find({
            where: {
                userId,
                categoryId: budget.categoryId,
                type: 'expense',
            },
            order: { date: 'DESC' },
            take: 90,
        });
        const [year, month] = budget.month.split('-').map(Number);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const currentSpent = transactions
            .filter(t => {
            const tDate = new Date(t.date);
            return tDate >= startDate && tDate <= endDate;
        })
            .reduce((sum, t) => sum + t.amount, 0);
        const now = new Date();
        const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysRemaining = totalDays - daysElapsed;
        const dailyRate = currentSpent / Math.max(daysElapsed, 1);
        const projectedTotal = currentSpent + (dailyRate * daysRemaining);
        return {
            budgetId,
            budgetAmount: budget.amount,
            currentSpent,
            projectedTotal,
            overrunAmount: Math.max(0, projectedTotal - budget.amount),
            overrunProbability: projectedTotal > budget.amount ? Math.min((projectedTotal / budget.amount - 1) * 100, 100) : 0,
            daysRemaining,
            recommendedDailyLimit: Math.max(0, (budget.amount - currentSpent) / Math.max(daysRemaining, 1)),
        };
    }
    async predictNextTransaction(userId) {
        const transactions = await this.transactionRepo.find({
            where: { userId },
            order: { date: 'DESC' },
            take: 100,
        });
        if (transactions.length < 10) {
            return null;
        }
        const patterns = this.analyzeTransactionPatterns(transactions);
        const prediction = this.predictNext(patterns);
        return prediction;
    }
    async predictSavingsPotential(userId) {
        const transactions = await this.transactionRepo.find({
            where: { userId },
            order: { date: 'DESC' },
            take: 180,
        });
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const discretionaryCategories = ['entertainment', 'dining', 'shopping'];
        const discretionarySpending = transactions
            .filter(t => t.type === 'expense' && discretionaryCategories.includes(t.categoryId?.toString() || ''))
            .reduce((sum, t) => sum + t.amount, 0);
        const potentialSavings = discretionarySpending * 0.3;
        return {
            currentIncome: income,
            currentExpenses: expenses,
            currentSavings: income - expenses,
            discretionarySpending,
            potentialSavings,
            projectedSavings: (income - expenses) + potentialSavings,
            savingsRate: ((income - expenses) / income) * 100,
            potentialSavingsRate: (((income - expenses) + potentialSavings) / income) * 100,
        };
    }
    async predictGoalAchievement(userId, goalAmount, targetDate) {
        const transactions = await this.transactionRepo.find({
            where: { userId },
            order: { date: 'DESC' },
            take: 90,
        });
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const monthlySavings = (income - expenses) / 3;
        const monthsToGoal = Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30));
        const projectedSavings = monthlySavings * monthsToGoal;
        return {
            goalAmount,
            targetDate,
            monthsToGoal,
            currentMonthlySavings: monthlySavings,
            projectedSavings,
            shortfall: Math.max(0, goalAmount - projectedSavings),
            achievementProbability: Math.min((projectedSavings / goalAmount) * 100, 100),
            requiredMonthlySavings: goalAmount / monthsToGoal,
            recommendation: projectedSavings >= goalAmount
                ? 'On track to achieve goal'
                : `Need to save additional ${((goalAmount - projectedSavings) / monthsToGoal).toFixed(2)} per month`,
        };
    }
    analyzeTransactionPatterns(transactions) {
        const patterns = {
            byCategory: new Map(),
            byDayOfWeek: new Map(),
            byHourOfDay: new Map(),
            avgAmount: 0,
        };
        transactions.forEach(t => {
            const category = t.categoryId?.toString() || 'uncategorized';
            if (!patterns.byCategory.has(category)) {
                patterns.byCategory.set(category, []);
            }
            patterns.byCategory.get(category).push(t.amount);
            const date = new Date(t.date);
            const day = date.getDay();
            const hour = date.getHours();
            patterns.byDayOfWeek.set(day, (patterns.byDayOfWeek.get(day) || 0) + 1);
            patterns.byHourOfDay.set(hour, (patterns.byHourOfDay.get(hour) || 0) + 1);
        });
        patterns.avgAmount = transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length;
        return patterns;
    }
    predictNext(patterns) {
        let maxCount = 0;
        let mostCommonCategory = '';
        let categoryAmounts = [];
        patterns.byCategory.forEach((amounts, category) => {
            if (amounts.length > maxCount) {
                maxCount = amounts.length;
                mostCommonCategory = category;
                categoryAmounts = amounts;
            }
        });
        const mostCommonDay = this.getMaxKey(patterns.byDayOfWeek);
        const mostCommonHour = this.getMaxKey(patterns.byHourOfDay);
        const avgAmount = categoryAmounts.reduce((a, b) => a + b, 0) / categoryAmounts.length;
        return {
            category: mostCommonCategory,
            predictedAmount: avgAmount,
            predictedDay: mostCommonDay,
            predictedHour: mostCommonHour,
            confidence: Math.min(maxCount / 10, 1),
        };
    }
    getMaxKey(map) {
        let maxCount = 0;
        let maxKey = 0;
        map.forEach((count, key) => {
            if (count > maxCount) {
                maxCount = count;
                maxKey = key;
            }
        });
        return maxKey;
    }
};
exports.PredictionService = PredictionService;
exports.PredictionService = PredictionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(budget_entity_1.Budget)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PredictionService);
//# sourceMappingURL=prediction.service.js.map