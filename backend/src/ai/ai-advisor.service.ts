import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
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
  private readonly logger = new Logger(AIAdvisorService.name);
  private openai: OpenAI | null = null;
  private useAI = false;

  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(Budget)
    private budgetRepo: Repository<Budget>,
    @InjectRepository(SavingsGoal)
    private savingsGoalRepo: Repository<SavingsGoal>,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey && apiKey !== 'your-openai-api-key-here') {
      this.openai = new OpenAI({ apiKey });
      this.useAI = true;
      this.logger.log('OpenAI initialized successfully');
    } else {
      this.logger.log('OpenAI API key not configured, using rule-based responses');
    }
  }

  async getFinancialInsights(userId: number): Promise<AIInsight[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const transactions = await this.transactionRepo.find({
      where: {
        userId,
        date: Between(startOfMonth, endOfMonth),
      },
    });

    const insights = [
      ...this.analyzeSpendingPatterns(transactions),
      ...(await this.analyzeBudgets(userId)),
      ...(await this.analyzeSavingsGoals(userId)),
      ...this.predictFutureSpending(transactions),
    ];

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  private analyzeSpendingPatterns(transactions: Transaction[]): AIInsight[] {
    const insights: AIInsight[] = [];
    const expenses = transactions.filter((t) => t.type === 'expense' || t.type === 'EXPENSE');
    const totalSpending = expenses.reduce((sum, t) => sum + Number(t.amount), 0);

    if (totalSpending <= 0) {
      return insights;
    }

    const categorySpending = expenses.reduce(
      (acc, t) => {
        const category = t.categoryId?.toString() || 'khac';
        acc[category] = (acc[category] || 0) + Number(t.amount);
        return acc;
      },
      {} as Record<string, number>,
    );

    const highestCategory = Object.entries(categorySpending).sort(([, a], [, b]) => b - a)[0];
    if (highestCategory && highestCategory[1] > totalSpending * 0.3) {
      insights.push({
        type: 'warning',
        title: 'Chi tiêu cao trong một danh mục',
        message: `Bạn đã chi ${highestCategory[1].toLocaleString('vi-VN')}đ cho danh mục này, chiếm ${((highestCategory[1] / totalSpending) * 100).toFixed(1)}% tổng chi tiêu tháng.`,
        priority: 'high',
        actionable: true,
        action: 'Xem giao dịch',
      });
    }

    const avgDailySpending = totalSpending / Math.max(new Date().getDate(), 1);
    const recentSpending = expenses
      .filter((t) => new Date(t.date) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000))
      .reduce((sum, t) => sum + Number(t.amount), 0);

    if (recentSpending > avgDailySpending * 4.5) {
      insights.push({
        type: 'warning',
        title: 'Chi tiêu tăng đột biến',
        message: 'Chi tiêu 3 ngày gần đây cao hơn đáng kể so với mức trung bình. Bạn nên kiểm tra lại các khoản lớn.',
        priority: 'high',
      });
    }

    if (transactions.length >= 5 && recentSpending <= avgDailySpending * 3) {
      insights.push({
        type: 'achievement',
        title: 'Nhịp chi tiêu ổn định',
        message: 'Các khoản chi gần đây vẫn trong vùng kiểm soát. Tiếp tục ghi chép đều để dự báo chính xác hơn.',
        priority: 'low',
      });
    }

    return insights;
  }

  private async analyzeBudgets(userId: number): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const budgets = await this.budgetRepo.find({ where: { userId } });

    for (const budget of budgets) {
      const spent = await this.transactionRepo
        .createQueryBuilder('t')
        .where('t.userId = :userId', { userId })
        .andWhere('t.categoryId = :categoryId', { categoryId: budget.categoryId })
        .andWhere('(t.type = :expenseLower OR t.type = :expenseUpper)', {
          expenseLower: 'expense',
          expenseUpper: 'EXPENSE',
        })
        .andWhere('t.date >= :startDate', { startDate: startOfMonth })
        .select('SUM(t.amount)', 'total')
        .getRawOne();

      const spentAmount = Number(spent?.total || 0);
      const budgetAmount = Number(budget.amount);
      if (budgetAmount <= 0) continue;

      const percentage = (spentAmount / budgetAmount) * 100;
      if (percentage >= 90) {
        insights.push({
          type: 'warning',
          title: 'Ngân sách sắp vượt',
          message: `Bạn đã dùng ${percentage.toFixed(0)}% ngân sách của danh mục này.`,
          priority: 'high',
          actionable: true,
          action: 'Xem ngân sách',
        });
      } else if (percentage >= 70) {
        insights.push({
          type: 'tip',
          title: 'Cảnh báo ngân sách',
          message: `Bạn đã dùng ${percentage.toFixed(0)}% ngân sách. Hãy hạn chế thêm chi tiêu ở danh mục này.`,
          priority: 'medium',
        });
      }
    }

    return insights;
  }

  private async analyzeSavingsGoals(userId: number): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    const goals = await this.savingsGoalRepo.find({ where: { userId, status: 'active' } });

    for (const goal of goals) {
      const targetAmount = Number(goal.targetAmount);
      if (targetAmount <= 0) continue;

      const currentAmount = Number(goal.currentAmount);
      const progress = (currentAmount / targetAmount) * 100;

      if (progress >= 75) {
        insights.push({
          type: 'achievement',
          title: 'Gần đạt mục tiêu tiết kiệm',
          message: `Bạn đã đạt ${progress.toFixed(0)}% mục tiêu "${goal.name}". Còn ${(targetAmount - currentAmount).toLocaleString('vi-VN')}đ nữa.`,
          priority: 'medium',
          actionable: true,
          action: 'Xem mục tiêu',
        });
      }

      if (goal.targetDate) {
        const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const amountLeft = targetAmount - currentAmount;
        const dailyRequired = amountLeft / Math.max(daysLeft, 1);

        if (dailyRequired > 0 && daysLeft > 0 && daysLeft < 30) {
          insights.push({
            type: 'tip',
            title: 'Cần tăng tốc tiết kiệm',
            message: `Để đạt mục tiêu "${goal.name}", bạn cần tiết kiệm khoảng ${dailyRequired.toLocaleString('vi-VN')}đ mỗi ngày trong ${daysLeft} ngày tới.`,
            priority: 'medium',
          });
        }
      }
    }

    return insights;
  }

  private predictFutureSpending(transactions: Transaction[]): AIInsight[] {
    const expenses = transactions.filter((t) => t.type === 'expense' || t.type === 'EXPENSE');
    if (expenses.length === 0) return [];

    const totalSpending = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    const today = new Date();
    const avgDailySpending = totalSpending / Math.max(today.getDate(), 1);
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysLeft = Math.max(daysInMonth - today.getDate(), 0);
    const predictedTotal = totalSpending + avgDailySpending * daysLeft;

    return [
      {
        type: 'prediction',
        title: 'Dự đoán chi tiêu tháng này',
        message: `Nếu giữ nhịp hiện tại, bạn có thể chi khoảng ${predictedTotal.toLocaleString('vi-VN')}đ trong tháng này.`,
        priority: 'low',
      },
    ];
  }

  async getChatbotResponse(userId: number, message: string): Promise<string> {
    if (this.useAI && this.openai) {
      return this.getAIChatResponse(userId, message);
    }

    return this.getRuleBasedResponse(userId, message);
  }

  private async getAIChatResponse(userId: number, message: string): Promise<string> {
    try {
      if (!this.openai) {
        return this.getRuleBasedResponse(userId, message);
      }

      const context = await this.getUserFinancialContext(userId);
      const systemPrompt = `Bạn là trợ lý tài chính cá nhân trong ứng dụng quản lý chi tiêu.
Trả lời bằng tiếng Việt, ngắn gọn trong 2-3 câu, ưu tiên lời khuyên thực tế.

Thông tin tài chính của người dùng:
${context}`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      return completion.choices[0]?.message?.content || 'Tôi chưa có đủ dữ liệu để trả lời câu hỏi này.';
    } catch (error) {
      this.logger.error('OpenAI API error', error as Error);
      return this.getRuleBasedResponse(userId, message);
    }
  }

  private async getUserFinancialContext(userId: number): Promise<string> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const transactions = await this.transactionRepo.find({
      where: { userId, date: Between(startOfMonth, now) },
      take: 50,
    });

    const totalIncome = transactions
      .filter((t) => t.type === 'income' || t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'expense' || t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const budgets = await this.budgetRepo.find({ where: { userId } });
    const goals = await this.savingsGoalRepo.find({ where: { userId, status: 'active' } });

    return [
      `Tháng này: thu nhập ${totalIncome.toLocaleString('vi-VN')}đ, chi tiêu ${totalExpense.toLocaleString('vi-VN')}đ`,
      `Số giao dịch: ${transactions.length}`,
      `Số ngân sách: ${budgets.length}`,
      `Số mục tiêu tiết kiệm: ${goals.length}`,
      `Tổng mục tiêu tiết kiệm: ${goals.reduce((sum, g) => sum + Number(g.targetAmount), 0).toLocaleString('vi-VN')}đ`,
    ].join('\n');
  }

  private async getRuleBasedResponse(userId: number, message: string): Promise<string> {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('chi tiêu') || lowerMessage.includes('spending')) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const transactions = await this.transactionRepo.find({
        where: { userId, type: 'expense', date: Between(startOfMonth, now) },
      });
      const upperTransactions = await this.transactionRepo.find({
        where: { userId, type: 'EXPENSE', date: Between(startOfMonth, now) },
      });
      const expenses = [...transactions, ...upperTransactions];
      const total = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
      return `Tháng này bạn đã chi ${total.toLocaleString('vi-VN')}đ qua ${expenses.length} giao dịch.`;
    }

    if (lowerMessage.includes('tiết kiệm') || lowerMessage.includes('save')) {
      const goals = await this.savingsGoalRepo.find({ where: { userId, status: 'active' } });
      if (goals.length === 0) {
        return 'Bạn chưa có mục tiêu tiết kiệm nào. Hãy tạo một mục tiêu cụ thể để dễ theo dõi tiến độ.';
      }

      const totalTarget = goals.reduce((sum, g) => sum + Number(g.targetAmount), 0);
      const totalCurrent = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0);
      const percent = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
      return `Bạn có ${goals.length} mục tiêu tiết kiệm với tổng mục tiêu ${totalTarget.toLocaleString('vi-VN')}đ. Hiện đã đạt ${totalCurrent.toLocaleString('vi-VN')}đ (${percent.toFixed(1)}%).`;
    }

    if (lowerMessage.includes('ngân sách') || lowerMessage.includes('budget')) {
      const budgets = await this.budgetRepo.find({ where: { userId } });
      return `Bạn có ${budgets.length} ngân sách đang theo dõi. Hãy kiểm tra các ngân sách đã dùng trên 70% trước khi chi thêm.`;
    }

    if (lowerMessage.includes('phân tích') || lowerMessage.includes('analyze')) {
      const insights = await this.getFinancialInsights(userId);
      if (insights.length === 0) {
        return 'Tài chính của bạn chưa có cảnh báo lớn. Hãy tiếp tục ghi chép giao dịch để hệ thống phân tích chính xác hơn.';
      }
      const topInsight = insights[0];
      return `${topInsight.title}: ${topInsight.message}`;
    }

    return 'Tôi có thể hỗ trợ về chi tiêu, tiết kiệm, ngân sách và phân tích tài chính. Bạn muốn xem phần nào trước?';
  }
}
