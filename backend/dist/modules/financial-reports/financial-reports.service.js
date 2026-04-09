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
exports.FinancialReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const financial_report_entity_1 = require("../../entities/financial-report.entity");
const transaction_entity_1 = require("../../entities/transaction.entity");
const budget_entity_1 = require("../../entities/budget.entity");
let FinancialReportsService = class FinancialReportsService {
    reportRepository;
    transactionRepository;
    budgetRepository;
    constructor(reportRepository, transactionRepository, budgetRepository) {
        this.reportRepository = reportRepository;
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
    }
    async generateMonthlyReport(userId, month, year) {
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
        const netSavings = totalIncome - totalExpense;
        const reportData = {
            period: `${month}/${year}`,
            totalIncome,
            totalExpense,
            netSavings,
            transactions: monthTransactions.length,
            categoryBreakdown: await this.getCategoryBreakdown(monthTransactions),
            budgetStatus: await this.getBudgetStatus(userId, month, year),
            topExpenseCategories: await this.getTopCategories(monthTransactions, 5),
            dailyAverage: monthTransactions.filter(t => t.type === 'expense').length > 0
                ? totalExpense / monthTransactions.filter(t => t.type === 'expense').length
                : 0,
        };
        const report = this.reportRepository.create({
            userId,
            month,
            year,
            reportType: 'MONTHLY',
            totalIncome,
            totalExpense,
            netSavings,
            reportData: JSON.stringify(reportData),
            status: 'generated',
        });
        return this.reportRepository.save(report);
    }
    async generateQuarterlyReport(userId, quarter, year) {
        const months = {
            1: [1, 2, 3],
            2: [4, 5, 6],
            3: [7, 8, 9],
            4: [10, 11, 12],
        };
        const quarterMonths = months[quarter];
        const reports = [];
        for (const month of quarterMonths) {
            const report = await this.generateMonthlyReport(userId, month, year);
            reports.push(report);
        }
        const totalIncome = reports.reduce((sum, r) => sum + Number(r.totalIncome), 0);
        const totalExpense = reports.reduce((sum, r) => sum + Number(r.totalExpense), 0);
        const netSavings = totalIncome - totalExpense;
        const reportData = {
            period: `Q${quarter}/${year}`,
            totalIncome,
            totalExpense,
            netSavings,
            monthlyReports: reports.map(r => ({
                month: r.month,
                income: r.totalIncome,
                expense: r.totalExpense,
            })),
            averageMonthlyExpense: totalExpense / 3,
        };
        const quarterReport = this.reportRepository.create({
            userId,
            month: quarterMonths[0],
            year,
            reportType: 'QUARTERLY',
            totalIncome,
            totalExpense,
            netSavings,
            reportData: JSON.stringify(reportData),
            status: 'generated',
        });
        return this.reportRepository.save(quarterReport);
    }
    async generateYearlyReport(userId, year) {
        const reports = [];
        for (let month = 1; month <= 12; month++) {
            const report = await this.generateMonthlyReport(userId, month, year);
            reports.push(report);
        }
        const totalIncome = reports.reduce((sum, r) => sum + Number(r.totalIncome), 0);
        const totalExpense = reports.reduce((sum, r) => sum + Number(r.totalExpense), 0);
        const netSavings = totalIncome - totalExpense;
        const reportData = {
            period: year.toString(),
            totalIncome,
            totalExpense,
            netSavings,
            monthlyBreakdown: reports.map(r => ({
                month: r.month,
                income: r.totalIncome,
                expense: r.totalExpense,
                saving: r.netSavings,
            })),
            averageMonthlyExpense: totalExpense / 12,
            averageMonthlyIncome: totalIncome / 12,
            savingsRate: (netSavings / totalIncome) * 100,
        };
        const yearlyReport = this.reportRepository.create({
            userId,
            month: 1,
            year,
            reportType: 'YEARLY',
            totalIncome,
            totalExpense,
            netSavings,
            reportData: JSON.stringify(reportData),
            status: 'generated',
        });
        return this.reportRepository.save(yearlyReport);
    }
    async getReport(reportId, userId) {
        return this.reportRepository.findOne({
            where: { id: reportId, userId },
        });
    }
    async getReportsByUser(userId, reportType) {
        const query = this.reportRepository.createQueryBuilder('report')
            .where('report.userId = :userId', { userId });
        if (reportType) {
            query.andWhere('report.reportType = :reportType', { reportType });
        }
        return query.orderBy('report.createdAt', 'DESC').getMany();
    }
    async deleteReport(reportId, userId) {
        await this.reportRepository.delete({ id: reportId, userId });
    }
    async exportReportAsJSON(reportId, userId) {
        const report = await this.getReport(reportId, userId);
        if (!report)
            throw new Error('Report not found');
        return {
            id: report.id,
            period: `${report.month}/${report.year}`,
            reportType: report.reportType,
            ...JSON.parse(report.reportData),
            generatedAt: report.createdAt,
        };
    }
    async exportReportAsCSV(reportId, userId) {
        const report = await this.getReport(reportId, userId);
        if (!report)
            throw new Error('Report not found');
        const data = JSON.parse(report.reportData);
        let csv = 'Financial Report\n';
        csv += `Period,${report.month}/${report.year}\n`;
        csv += `Report Type,${report.reportType}\n\n`;
        csv += 'Summary\n';
        csv += `Total Income,${data.totalIncome}\n`;
        csv += `Total Expense,${data.totalExpense}\n`;
        csv += `Net Savings,${data.netSavings}\n`;
        if (data.categoryBreakdown) {
            csv += '\nCategory Breakdown\n';
            for (const [category, amount] of Object.entries(data.categoryBreakdown)) {
                csv += `${category},${amount}\n`;
            }
        }
        return csv;
    }
    async getCategoryBreakdown(transactions) {
        const breakdown = {};
        for (const transaction of transactions) {
            if (transaction.type === 'expense') {
                const categoryName = transaction.categoryId;
                breakdown[categoryName] = (breakdown[categoryName] || 0) + Number(transaction.amount);
            }
        }
        return breakdown;
    }
    async getBudgetStatus(userId, month, year) {
        const budgets = await this.budgetRepository.find({
            where: { userId },
        });
        const status = {};
        for (const budget of budgets) {
            status[budget.id] = {
                budgetLimit: budget.amount,
                month: budget.month,
            };
        }
        return status;
    }
    async getTopCategories(transactions, limit) {
        const categorySpending = {};
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
            const categoryId = t.categoryId;
            categorySpending[categoryId] = (categorySpending[categoryId] || 0) + Number(t.amount);
        });
        return Object.entries(categorySpending)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([category, amount]) => ({ category, amount }));
    }
};
exports.FinancialReportsService = FinancialReportsService;
exports.FinancialReportsService = FinancialReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(financial_report_entity_1.FinancialReport)),
    __param(1, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(2, (0, typeorm_1.InjectRepository)(budget_entity_1.Budget)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FinancialReportsService);
//# sourceMappingURL=financial-reports.service.js.map