import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { Budget } from '../../entities/budget.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class AdvancedDashboardService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(Budget)
    private budgetRepo: Repository<Budget>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getAdvancedDashboard(userId: number): Promise<any> {
    const [
      overview,
      spendingTrend,
      categoryBreakdown,
      budgetStatus,
      recentTransactions,
      insights,
    ] = await Promise.all([
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

  private async getOverview(userId: number): Promise<any> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const transactions = await this.transactionRepo.find({
      where: {
        userId,
        date: Between(startOfMonth, endOfMonth),
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

    // Previous month comparison
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const prevTransactions = await this.transactionRepo.find({
      where: {
        userId,
        date: Between(prevMonthStart, prevMonthEnd),
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

  private async getSpendingTrend(userId: number): Promise<any> {
    const months = 6;
    const trend: any[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const transactions = await this.transactionRepo.find({
        where: {
          userId,
          date: Between(startOfMonth, endOfMonth),
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

  private async getCategoryBreakdown(userId: number): Promise<any> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const transactions = await this.transactionRepo.find({
      where: {
        userId,
        type: 'expense' as any,
        date: Between(startOfMonth, now),
      },
    });

    const categoryMap = new Map<string, number>();
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

  private async getBudgetStatus(userId: number): Promise<any> {
    const budgets = await this.budgetRepo.find({ where: { userId } });
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const budgetStatus: any[] = [];

    for (const budget of budgets) {
      if (budget.month !== currentMonth) continue;

      const [year, month] = budget.month.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const transactions = await this.transactionRepo.find({
        where: {
          userId,
          categoryId: budget.categoryId,
          type: 'expense' as any,
          date: Between(startDate, endDate),
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

  private async getRecentTransactions(userId: number, limit: number = 10): Promise<any> {
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

  private async getInsights(userId: number): Promise<any> {
    const insights: any[] = [];

    // Get spending velocity
    const velocity = await this.getSpendingVelocity(userId);
    if (velocity.isHigh) {
      insights.push({
        type: 'warning',
        title: 'High Spending Velocity',
        message: `You're spending ${velocity.dailyRate.toFixed(2)} per day, which is ${velocity.percentageAboveAverage.toFixed(1)}% above your average.`,
        priority: 8,
      });
    }

    // Check budget alerts
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

    // Savings opportunity
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

  private async getSpendingVelocity(userId: number): Promise<any> {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recent = await this.transactionRepo.find({
      where: {
        userId,
        type: 'expense' as any,
        date: Between(last7Days, now),
      },
    });

    const historical = await this.transactionRepo.find({
      where: {
        userId,
        type: 'expense' as any,
        date: Between(last30Days, now),
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

  // Real-time stats
  async getRealTimeStats(userId: number): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTransactions = await this.transactionRepo.find({
      where: {
        userId,
        date: Between(today, new Date()),
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
}
