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
exports.CashFlowService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const budget_entity_1 = require("../../entities/budget.entity");
const subscription_entity_1 = require("../../entities/subscription.entity");
const transaction_entity_1 = require("../../entities/transaction.entity");
let CashFlowService = class CashFlowService {
    transactionRepo;
    budgetRepo;
    subscriptionRepo;
    constructor(transactionRepo, budgetRepo, subscriptionRepo) {
        this.transactionRepo = transactionRepo;
        this.budgetRepo = budgetRepo;
        this.subscriptionRepo = subscriptionRepo;
    }
    async getSummary(userId, requestedDays = 30) {
        const days = this.clampDays(requestedDays);
        const today = this.startOfDay(new Date());
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - days + 1);
        const transactions = await this.transactionRepo
            .createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.category', 'category')
            .where('transaction.userId = :userId', { userId })
            .andWhere('transaction.date >= :startDate', { startDate })
            .andWhere('transaction.date <= :endDate', { endDate: this.endOfDay(today) })
            .orderBy('transaction.date', 'ASC')
            .getMany();
        const income = transactions
            .filter((transaction) => this.isIncome(transaction.type))
            .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
        const expense = transactions
            .filter((transaction) => !this.isIncome(transaction.type))
            .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
        const net = income - expense;
        const dailyBurn = expense / days;
        const dailyIncome = income / days;
        const projectedExpense = dailyBurn * 30;
        const projectedNet = dailyIncome * 30 - projectedExpense;
        const runwayDays = dailyBurn > 0 ? Math.floor(Math.max(net, 0) / dailyBurn) : 999;
        const trend = this.buildDailyTrend(transactions, startDate, days);
        const categoryData = this.buildCategoryBreakdown(transactions);
        const budgetRisks = await this.getBudgetRisks(userId, today);
        const upcomingBills = await this.getUpcomingBills(userId, today);
        const topTransactions = this.getTopTransactions(transactions);
        const largestExpenseDay = this.getLargestExpenseDay(trend);
        const savingsRate = income > 0 ? Math.round((net / income) * 100) : 0;
        const expenseRatio = income > 0 ? Math.round((expense / income) * 100) : 0;
        return {
            rangeDays: days,
            income,
            expense,
            net,
            dailyBurn,
            dailyIncome,
            projectedExpense,
            projectedNet,
            runwayDays,
            savingsRate,
            expenseRatio,
            largestExpenseDay,
            healthScore: this.calculateHealthScore(net, runwayDays, savingsRate, budgetRisks.length),
            trend,
            forecast: this.buildForecast(today, net, dailyIncome, dailyBurn, upcomingBills),
            categoryData,
            budgetRisks,
            upcomingBills,
            topTransactions,
            insights: this.buildInsights({
                net,
                savingsRate,
                expenseRatio,
                runwayDays,
                projectedNet,
                budgetRisks,
                upcomingBills,
                categoryData,
                largestExpenseDay,
            }),
        };
    }
    buildDailyTrend(transactions, startDate, days) {
        const dailyMap = new Map();
        for (let index = 0; index < days; index += 1) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + index);
            const key = this.formatDayKey(date);
            dailyMap.set(key, { date: key, income: 0, expense: 0, net: 0, cumulative: 0 });
        }
        for (const transaction of transactions) {
            const key = this.formatDayKey(transaction.date);
            const row = dailyMap.get(key);
            if (!row)
                continue;
            const amount = Number(transaction.amount);
            if (this.isIncome(transaction.type)) {
                row.income += amount;
            }
            else {
                row.expense += amount;
            }
            row.net = row.income - row.expense;
        }
        let cumulative = 0;
        return Array.from(dailyMap.values()).map((row) => {
            cumulative += row.net;
            return { ...row, cumulative };
        });
    }
    buildCategoryBreakdown(transactions) {
        const categories = new Map();
        transactions
            .filter((transaction) => !this.isIncome(transaction.type))
            .forEach((transaction) => {
            const name = transaction.category?.name || 'Uncategorized';
            categories.set(name, (categories.get(name) || 0) + Number(transaction.amount));
        });
        return Array.from(categories.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
    }
    getTopTransactions(transactions) {
        return transactions
            .filter((transaction) => !this.isIncome(transaction.type))
            .map((transaction) => ({
            id: transaction.id,
            amount: Number(transaction.amount),
            date: transaction.date,
            category: transaction.category?.name || 'Uncategorized',
            description: transaction.note || transaction.category?.name || 'Expense',
        }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
    }
    getLargestExpenseDay(trend) {
        const largest = trend.reduce((current, row) => {
            if (!current || row.expense > current.expense)
                return row;
            return current;
        }, null);
        if (!largest || largest.expense <= 0) {
            return null;
        }
        return {
            date: largest.date,
            amount: largest.expense,
            net: largest.net,
        };
    }
    buildForecast(today, openingBalance, dailyIncome, dailyBurn, upcomingBills) {
        let projectedBalance = openingBalance;
        return Array.from({ length: 30 }).map((_, index) => {
            const date = new Date(today);
            date.setDate(today.getDate() + index + 1);
            const billsTotal = upcomingBills
                .filter((bill) => this.isSameDay(bill.date, date))
                .reduce((sum, bill) => sum + bill.amount, 0);
            projectedBalance += dailyIncome - dailyBurn - billsTotal;
            return {
                date: this.formatDayKey(date),
                balance: Math.round(projectedBalance),
                bills: billsTotal,
            };
        });
    }
    buildInsights(input) {
        const insights = [];
        if (input.projectedNet < 0) {
            insights.push({
                type: 'danger',
                title: 'Projected cash gap',
                description: 'Cash flow is projected to be negative over the next 30 days.',
                action: 'Review flexible spending and delay non-essential purchases.',
            });
        }
        else if (input.savingsRate >= 20) {
            insights.push({
                type: 'success',
                title: 'Healthy savings rate',
                description: `Current savings rate is ${input.savingsRate}%.`,
                action: 'Consider moving surplus cash into savings or investments.',
            });
        }
        if (input.expenseRatio >= 90) {
            insights.push({
                type: 'warning',
                title: 'High expense ratio',
                description: `Expenses are using ${input.expenseRatio}% of income in this period.`,
                action: 'Set a weekly spend ceiling for the largest categories.',
            });
        }
        if (input.runwayDays < 14) {
            insights.push({
                type: 'danger',
                title: 'Low runway',
                description: `Available net cash covers about ${input.runwayDays} days of spending.`,
                action: 'Prioritize upcoming bills and pause optional subscriptions.',
            });
        }
        const riskiestBudget = input.budgetRisks[0];
        if (riskiestBudget) {
            insights.push({
                type: riskiestBudget.percent >= 100 ? 'danger' : 'warning',
                title: 'Budget pressure',
                description: `${riskiestBudget.name} has reached ${riskiestBudget.percent}% of its monthly budget.`,
                action: 'Move remaining purchases in this category to next month where possible.',
            });
        }
        const nextBill = input.upcomingBills[0];
        if (nextBill && nextBill.dueIn <= 7) {
            insights.push({
                type: 'info',
                title: 'Bill due soon',
                description: `${nextBill.name} is due in ${nextBill.dueIn} day(s).`,
                action: 'Keep enough cash in the payment wallet before the due date.',
            });
        }
        const topCategory = input.categoryData[0];
        if (topCategory) {
            insights.push({
                type: 'info',
                title: 'Top spending category',
                description: `${topCategory.name} is the largest expense category in this period.`,
                action: 'Check the biggest transactions for this category before adding new spend.',
            });
        }
        if (input.largestExpenseDay) {
            insights.push({
                type: 'info',
                title: 'Largest expense day',
                description: `${input.largestExpenseDay.date} had the highest daily spending.`,
                action: 'Use this day to identify one-off costs versus repeat behavior.',
            });
        }
        if (insights.length === 0) {
            insights.push({
                type: 'success',
                title: 'Cash flow is stable',
                description: 'No major cash flow risks were detected for this period.',
                action: 'Keep tracking transactions to preserve forecast accuracy.',
            });
        }
        return insights.slice(0, 6);
    }
    async getBudgetRisks(userId, today) {
        const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = this.endOfDay(new Date(today.getFullYear(), today.getMonth() + 1, 0));
        const budgets = await this.budgetRepo.find({
            where: { userId, month },
            relations: ['category'],
            order: { createdAt: 'DESC' },
        });
        const risks = await Promise.all(budgets.map(async (budget) => {
            const qb = this.transactionRepo
                .createQueryBuilder('transaction')
                .select('SUM(transaction.amount)', 'total')
                .where('transaction.userId = :userId', { userId })
                .andWhere('transaction.type IN (:...types)', { types: ['expense', 'EXPENSE'] })
                .andWhere('transaction.date >= :monthStart', { monthStart })
                .andWhere('transaction.date <= :monthEnd', { monthEnd });
            if (budget.categoryId) {
                qb.andWhere('transaction.categoryId = :categoryId', { categoryId: budget.categoryId });
            }
            const spentResult = await qb.getRawOne();
            const amount = Number(budget.amount);
            const spent = Number(spentResult?.total) || 0;
            const percent = amount > 0 ? Math.round((spent / amount) * 100) : 0;
            return {
                id: budget.id,
                name: budget.category?.name || 'Budget',
                amount,
                spent,
                percent,
            };
        }));
        return risks
            .filter((budget) => budget.percent >= 70)
            .sort((a, b) => b.percent - a.percent)
            .slice(0, 5);
    }
    async getUpcomingBills(userId, today) {
        const next30Days = this.endOfDay(new Date(today));
        next30Days.setDate(today.getDate() + 30);
        const subscriptions = await this.subscriptionRepo
            .createQueryBuilder('subscription')
            .where('subscription.userId = :userId', { userId })
            .andWhere('subscription.status = :status', { status: 'ACTIVE' })
            .andWhere('subscription.nextBillingDate <= :next30Days', { next30Days })
            .orderBy('subscription.nextBillingDate', 'ASC')
            .take(5)
            .getMany();
        return subscriptions.map((subscription) => ({
            id: subscription.id,
            name: subscription.name,
            amount: Number(subscription.amount),
            date: subscription.nextBillingDate,
            dueIn: this.daysBetween(today, subscription.nextBillingDate),
        }));
    }
    calculateHealthScore(net, runwayDays, savingsRate = 0, riskBudgetCount = 0) {
        const base = 55;
        const netScore = net > 0 ? 15 : -20;
        const runwayScore = runwayDays >= 30 ? 20 : runwayDays >= 14 ? 10 : -15;
        const savingsScore = savingsRate >= 20 ? 15 : savingsRate >= 10 ? 8 : savingsRate < 0 ? -10 : 0;
        const budgetPenalty = Math.min(20, riskBudgetCount * 5);
        return Math.max(0, Math.min(100, Math.round(base + netScore + runwayScore + savingsScore - budgetPenalty)));
    }
    isIncome(type) {
        return type?.toUpperCase() === 'INCOME';
    }
    clampDays(days) {
        if (!Number.isFinite(days))
            return 30;
        return Math.max(7, Math.min(180, Math.trunc(days)));
    }
    startOfDay(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    endOfDay(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    }
    formatDayKey(date) {
        return new Date(date).toISOString().slice(5, 10);
    }
    daysBetween(from, to) {
        return Math.max(1, Math.ceil((this.startOfDay(to).getTime() - this.startOfDay(from).getTime()) / 86400000));
    }
    isSameDay(left, right) {
        return this.startOfDay(left).getTime() === this.startOfDay(right).getTime();
    }
};
exports.CashFlowService = CashFlowService;
exports.CashFlowService = CashFlowService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(budget_entity_1.Budget)),
    __param(2, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CashFlowService);
//# sourceMappingURL=cash-flow.service.js.map