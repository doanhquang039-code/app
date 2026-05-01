import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Budget } from '../entities/budget.entity';

@Injectable()
export class PredictionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(Budget)
    private budgetRepo: Repository<Budget>,
  ) {}

  // Predict budget overrun
  async predictBudgetOverrun(userId: number, budgetId: number): Promise<any> {
    const budget = await this.budgetRepo.findOne({ where: { id: budgetId } });
    if (!budget) return null;

    const transactions = await this.transactionRepo.find({
      where: {
        userId,
        categoryId: budget.categoryId,
        type: 'expense' as any,
      },
      order: { date: 'DESC' },
      take: 90,
    });

    // Parse budget month
    const [year, month] = budget.month.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const currentSpent = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate >= startDate && tDate <= endDate;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const now = new Date();
    const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = totalDays - daysElapsed;

    const dailyRate = currentSpent / Math.max(daysElapsed, 1);
    const projectedTotal = currentSpent + (dailyRate * daysRemaining);

    return {
      budgetId,
      budgetAmount: budget.amount,
      currentSpent,
      projectedTotal,
      overrunAmount: Math.max(0, projectedTotal - budget.amount),
      overrunProbability: projectedTotal > budget.amount ? Math.min((projectedTotal / budget.amount - 1) * 100, 100) : 0,
      daysRemaining,
      recommendedDailyLimit: Math.max(0, (budget.amount - currentSpent) / Math.max(daysRemaining, 1)),
    };
  }

  // Predict next transaction
  async predictNextTransaction(userId: number): Promise<any> {
    const transactions = await this.transactionRepo.find({
      where: { userId },
      order: { date: 'DESC' },
      take: 100,
    });

    if (transactions.length < 10) {
      return null;
    }

    // Analyze patterns
    const patterns = this.analyzeTransactionPatterns(transactions);
    
    // Find most likely next transaction
    const prediction = this.predictNext(patterns);

    return prediction;
  }

  // Predict savings potential
  async predictSavingsPotential(userId: number): Promise<any> {
    const transactions = await this.transactionRepo.find({
      where: { userId },
      order: { date: 'DESC' },
      take: 180,
    });

    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    // Analyze discretionary spending
    const discretionaryCategories = ['entertainment', 'dining', 'shopping'];
    const discretionarySpending = transactions
      .filter(t => t.type === 'expense' && discretionaryCategories.includes(t.categoryId?.toString() || ''))
      .reduce((sum, t) => sum + t.amount, 0);

    const potentialSavings = discretionarySpending * 0.3; // 30% reduction potential

    return {
      currentIncome: income,
      currentExpenses: expenses,
      currentSavings: income - expenses,
      discretionarySpending,
      potentialSavings,
      projectedSavings: (income - expenses) + potentialSavings,
      savingsRate: ((income - expenses) / income) * 100,
      potentialSavingsRate: (((income - expenses) + potentialSavings) / income) * 100,
    };
  }

  // Predict financial goals achievement
  async predictGoalAchievement(userId: number, goalAmount: number, targetDate: Date): Promise<any> {
    const transactions = await this.transactionRepo.find({
      where: { userId },
      order: { date: 'DESC' },
      take: 90,
    });

    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const monthlySavings = (income - expenses) / 3; // Average over 3 months

    const monthsToGoal = Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30));
    const projectedSavings = monthlySavings * monthsToGoal;

    return {
      goalAmount,
      targetDate,
      monthsToGoal,
      currentMonthlySavings: monthlySavings,
      projectedSavings,
      shortfall: Math.max(0, goalAmount - projectedSavings),
      achievementProbability: Math.min((projectedSavings / goalAmount) * 100, 100),
      requiredMonthlySavings: goalAmount / monthsToGoal,
      recommendation: projectedSavings >= goalAmount 
        ? 'On track to achieve goal'
        : `Need to save additional ${((goalAmount - projectedSavings) / monthsToGoal).toFixed(2)} per month`,
    };
  }

  // Helper methods
  private analyzeTransactionPatterns(transactions: Transaction[]): any {
    const patterns = {
      byCategory: new Map<string, number[]>(),
      byDayOfWeek: new Map<number, number>(),
      byHourOfDay: new Map<number, number>(),
      avgAmount: 0,
    };

    transactions.forEach(t => {
      const category = t.categoryId?.toString() || 'uncategorized';
      if (!patterns.byCategory.has(category)) {
        patterns.byCategory.set(category, []);
      }
      patterns.byCategory.get(category)!.push(t.amount);

      const date = new Date(t.date);
      const day = date.getDay();
      const hour = date.getHours();

      patterns.byDayOfWeek.set(day, (patterns.byDayOfWeek.get(day) || 0) + 1);
      patterns.byHourOfDay.set(hour, (patterns.byHourOfDay.get(hour) || 0) + 1);
    });

    patterns.avgAmount = transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length;

    return patterns;
  }

  private predictNext(patterns: any): any {
    // Find most common category
    let maxCount = 0;
    let mostCommonCategory = '';
    let categoryAmounts: number[] = [];

    patterns.byCategory.forEach((amounts: number[], category: string) => {
      if (amounts.length > maxCount) {
        maxCount = amounts.length;
        mostCommonCategory = category;
        categoryAmounts = amounts;
      }
    });

    // Find most common day and hour
    const mostCommonDay = this.getMaxKey(patterns.byDayOfWeek);
    const mostCommonHour = this.getMaxKey(patterns.byHourOfDay);

    // Predict amount
    const avgAmount = categoryAmounts.reduce((a, b) => a + b, 0) / categoryAmounts.length;

    return {
      category: mostCommonCategory,
      predictedAmount: avgAmount,
      predictedDay: mostCommonDay,
      predictedHour: mostCommonHour,
      confidence: Math.min(maxCount / 10, 1),
    };
  }

  private getMaxKey(map: Map<number, number>): number {
    let maxCount = 0;
    let maxKey = 0;

    map.forEach((count, key) => {
      if (count > maxCount) {
        maxCount = count;
        maxKey = key;
      }
    });

    return maxKey;
  }
}
