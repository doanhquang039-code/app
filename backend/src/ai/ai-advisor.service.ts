import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Budget } from '../entities/budget.entity';
import { SavingsGoal } from '../entities/savings-goal.entity';

export interface AIInsight {
  type: 'warning' | 'tip' | 'achievement' | 'prediction';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionable?: boolean;
  action?: string;
}

@Injectable()
export class AIAdvisorService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(Budget)
    private budgetRepo: Repository<Budget>,
    @InjectRepository(SavingsGoal)
    private savingsGoalRepo: Repository<SavingsGoal>,
  ) {}

  async getFinancialInsights(userId: number): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Get user's transactions for analysis
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const transactions = await this.transactionRepo.find({
      where: {
        userId,
        date: Between(startOfMonth, endOfMonth),
      },
    });

    // Analyze spending patterns
    const spendingInsights = this.analyzeSpendingPatterns(transactions);
    insights.push(...spendingInsights);

    // Check budget status
    const budgetInsights = await this.analyzeBudgets(userId);
    insights.push(...budgetInsights);

    // Check savings goals
    const savingsInsights = await this.analyzeSavingsGoals(userId);
    insights.push(...savingsInsights);

    // Predict future spending
    const predictions = this.predictFutureSpending(transactions);
    insights.push(...predictions);

    return insights.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private analyzeSpendingPatterns(transactions: Transaction[]): AIInsight[] {
    const insights: AIInsight[] = [];

    // Calculate total spending
    const totalSpending = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Group by category
    const categorySpending = transactions
      .filter((t) => t.type === 'expense')
      .reduce(
        (acc, t) => {
          const category = t.categoryId || 'other';
          acc[category] = (acc[category] || 0) + Number(t.amount);
          return acc;
        },
        {} as Record<string, number>,
      );

    // Find highest spending category
    const highestCategory = Object.entries(categorySpending).sort(
      ([, a], [, b]) => b - a,
    )[0];

    if (highestCategory && highestCategory[1] > totalSpending * 0.3) {
      insights.push({
        type: 'warning',
        title: 'Chi tiêu cao trong danh mục',
        message: `Bạn đã chi ${highestCategory[1].toLocaleString('vi-VN')}đ cho danh mục này, chiếm ${((highestCategory[1] / totalSpending) * 100).toFixed(1)}% tổng chi tiêu.`,
        priority: 'high',
        actionable: true,
        action: 'Xem chi tiết',
      });
    }

    // Check for unusual spending
    const avgDailySpending = totalSpending / new Date().getDate();
    const recentSpending = transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          new Date(t.date) >
            new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    if (recentSpending > avgDailySpending * 3 * 1.5) {
      insights.push({
        type: 'warning',
        title: 'Chi tiêu tăng đột biến',
        message: `Chi tiêu 3 ngày qua cao hơn 50% so với mức trung bình. Hãy cân nhắc giảm chi tiêu!`,
        priority: 'high',
      });
    }

    // Positive insights
    if (totalSpending < avgDailySpending * 20) {
      insights.push({
        type: 'achievement',
        title: 'Tiết kiệm tốt! 🎉',
        message: `Bạn đang chi tiêu thấp hơn mức trung bình. Tiếp tục duy trì!`,
        priority: 'low',
      });
    }

    return insights;
  }

  private async analyzeBudgets(userId: number): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const budgets = await this.budgetRepo.find({
      where: { userId },
    });

    for (const budget of budgets) {
      const spent = await this.transactionRepo
        .createQueryBuilder('t')
        .where('t.userId = :userId', { userId })
        .andWhere('t.categoryId = :categoryId', {
          categoryId: budget.categoryId,
        })
        .andWhere('t.type = :type', { type: 'expense' })
        .andWhere('t.date >= :startDate', { startDate: startOfMonth })
        .select('SUM(t.amount)', 'total')
        .getRawOne();

      const spentAmount = Number(spent?.total || 0);
      const percentage = (spentAmount / Number(budget.amount)) * 100;

      if (percentage >= 90) {
        insights.push({
          type: 'warning',
          title: 'Ngân sách sắp vượt!',
          message: `Bạn đã dùng ${percentage.toFixed(0)}% ngân sách cho danh mục này.`,
          priority: 'high',
          actionable: true,
          action: 'Xem ngân sách',
        });
      } else if (percentage >= 70) {
        insights.push({
          type: 'tip',
          title: 'Cảnh báo ngân sách',
          message: `Đã dùng ${percentage.toFixed(0)}% ngân sách. Hãy cân nhắc chi tiêu!`,
          priority: 'medium',
        });
      }
    }

    return insights;
  }

  private async analyzeSavingsGoals(userId: number): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    const goals = await this.savingsGoalRepo.find({
      where: { userId, status: 'active' },
    });

    for (const goal of goals) {
      const progress =
        (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;

      if (progress >= 75) {
        insights.push({
          type: 'achievement',
          title: 'Gần đạt mục tiêu! 🎯',
          message: `Bạn đã đạt ${progress.toFixed(0)}% mục tiêu "${goal.name}". Còn ${(Number(goal.targetAmount) - Number(goal.currentAmount)).toLocaleString('vi-VN')}đ nữa!`,
          priority: 'medium',
          actionable: true,
          action: 'Xem mục tiêu',
        });
      }

      // Check if goal is behind schedule
      if (goal.targetDate) {
        const daysLeft = Math.ceil(
          (new Date(goal.targetDate).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        );
        const amountLeft = Number(goal.targetAmount) - Number(goal.currentAmount);
        const dailyRequired = amountLeft / daysLeft;

        if (dailyRequired > 0 && daysLeft > 0 && daysLeft < 30) {
          insights.push({
            type: 'tip',
            title: 'Tăng tốc tiết kiệm',
            message: `Để đạt mục tiêu "${goal.name}", bạn cần tiết kiệm ${dailyRequired.toLocaleString('vi-VN')}đ/ngày trong ${daysLeft} ngày tới.`,
            priority: 'medium',
          });
        }
      }
    }

    return insights;
  }

  private predictFutureSpending(transactions: Transaction[]): AIInsight[] {
    const insights: AIInsight[] = [];

    // Calculate average daily spending
    const expenses = transactions.filter((t) => t.type === 'expense');
    if (expenses.length === 0) return insights;

    const totalSpending = expenses.reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );
    const avgDailySpending = totalSpending / new Date().getDate();

    // Predict end of month spending
    const daysInMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0,
    ).getDate();
    const daysLeft = daysInMonth - new Date().getDate();
    const predictedTotal = totalSpending + avgDailySpending * daysLeft;

    insights.push({
      type: 'prediction',
      title: 'Dự đoán chi tiêu tháng này',
      message: `Dựa trên xu hướng hiện tại, bạn sẽ chi khoảng ${predictedTotal.toLocaleString('vi-VN')}đ trong tháng này.`,
      priority: 'low',
    });

    return insights;
  }

  async getChatbotResponse(userId: number, message: string): Promise<string> {
    const lowerMessage = message.toLowerCase();

    // Simple rule-based chatbot (can be replaced with real AI later)
    if (
      lowerMessage.includes('chi tiêu') ||
      lowerMessage.includes('spending')
    ) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const transactions = await this.transactionRepo.find({
        where: {
          userId,
          type: 'expense',
          date: Between(startOfMonth, now),
        },
      });

      const total = transactions.reduce(
        (sum, t) => sum + Number(t.amount),
        0,
      );
      return `Tháng này bạn đã chi ${total.toLocaleString('vi-VN')}đ qua ${transactions.length} giao dịch.`;
    }

    if (lowerMessage.includes('tiết kiệm') || lowerMessage.includes('save')) {
      const goals = await this.savingsGoalRepo.find({
        where: { userId, status: 'active' },
      });

      if (goals.length === 0) {
        return 'Bạn chưa có mục tiêu tiết kiệm nào. Hãy tạo mục tiêu để bắt đầu!';
      }

      const totalTarget = goals.reduce(
        (sum, g) => sum + Number(g.targetAmount),
        0,
      );
      const totalCurrent = goals.reduce(
        (sum, g) => sum + Number(g.currentAmount),
        0,
      );
      return `Bạn có ${goals.length} mục tiêu tiết kiệm với tổng ${totalTarget.toLocaleString('vi-VN')}đ. Đã đạt ${totalCurrent.toLocaleString('vi-VN')}đ (${((totalCurrent / totalTarget) * 100).toFixed(1)}%).`;
    }

    if (lowerMessage.includes('ngân sách') || lowerMessage.includes('budget')) {
      const budgets = await this.budgetRepo.find({ where: { userId } });
      return `Bạn có ${budgets.length} ngân sách đang hoạt động. Sử dụng lệnh "xem ngân sách" để biết chi tiết.`;
    }

    // Default response
    return 'Tôi có thể giúp bạn về: chi tiêu, tiết kiệm, ngân sách, và phân tích tài chính. Bạn muốn biết gì?';
  }
}
