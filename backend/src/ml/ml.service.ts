import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';

@Injectable()
export class MLService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
  ) {}

  // Linear Regression for spending prediction
  async predictNextMonthSpending(userId: number): Promise<number> {
    const transactions = await this.transactionRepo.find({
      where: { userId, type: 'expense' as any },
      order: { date: 'DESC' },
      take: 180, // 6 months
    });

    if (transactions.length < 30) {
      return 0; // Not enough data
    }

    // Group by month
    const monthlySpending = this.groupByMonth(transactions);
    
    // Simple linear regression
    const { slope, intercept } = this.linearRegression(monthlySpending);
    
    // Predict next month
    const nextMonth = monthlySpending.length;
    const prediction = slope * nextMonth + intercept;
    
    return Math.max(0, prediction);
  }

  // Time series analysis
  async analyzeSpendingTrend(userId: number, months: number = 12): Promise<any> {
    const transactions = await this.transactionRepo.find({
      where: { userId, type: 'expense' as any },
      order: { date: 'DESC' },
      take: months * 30,
    });

    const monthlyData = this.groupByMonth(transactions);
    
    return {
      trend: this.calculateTrend(monthlyData),
      seasonality: this.detectSeasonality(monthlyData),
      volatility: this.calculateVolatility(monthlyData),
      forecast: this.forecastNextMonths(monthlyData, 3),
    };
  }

  // Clustering for spending patterns
  async identifySpendingPatterns(userId: number): Promise<any[]> {
    const transactions = await this.transactionRepo.find({
      where: { userId },
      order: { date: 'DESC' },
      take: 365,
    });

    // Group by category and time
    const patterns = this.clusterTransactions(transactions);
    
    return patterns.map(pattern => ({
      category: pattern.category,
      avgAmount: pattern.avgAmount,
      frequency: pattern.frequency,
      timeOfDay: pattern.timeOfDay,
      dayOfWeek: pattern.dayOfWeek,
      confidence: pattern.confidence,
    }));
  }

  // Anomaly detection
  async detectAnomalies(userId: number): Promise<any[]> {
    const transactions = await this.transactionRepo.find({
      where: { userId },
      order: { date: 'DESC' },
      take: 90,
    });

    const anomalies: any[] = [];
    const stats = this.calculateStatistics(transactions);

    for (const transaction of transactions) {
      const zScore = (transaction.amount - stats.mean) / stats.stdDev;
      
      if (Math.abs(zScore) > 2.5) { // 2.5 standard deviations
        anomalies.push({
          transaction,
          zScore,
          severity: Math.abs(zScore) > 3 ? 'high' : 'medium',
          reason: `Amount is ${Math.abs(zScore).toFixed(1)} standard deviations from average`,
        });
      }
    }

    return anomalies;
  }

  // Helper methods
  private groupByMonth(transactions: Transaction[]): number[] {
    const monthlyMap = new Map<string, number>();
    
    transactions.forEach(t => {
      const month = new Date(t.date).toISOString().slice(0, 7);
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + t.amount);
    });

    return Array.from(monthlyMap.values()).reverse();
  }

  private linearRegression(data: number[]): { slope: number; intercept: number } {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  private calculateTrend(data: number[]): string {
    if (data.length < 2) return 'insufficient_data';
    
    const { slope } = this.linearRegression(data);
    
    if (slope > 0.05) return 'increasing';
    if (slope < -0.05) return 'decreasing';
    return 'stable';
  }

  private detectSeasonality(data: number[]): any {
    if (data.length < 12) return null;
    
    // Simple seasonality detection
    const quarters = [0, 0, 0, 0];
    data.forEach((value, index) => {
      quarters[index % 4] += value;
    });

    const avgQuarter = quarters.reduce((a, b) => a + b) / 4;
    const seasonalityIndex = quarters.map(q => (q / avgQuarter - 1) * 100);

    return {
      detected: Math.max(...seasonalityIndex.map(Math.abs)) > 20,
      pattern: seasonalityIndex,
    };
  }

  private calculateVolatility(data: number[]): number {
    if (data.length < 2) return 0;
    
    const mean = data.reduce((a, b) => a + b) / data.length;
    const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    
    return (stdDev / mean) * 100; // Coefficient of variation
  }

  private forecastNextMonths(data: number[], months: number): number[] {
    const { slope, intercept } = this.linearRegression(data);
    const forecast: number[] = [];
    
    for (let i = 1; i <= months; i++) {
      const predicted = slope * (data.length + i - 1) + intercept;
      forecast.push(Math.max(0, predicted));
    }
    
    return forecast;
  }

  private clusterTransactions(transactions: Transaction[]): any[] {
    const categoryMap = new Map<string, any>();

    transactions.forEach(t => {
      const category = t.categoryId?.toString() || 'uncategorized';
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          amounts: [],
          hours: [],
          days: [],
        });
      }

      const data = categoryMap.get(category);
      data.amounts.push(t.amount);
      data.hours.push(new Date(t.date).getHours());
      data.days.push(new Date(t.date).getDay());
    });

    return Array.from(categoryMap.values()).map(data => ({
      category: data.category,
      avgAmount: data.amounts.reduce((a: number, b: number) => a + b, 0) / data.amounts.length,
      frequency: data.amounts.length,
      timeOfDay: this.getMostCommon(data.hours),
      dayOfWeek: this.getMostCommon(data.days),
      confidence: Math.min(data.amounts.length / 10, 1),
    }));
  }

  private calculateStatistics(transactions: Transaction[]): any {
    const amounts = transactions.map(t => t.amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);

    return { mean, stdDev, variance };
  }

  private getMostCommon(arr: number[]): number {
    const counts = new Map<number, number>();
    arr.forEach(val => counts.set(val, (counts.get(val) || 0) + 1));
    
    let maxCount = 0;
    let mostCommon = arr[0];
    
    counts.forEach((count, val) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = val;
      }
    });

    return mostCommon;
  }
}
