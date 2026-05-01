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
exports.RecommendationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../entities/transaction.entity");
const budget_entity_1 = require("../entities/budget.entity");
let RecommendationService = class RecommendationService {
    transactionRepo;
    budgetRepo;
    constructor(transactionRepo, budgetRepo) {
        this.transactionRepo = transactionRepo;
        this.budgetRepo = budgetRepo;
    }
    async getPersonalizedRecommendations(userId) {
        const recommendations = [];
        const spendingRec = await this.getSpendingRecommendations(userId);
        recommendations.push(...spendingRec);
        const savingsRec = await this.getSavingsRecommendations(userId);
        recommendations.push(...savingsRec);
        const budgetRec = await this.getBudgetRecommendations(userId);
        recommendations.push(...budgetRec);
        return recommendations.sort((a, b) => b.priority - a.priority);
    }
    async getSpendingRecommendations(userId) {
        const transactions = await this.transactionRepo.find({
            where: { userId, type: 'expense' },
            order: { date: 'DESC' },
            take: 90,
        });
        const recommendations = [];
        const categorySpending = this.groupByCategory(transactions);
        for (const [category, amount] of categorySpending.entries()) {
            const avgMonthly = amount / 3;
            if (category === 'dining' && avgMonthly > 500) {
                recommendations.push({
                    type: 'reduce_spending',
                    category,
                    title: 'Reduce Dining Out',
                    message: `You're spending $${avgMonthly.toFixed(2)}/month on dining. Consider cooking at home more often.`,
                    potentialSavings: avgMonthly * 0.3,
                    priority: 8,
                });
            }
            if (category === 'entertainment' && avgMonthly > 300) {
                recommendations.push({
                    type: 'reduce_spending',
                    category,
                    title: 'Optimize Entertainment',
                    message: `Entertainment spending is $${avgMonthly.toFixed(2)}/month. Look for free alternatives.`,
                    potentialSavings: avgMonthly * 0.2,
                    priority: 6,
                });
            }
        }
        return recommendations;
    }
    async getSavingsRecommendations(userId) {
        const transactions = await this.transactionRepo.find({
            where: { userId },
            order: { date: 'DESC' },
            take: 90,
        });
        const recommendations = [];
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const savingsRate = ((income - expenses) / income) * 100;
        if (savingsRate < 20) {
            recommendations.push({
                type: 'increase_savings',
                title: 'Increase Savings Rate',
                message: `Your savings rate is ${savingsRate.toFixed(1)}%. Aim for at least 20%.`,
                targetSavingsRate: 20,
                additionalSavingsNeeded: (income * 0.2) - (income - expenses),
                priority: 9,
            });
        }
        const monthlyExpenses = expenses / 3;
        const recommendedEmergencyFund = monthlyExpenses * 6;
        recommendations.push({
            type: 'emergency_fund',
            title: 'Build Emergency Fund',
            message: `Build an emergency fund of $${recommendedEmergencyFund.toFixed(2)} (6 months of expenses).`,
            targetAmount: recommendedEmergencyFund,
            monthlySavingsNeeded: recommendedEmergencyFund / 12,
            priority: 10,
        });
        return recommendations;
    }
    async getBudgetRecommendations(userId) {
        const budgets = await this.budgetRepo.find({ where: { userId } });
        const recommendations = [];
        for (const budget of budgets) {
            const transactions = await this.transactionRepo.find({
                where: {
                    userId,
                    categoryId: budget.categoryId,
                    type: 'expense',
                },
            });
            const [year, month] = budget.month.split('-').map(Number);
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            const spent = transactions
                .filter(t => {
                const tDate = new Date(t.date);
                return tDate >= startDate && tDate <= endDate;
            })
                .reduce((sum, t) => sum + t.amount, 0);
            const percentage = (spent / budget.amount) * 100;
            if (percentage > 90) {
                recommendations.push({
                    type: 'budget_alert',
                    budgetId: budget.id,
                    title: 'Budget Almost Exceeded',
                    message: `You've used ${percentage.toFixed(1)}% of your budget.`,
                    spent,
                    remaining: budget.amount - spent,
                    priority: 9,
                });
            }
            if (percentage < 50 && spent > 0) {
                recommendations.push({
                    type: 'budget_optimization',
                    budgetId: budget.id,
                    title: 'Budget Underutilized',
                    message: `Only ${percentage.toFixed(1)}% of budget used. Consider reallocating.`,
                    spent,
                    unused: budget.amount - spent,
                    priority: 4,
                });
            }
        }
        return recommendations;
    }
    groupByCategory(transactions) {
        const map = new Map();
        transactions.forEach(t => {
            const category = t.categoryId?.toString() || 'uncategorized';
            map.set(category, (map.get(category) || 0) + t.amount);
        });
        return map;
    }
};
exports.RecommendationService = RecommendationService;
exports.RecommendationService = RecommendationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(budget_entity_1.Budget)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RecommendationService);
//# sourceMappingURL=recommendation.service.js.map