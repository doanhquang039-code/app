import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Budget } from '../entities/budget.entity';

@Injectable()
export class RecommendationService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(Budget)
    private budgetRepo: Repository<Budget>,
  ) {}

  async getPersonalizedRecommendations(userId: number): Promise<any[]> {
    const recommendations: any[] = [];

    // Analyze spending patterns
    const spendingRec = await this.getSpendingRecommendations(userId);
    recommendations.push(...spendingRec);

    // Analyze savings potential
    const savingsRec = await this.getSavingsRecommendations(userId);
    recommendations.push(...savingsRec);

    // Analyze budget optimization
    const budgetRec = await this.getBudgetRecommendations(userId);
    recommendations.push(...budgetRec);

    // Sort by priority
    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  private async getSpendingRecommendations(userId: number): Promise<any[]> {
    const transactions = await this.transactionRepo.find({
      where: { userId, type: 'expense' as any },
      order: { date: 'DESC' },
      take: 90,
    });

    const recommendations: any[] = [];

    // Analyze by category
    const categorySpending = this.groupByCategory(transactions);
    
    for (const [category, amount] of categorySpending.entries()) {
      const avgMonthly = amount / 3;
      
      if (category === 'dining' && avgMonthly > 500) {
        recommendations.push({
          type: 'reduce_spending',
          category,
          title: 'Reduce Dining Out',
          message: `You're spending $${avgMonthly.toFixed(2)}/month on dining. Consider cooking at home more often.`,
          potentialSavings: avgMonthly * 0.3,
          priority: 8,
        });
      }

      if (category === 'entertainment' && avgMonthly > 300) {
        recommendations.push({
          type: 'reduce_spending',
          category,
          title: 'Optimize Entertainment',
          message: `Entertainment spending is $${avgMonthly.toFixed(2)}/month. Look for free alternatives.`,
          potentialSavings: avgMonthly * 0.2,
          priority: 6,
        });
      }
    }

    return recommendations;
  }

  private async getSavingsRecommendations(userId: number): Promise<any[]> {
    const transactions = await this.transactionRepo.find({
      where: { userId },
      order: { date: 'DESC' },
      take: 90,
    });

    const recommendations: any[] = [];

    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const savingsRate = ((income - expenses) / income) * 100;

    if (savingsRate < 20) {
      recommendations.push({
        type: 'increase_savings',
        title: 'Increase Savings Rate',
        message: `Your savings rate is ${savingsRate.toFixed(1)}%. Aim for at least 20%.`,
        targetSavingsRate: 20,
        additionalSavingsNeeded: (income * 0.2) - (income - expenses),
        priority: 9,
      });
    }

    // Emergency fund recommendation
    const monthlyExpenses = expenses / 3;
    const recommendedEmergencyFund = monthlyExpenses * 6;

    recommendations.push({
      type: 'emergency_fund',
      title: 'Build Emergency Fund',
      message: `Build an emergency fund of $${recommendedEmergencyFund.toFixed(2)} (6 months of expenses).`,
      targetAmount: recommendedEmergencyFund,
      monthlySavingsNeeded: recommendedEmergencyFund / 12,
      priority: 10,
    });

    return recommendations;
  }

  private async getBudgetRecommendations(userId: number): Promise<any[]> {
    const budgets = await this.budgetRepo.find({ where: { userId } });
    const recommendations: any[] = [];

    for (const budget of budgets) {
      const transactions = await this.transactionRepo.find({
        where: {
          userId,
          categoryId: budget.categoryId,
          type: 'expense' as any,
        },
      });

      // Parse budget month
      const [year, month] = budget.month.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const spent = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return tDate >= startDate && tDate <= endDate;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = (spent / budget.amount) * 100;

      if (percentage > 90) {
        recommendations.push({
          type: 'budget_alert',
          budgetId: budget.id,
          title: 'Budget Almost Exceeded',
          message: `You've used ${percentage.toFixed(1)}% of your budget.`,
          spent,
          remaining: budget.amount - spent,
          priority: 9,
        });
      }

      if (percentage < 50 && spent > 0) {
        recommendations.push({
          type: 'budget_optimization',
          budgetId: budget.id,
          title: 'Budget Underutilized',
          message: `Only ${percentage.toFixed(1)}% of budget used. Consider reallocating.`,
          spent,
          unused: budget.amount - spent,
          priority: 4,
        });
      }
    }

    return recommendations;
  }

  private groupByCategory(transactions: Transaction[]): Map<string, number> {
    const map = new Map<string, number>();
    
    transactions.forEach(t => {
      const category = t.categoryId?.toString() || 'uncategorized';
      map.set(category, (map.get(category) || 0) + t.amount);
    });

    return map;
  }
}
