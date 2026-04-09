import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsData, SpendingForecast } from '../../entities/analytics.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Category } from '../../entities/category.entity';
import { CreateAnalyticsDto, CreateForecastDto } from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsData)
    private analyticsRepository: Repository<AnalyticsData>,
    @InjectRepository(SpendingForecast)
    private forecastRepository: Repository<SpendingForecast>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  // Daily Analytics
  async generateDailyAnalytics(userId: number, date: Date): Promise<AnalyticsData> {
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

  // Weekly Analytics
  async generateWeeklyAnalytics(userId: number, startDate: Date): Promise<AnalyticsData> {
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

  // Monthly Analytics
  async generateMonthlyAnalytics(userId: number, month: number, year: number): Promise<AnalyticsData> {
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

  // Get Historical Analytics
  async getAnalyticsRange(userId: number, startDate: Date, endDate: Date, period: string): Promise<AnalyticsData[]> {
    return this.analyticsRepository.find({
      where: {
        userId,
        period,
      },
      order: { date: 'ASC' },
    });
  }

  // Get Analytics Comparison
  async compareMonths(userId: number, currentMonth: number, currentYear: number, previousMonth: number, previousYear: number) {
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

  // Spending Forecast
  async createForecast(userId: number, createForecastDto: CreateForecastDto): Promise<SpendingForecast> {
    const forecast = this.forecastRepository.create({
      ...createForecastDto,
      userId,
    });
    return this.forecastRepository.save(forecast);
  }

  async getForecastsForMonth(userId: number, month: number, year: number): Promise<SpendingForecast[]> {
    return this.forecastRepository.find({
      where: { userId, month, year },
    });
  }

  async updateForecastWithActual(id: number, userId: number, actualAmount: number): Promise<SpendingForecast | null> {
    await this.forecastRepository.update(
      { id, userId },
      { actualAmount },
    );
    return this.forecastRepository.findOne({ where: { id, userId } });
  }

  // Helper methods
  private async getCategoryBreakdown(userId: number, transactions: Transaction[]): Promise<any> {
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

  private async calculateDailyTrends(transactions: Transaction[]): Promise<any> {
    const trends = {};

    transactions.forEach(t => {
      const date = new Date(t.date).toISOString().split('T')[0];
      if (!trends[date]) {
        trends[date] = { income: 0, expense: 0 };
      }

      if (t.type === 'income') {
        trends[date].income += Number(t.amount);
      } else {
        trends[date].expense += Number(t.amount);
      }
    });

    return trends;
  }

  async getSpendingTrend(userId: number, days: number = 30): Promise<any> {
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

  async getPredictedMonthlyExpense(userId: number): Promise<number> {
    const forecasts = await this.forecastRepository.find({
      where: { userId },
    });

    const totalPredicted = forecasts.reduce((sum, f) => sum + Number(f.predictedAmount), 0);
    return totalPredicted;
  }
}
