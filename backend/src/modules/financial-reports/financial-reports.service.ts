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
    await this.ensureReportsTable();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const monthTransactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select([
        'transaction.id',
        'transaction.userId',
        'transaction.categoryId',
        'transaction.amount',
        'transaction.type',
        'transaction.date',
      ])
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.date >= :startDate', { startDate })
      .andWhere('transaction.date <= :endDate', { endDate })
      .getMany();

    const totalIncome = monthTransactions
      .filter(t => this.isIncome(t.type))
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = monthTransactions
      .filter(t => this.isExpense(t.type))
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
      dailyAverage: monthTransactions.filter(t => this.isExpense(t.type)).length > 0 
        ? totalExpense / monthTransactions.filter(t => this.isExpense(t.type)).length 
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
      savingsRate: totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0,
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
    await this.ensureReportsTable();

    return this.reportRepository.findOne({
      where: { id: reportId, userId },
    });
  }

  async getReportsByUser(userId: number, reportType?: string): Promise<FinancialReport[]> {
    await this.ensureReportsTable();

    const query = this.reportRepository.createQueryBuilder('report')
      .where('report.userId = :userId', { userId });

    if (reportType) {
      query.andWhere('report.reportType = :reportType', { reportType });
    }

    return query.orderBy('report.createdAt', 'DESC').getMany();
  }

  async deleteReport(reportId: number, userId: number): Promise<void> {
    await this.ensureReportsTable();

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
  private async ensureReportsTable(): Promise<void> {
    await this.reportRepository.query(`
      IF OBJECT_ID('dbo.FinancialReports', 'U') IS NULL
      BEGIN
        CREATE TABLE dbo.FinancialReports (
          id INT IDENTITY(1,1) PRIMARY KEY,
          userId INT NOT NULL,
          month INT NOT NULL,
          year INT NOT NULL,
          reportType NVARCHAR(50) NOT NULL,
          reportData NVARCHAR(MAX) NOT NULL,
          totalIncome DECIMAL(18, 2) NOT NULL DEFAULT 0,
          totalExpense DECIMAL(18, 2) NOT NULL DEFAULT 0,
          netSavings DECIMAL(18, 2) NOT NULL DEFAULT 0,
          filePath NVARCHAR(500) NULL,
          status NVARCHAR(50) NOT NULL DEFAULT 'pending',
          createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
        )
      END
    `);
  }

  private isIncome(type: string) {
    return type?.toUpperCase() === 'INCOME';
  }

  private isExpense(type: string) {
    return type?.toUpperCase() === 'EXPENSE';
  }
  private async getCategoryBreakdown(transactions: Transaction[]): Promise<any> {
    const breakdown = {};

    for (const transaction of transactions) {
      if (this.isExpense(transaction.type)) {
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
      .filter(t => this.isExpense(t.type))
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
