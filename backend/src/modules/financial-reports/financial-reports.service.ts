import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialReport } from '../../entities/financial-report.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Budget } from '../../entities/budget.entity';
import { CreateReportDto } from './dto/financial-report.dto';

@Injectable()
export class FinancialReportsService {
  constructor(
    @InjectRepository(FinancialReport)
    private reportRepository: Repository<FinancialReport>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
  ) {}

  async generateMonthlyReport(userId: number, month: number, year: number): Promise<FinancialReport> {
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

  async generateQuarterlyReport(userId: number, quarter: number, year: number): Promise<FinancialReport> {
    const months = {
      1: [1, 2, 3],
      2: [4, 5, 6],
      3: [7, 8, 9],
      4: [10, 11, 12],
    };

    const quarterMonths = months[quarter];
    const reports: FinancialReport[] = [];

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

  async generateYearlyReport(userId: number, year: number): Promise<FinancialReport> {
    const reports: FinancialReport[] = [];

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

  async getReport(reportId: number, userId: number): Promise<FinancialReport | null> {
    return this.reportRepository.findOne({
      where: { id: reportId, userId },
    });
  }

  async getReportsByUser(userId: number, reportType?: string): Promise<FinancialReport[]> {
    const query = this.reportRepository.createQueryBuilder('report')
      .where('report.userId = :userId', { userId });

    if (reportType) {
      query.andWhere('report.reportType = :reportType', { reportType });
    }

    return query.orderBy('report.createdAt', 'DESC').getMany();
  }

  async deleteReport(reportId: number, userId: number): Promise<void> {
    await this.reportRepository.delete({ id: reportId, userId });
  }

  async exportReportAsJSON(reportId: number, userId: number): Promise<any> {
    const report = await this.getReport(reportId, userId);
    if (!report) throw new Error('Report not found');

    return {
      id: report.id,
      period: `${report.month}/${report.year}`,
      reportType: report.reportType,
      ...JSON.parse(report.reportData),
      generatedAt: report.createdAt,
    };
  }

  async exportReportAsCSV(reportId: number, userId: number): Promise<string> {
    const report = await this.getReport(reportId, userId);
    if (!report) throw new Error('Report not found');

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

  // Helper methods
  private async getCategoryBreakdown(transactions: Transaction[]): Promise<any> {
    const breakdown = {};

    for (const transaction of transactions) {
      if (transaction.type === 'expense') {
        const categoryName = transaction.categoryId;
        breakdown[categoryName] = (breakdown[categoryName] || 0) + Number(transaction.amount);
      }
    }

    return breakdown;
  }

  private async getBudgetStatus(userId: number, month: number, year: number): Promise<any> {
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

  private async getTopCategories(transactions: Transaction[], limit: number): Promise<any> {
    const categorySpending = {};

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const categoryId = t.categoryId;
        categorySpending[categoryId] = (categorySpending[categoryId] || 0) + Number(t.amount);
      });

    return Object.entries(categorySpending)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, limit)
      .map(([category, amount]) => ({ category, amount }));
  }
}
