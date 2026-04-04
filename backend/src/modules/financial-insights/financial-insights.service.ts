import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { Category } from '../../entities/category.entity';

@Injectable()
export class FinancialInsightsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  /**
   * Get spending analysis by category
   */
  async getSpendingByCategory(userId: number, month?: string) {
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

    const byCategory: { [key: string]: number } = {};
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
        amount: amount as number,
        percentage: Math.round((amount as number / totalSpent) * 100),
      })),
    };
  }

  /**
   * Get monthly trend analysis
   */
  async getMonthlyTrend(userId: number, months: number = 6) {
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
        return (
          tDate.getFullYear() === date.getFullYear() &&
          tDate.getMonth() === date.getMonth()
        );
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

  /**
   * Get financial recommendations
   */
  async getRecommendations(userId: number) {
    const recommendations: Array<{
      type: string;
      title: string;
      description: string;
      priority: string;
    }> = [];
    const lastMonth = this.getLastMonthString();

    // 1. High spending category analysis
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

    // 2. Income vs Expense ratio
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

    // 3. Savings potential
    if (lastMonthData && lastMonthData.net > 0) {
      recommendations.push({
        type: 'success',
        title: 'Bạn có dư tiền tiết kiệm',
        description: `Tháng này bạn tiết kiệm ${this.formatCurrency(lastMonthData.net)}. Hãy thêm vào mục tiêu tiết kiệm!`,
        priority: 'medium',
      });
    }

    // 4. No income warning
    if (lastMonthData && lastMonthData.income === 0) {
      recommendations.push({
        type: 'info',
        title: 'Chưa có doanh thu',
        description: 'Bạn chưa ghi nhận bất kỳ khoản thu nhập nào tháng này.',
        priority: 'low',
      });
    }

    // 5. Spending consistency
    const trendEntries = Object.entries(monthlyTrend).sort() as Array<[
      string,
      { income: number; expense: number; net: number },
    ]>;
    
    if (trendEntries.length >= 3) {
      const lastThreeMonths = trendEntries.slice(-3);
      const avgExpense =
        lastThreeMonths.reduce((sum, [_, data]) => sum + (data.expense as number), 0) / 3;
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
        return (priorityMap[a.priority as keyof typeof priorityMap] || 3) - (priorityMap[b.priority as keyof typeof priorityMap] || 3);
      }),
    };
  }

  /**
   * Get spending forecast
   */
  async getSpendingForecast(userId: number, months: number = 3) {
    const trends = await this.getMonthlyTrend(userId, 6);
    const trendValues = Object.values(trends) as Array<{
      income: number;
      expense: number;
      net: number;
    }>;

    // Calculate average spending from last 3 months
    const lastThreeMonths = trendValues.slice(-3);
    const avgExpense =
      lastThreeMonths.reduce((sum, t) => sum + (t.expense as number), 0) / 3;
    const avgIncome =
      lastThreeMonths.reduce((sum, t) => sum + (t.income as number), 0) / 3;

    const forecast: Array<{
      month: string;
      projectedIncome: number;
      projectedExpense: number;
      projectedNet: number;
    }> = [];
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

  /**
   * Get financial summary
   */
  async getFinancialSummary(userId: number) {
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
      return (
        tDate.getFullYear() === parseInt(year) &&
        tDate.getMonth() === parseInt(month) - 1
      );
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
        savingsRate:
          lastMonthIncome > 0
            ? Math.round(((lastMonthIncome - lastMonthExpense) / lastMonthIncome) * 100)
            : 0,
      },
    };
  }

  // Helper methods
  private getLastMonthString(): string {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}
