import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { SpendingPattern } from '../../entities/spending-pattern.entity';
import { AIPrediction } from '../../entities/ai-prediction.entity';
import { SpendingAnomaly } from '../../entities/spending-anomaly.entity';
import { Transaction } from '../../entities/transaction.entity';

@Injectable()
export class AIAnalysisService {
  constructor(
    @InjectRepository(SpendingPattern)
    private patternRepo: Repository<SpendingPattern>,
    @InjectRepository(AIPrediction)
    private predictionRepo: Repository<AIPrediction>,
    @InjectRepository(SpendingAnomaly)
    private anomalyRepo: Repository<SpendingAnomaly>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
  ) {}

  // ========== PATTERN DETECTION ==========

  // Analyze spending patterns
  async analyzeSpendingPatterns(userId: number, months: number = 6): Promise<SpendingPattern[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = await this.transactionRepo.find({
      where: {
        userId,
        date: MoreThan(startDate),
        type: 'EXPENSE',
      },
      relations: ['category'],
      order: { date: 'ASC' },
    });

    const patterns: SpendingPattern[] = [];

    // Group by category
    const categoryGroups = this.groupByCategory(transactions);

    for (const [category, txns] of Object.entries(categoryGroups)) {
      // Detect recurring patterns
      const recurringPattern = this.detectRecurringPattern(txns);
      if (recurringPattern) {
        const pattern = this.patternRepo.create({
          userId,
          patternType: 'RECURRING',
          category,
          ...recurringPattern,
          periodStart: startDate,
          periodEnd: new Date(),
          isActive: true,
        });
        patterns.push(await this.patternRepo.save(pattern));
      }

      // Detect seasonal patterns
      const seasonalPattern = this.detectSeasonalPattern(txns);
      if (seasonalPattern) {
        const pattern = this.patternRepo.create({
          userId,
          patternType: 'SEASONAL',
          category,
          ...seasonalPattern,
          periodStart: startDate,
          periodEnd: new Date(),
          isActive: true,
        });
        patterns.push(await this.patternRepo.save(pattern));
      }

      // Detect trends
      const trendPattern = this.detectTrend(txns);
      if (trendPattern) {
        const pattern = this.patternRepo.create({
          userId,
          patternType: 'TREND',
          category,
          ...trendPattern,
          periodStart: startDate,
          periodEnd: new Date(),
          isActive: true,
        });
        patterns.push(await this.patternRepo.save(pattern));
      }
    }

    return patterns;
  }

  // Group transactions by category
  private groupByCategory(transactions: Transaction[]): Record<string, Transaction[]> {
    return transactions.reduce((groups, txn) => {
      const category = txn.category?.name || 'Uncategorized';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(txn);
      return groups;
    }, {} as Record<string, Transaction[]>);
  }

  // Detect recurring pattern
  private detectRecurringPattern(transactions: Transaction[]): any {
    if (transactions.length < 3) return null;

    const amounts = transactions.map(t => parseFloat(t.amount.toString()));
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const minAmount = Math.min(...amounts);
    const maxAmount = Math.max(...amounts);

    // Calculate frequency (transactions per month)
    const monthSpan = this.getMonthSpan(transactions);
    const frequency = Math.round(transactions.length / monthSpan);

    // Check if amounts are consistent (within 20% variance)
    const variance = (maxAmount - minAmount) / avgAmount;
    if (variance > 0.3) return null; // Too much variance

    // Detect time pattern
    const timePattern = this.detectTimePattern(transactions);

    const insights = {
      message: `Chi tiêu định kỳ ${frequency} lần/tháng`,
      averageAmount: avgAmount,
      consistency: Math.round((1 - variance) * 100),
      nextExpectedDate: this.predictNextDate(transactions, timePattern),
    };

    return {
      averageAmount: avgAmount,
      minAmount,
      maxAmount,
      frequency,
      timePattern: timePattern.pattern,
      dayOfWeek: timePattern.dayOfWeek,
      dayOfMonth: timePattern.dayOfMonth,
      confidence: Math.min(95, 60 + (transactions.length * 5)),
      insights: JSON.stringify(insights),
      occurrences: transactions.length,
    };
  }

  // Detect seasonal pattern
  private detectSeasonalPattern(transactions: Transaction[]): any {
    if (transactions.length < 6) return null;

    const monthlyData = this.groupByMonth(transactions);
    const months = Object.keys(monthlyData);

    if (months.length < 3) return null;

    // Calculate monthly averages
    const monthlyAverages = months.map(month => {
      const txns = monthlyData[month];
      const total = txns.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
      return total / txns.length;
    });

    // Detect if there's a seasonal pattern (variance > 30%)
    const avgOfAverages = monthlyAverages.reduce((a, b) => a + b, 0) / monthlyAverages.length;
    const maxAvg = Math.max(...monthlyAverages);
    const minAvg = Math.min(...monthlyAverages);
    const seasonalVariance = (maxAvg - minAvg) / avgOfAverages;

    if (seasonalVariance < 0.3) return null; // Not seasonal enough

    const insights = {
      message: 'Phát hiện mẫu chi tiêu theo mùa',
      peakMonth: this.findPeakMonth(monthlyData),
      lowMonth: this.findLowMonth(monthlyData),
      seasonalVariance: Math.round(seasonalVariance * 100),
    };

    return {
      averageAmount: avgOfAverages,
      minAmount: minAvg,
      maxAmount: maxAvg,
      frequency: Math.round(transactions.length / months.length),
      timePattern: 'SEASONAL',
      confidence: Math.min(90, 50 + (months.length * 10)),
      insights: JSON.stringify(insights),
      occurrences: transactions.length,
    };
  }

  // Detect trend
  private detectTrend(transactions: Transaction[]): any {
    if (transactions.length < 4) return null;

    const amounts = transactions.map(t => parseFloat(t.amount.toString()));
    
    // Simple linear regression
    const n = amounts.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = amounts.reduce((a, b) => a + b, 0);
    const sumXY = amounts.reduce((sum, y, i) => sum + (i + 1) * y, 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgAmount = sumY / n;

    // Only consider significant trends (>5% change per transaction)
    const trendPercentage = (slope / avgAmount) * 100;
    if (Math.abs(trendPercentage) < 5) return null;

    const trendDirection = slope > 0 ? 'INCREASING' : 'DECREASING';

    const insights = {
      message: `Chi tiêu ${trendDirection === 'INCREASING' ? 'tăng' : 'giảm'} dần`,
      trendPercentage: Math.round(Math.abs(trendPercentage)),
      direction: trendDirection,
      projection: this.projectTrend(amounts, slope, 3), // 3 months ahead
    };

    return {
      averageAmount: avgAmount,
      minAmount: Math.min(...amounts),
      maxAmount: Math.max(...amounts),
      frequency: Math.round(transactions.length / this.getMonthSpan(transactions)),
      timePattern: 'TREND',
      confidence: Math.min(85, 40 + (transactions.length * 8)),
      insights: JSON.stringify(insights),
      occurrences: transactions.length,
    };
  }

  // Helper: Detect time pattern
  private detectTimePattern(transactions: Transaction[]): any {
    const dates = transactions.map(t => new Date(t.date));
    
    // Check for weekly pattern
    const daysOfWeek = dates.map(d => d.getDay());
    const mostCommonDay = this.findMostCommon(daysOfWeek);
    const dayFrequency = daysOfWeek.filter(d => d === mostCommonDay).length / daysOfWeek.length;

    if (dayFrequency > 0.6) {
      return { pattern: 'WEEKLY', dayOfWeek: mostCommonDay, dayOfMonth: null };
    }

    // Check for monthly pattern
    const daysOfMonth = dates.map(d => d.getDate());
    const mostCommonDate = this.findMostCommon(daysOfMonth);
    const dateFrequency = daysOfMonth.filter(d => Math.abs(d - mostCommonDate) <= 2).length / daysOfMonth.length;

    if (dateFrequency > 0.6) {
      return { pattern: 'MONTHLY', dayOfWeek: null, dayOfMonth: mostCommonDate };
    }

    return { pattern: 'IRREGULAR', dayOfWeek: null, dayOfMonth: null };
  }

  // Helper: Find most common value
  private findMostCommon(arr: number[]): number {
    const counts = arr.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return parseInt(Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b));
  }

  // Helper: Get month span
  private getMonthSpan(transactions: Transaction[]): number {
    if (transactions.length === 0) return 1;
    const dates = transactions.map(t => new Date(t.date));
    const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
    const latest = new Date(Math.max(...dates.map(d => d.getTime())));
    return Math.max(1, Math.round((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  }

  // Helper: Group by month
  private groupByMonth(transactions: Transaction[]): Record<string, Transaction[]> {
    return transactions.reduce((groups, txn) => {
      const date = new Date(txn.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(txn);
      return groups;
    }, {} as Record<string, Transaction[]>);
  }

  // Helper: Find peak month
  private findPeakMonth(monthlyData: Record<string, Transaction[]>): string {
    let maxTotal = 0;
    let peakMonth = '';

    for (const [month, txns] of Object.entries(monthlyData)) {
      const total = txns.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
      if (total > maxTotal) {
        maxTotal = total;
        peakMonth = month;
      }
    }

    return peakMonth;
  }

  // Helper: Find low month
  private findLowMonth(monthlyData: Record<string, Transaction[]>): string {
    let minTotal = Infinity;
    let lowMonth = '';

    for (const [month, txns] of Object.entries(monthlyData)) {
      const total = txns.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
      if (total < minTotal) {
        minTotal = total;
        lowMonth = month;
      }
    }

    return lowMonth;
  }

  // Helper: Predict next date
  private predictNextDate(transactions: Transaction[], timePattern: any): Date {
    const lastDate = new Date(Math.max(...transactions.map(t => new Date(t.date).getTime())));
    const nextDate = new Date(lastDate);

    if (timePattern.pattern === 'WEEKLY') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (timePattern.pattern === 'MONTHLY') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else {
      nextDate.setDate(nextDate.getDate() + 30);
    }

    return nextDate;
  }

  // Helper: Project trend
  private projectTrend(amounts: number[], slope: number, months: number): number[] {
    const lastAmount = amounts[amounts.length - 1];
    const projection: number[] = [];

    for (let i = 1; i <= months; i++) {
      projection.push(Math.max(0, lastAmount + (slope * i)));
    }

    return projection;
  }

  // ========== ANOMALY DETECTION ==========

  // Detect spending anomalies
  async detectAnomalies(userId: number): Promise<SpendingAnomaly[]> {
    const recentTransactions = await this.transactionRepo.find({
      where: {
        userId,
        type: 'EXPENSE',
        date: MoreThan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // Last 30 days
      },
      relations: ['category'],
      order: { date: 'DESC' },
    });

    const historicalTransactions = await this.transactionRepo.find({
      where: {
        userId,
        type: 'EXPENSE',
        date: Between(
          new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        ),
      },
      relations: ['category'],
    });

    const anomalies: SpendingAnomaly[] = [];

    for (const txn of recentTransactions) {
      const category = txn.category?.name || 'Uncategorized';
      const historicalInCategory = historicalTransactions.filter(
        t => (t.category?.name || 'Uncategorized') === category,
      );

      if (historicalInCategory.length < 3) continue;

      const amounts = historicalInCategory.map(t => parseFloat(t.amount.toString()));
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const stdDev = this.calculateStdDev(amounts, avgAmount);

      const txnAmount = parseFloat(txn.amount.toString());
      const deviation = Math.abs(txnAmount - avgAmount);
      const deviationPercentage = (deviation / avgAmount) * 100;

      // Anomaly if > 2 standard deviations or > 50% deviation
      if (deviation > 2 * stdDev || deviationPercentage > 50) {
        const severity = this.calculateSeverity(deviationPercentage);

        const analysis = {
          historicalAverage: avgAmount,
          standardDeviation: stdDev,
          deviationInStdDev: deviation / stdDev,
          comparisonPeriod: '6 months',
          recommendation: this.getAnomalyRecommendation(severity, category, txnAmount, avgAmount),
        };

        const anomaly = this.anomalyRepo.create({
          userId,
          transactionId: txn.id,
          anomalyType: 'UNUSUAL_AMOUNT',
          severity,
          amount: txnAmount,
          expectedAmount: avgAmount,
          deviationPercentage,
          category,
          description: `Chi tiêu ${category} cao hơn ${Math.round(deviationPercentage)}% so với trung bình`,
          analysis: JSON.stringify(analysis),
          status: 'UNREVIEWED',
          isNotified: false,
        });

        anomalies.push(await this.anomalyRepo.save(anomaly));
      }
    }

    return anomalies;
  }

  // Calculate standard deviation
  private calculateStdDev(values: number[], mean: number): number {
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  // Calculate severity
  private calculateSeverity(deviationPercentage: number): string {
    if (deviationPercentage > 200) return 'CRITICAL';
    if (deviationPercentage > 100) return 'HIGH';
    if (deviationPercentage > 50) return 'MEDIUM';
    return 'LOW';
  }

  // Get anomaly recommendation
  private getAnomalyRecommendation(severity: string, category: string, amount: number, avgAmount: number): string {
    if (severity === 'CRITICAL') {
      return `Chi tiêu ${category} cao bất thường. Kiểm tra lại giao dịch và xem xét điều chỉnh ngân sách.`;
    } else if (severity === 'HIGH') {
      return `Chi tiêu ${category} cao hơn bình thường. Cân nhắc giảm chi tiêu trong thời gian tới.`;
    } else {
      return `Chi tiêu ${category} hơi cao. Theo dõi để đảm bảo không vượt ngân sách.`;
    }
  }

  // ========== PREDICTIONS ==========

  // Generate spending predictions
  async generatePredictions(userId: number): Promise<AIPrediction[]> {
    const patterns = await this.patternRepo.find({
      where: { userId, isActive: true },
    });

    const predictions: AIPrediction[] = [];

    for (const pattern of patterns) {
      const insights = JSON.parse(pattern.insights);
      
      // Predict next month spending
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + 1);

      let predictedAmount = pattern.averageAmount;
      let confidence = pattern.confidence;

      // Adjust based on trend
      if (pattern.patternType === 'TREND') {
        const trendData = insights.projection;
        if (trendData && trendData.length > 0) {
          predictedAmount = trendData[0];
        }
      }

      const factors = {
        historicalAverage: pattern.averageAmount,
        frequency: pattern.frequency,
        patternType: pattern.patternType,
        recentTrend: insights.direction || 'STABLE',
      };

      const recommendations = this.generateRecommendations(pattern, predictedAmount);

      const prediction = this.predictionRepo.create({
        userId,
        predictionType: 'SPENDING',
        category: pattern.category,
        targetDate,
        predictedAmount,
        confidence,
        factors: JSON.stringify(factors),
        recommendations: JSON.stringify(recommendations),
        status: 'PENDING',
        isNotified: false,
      });

      predictions.push(await this.predictionRepo.save(prediction));
    }

    return predictions;
  }

  // Generate recommendations
  private generateRecommendations(pattern: SpendingPattern, predictedAmount: number): any[] {
    const recommendations = [];

    if (pattern.patternType === 'TREND') {
      const insights = JSON.parse(pattern.insights);
      if (insights.direction === 'INCREASING') {
        recommendations.push({
          type: 'WARNING',
          message: `Chi tiêu ${pattern.category} đang tăng dần. Cân nhắc đặt giới hạn ngân sách.`,
          priority: 'HIGH',
        });
      }
    }

    if (pattern.patternType === 'RECURRING') {
      recommendations.push({
        type: 'INFO',
        message: `Dự kiến chi tiêu ${pattern.category}: ${Math.round(predictedAmount).toLocaleString()}đ`,
        priority: 'MEDIUM',
      });
    }

    return recommendations;
  }

  // Get user patterns
  async getUserPatterns(userId: number): Promise<SpendingPattern[]> {
    return await this.patternRepo.find({
      where: { userId, isActive: true },
      order: { confidence: 'DESC' },
    });
  }

  // Get user anomalies
  async getUserAnomalies(userId: number, status?: string): Promise<SpendingAnomaly[]> {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    return await this.anomalyRepo.find({
      where,
      relations: ['transaction'],
      order: { detectedAt: 'DESC' },
      take: 50,
    });
  }

  // Get user predictions
  async getUserPredictions(userId: number): Promise<AIPrediction[]> {
    return await this.predictionRepo.find({
      where: { userId, status: 'PENDING' },
      order: { targetDate: 'ASC' },
    });
  }

  // Update anomaly status
  async updateAnomalyStatus(userId: number, anomalyId: number, status: string, note?: string): Promise<SpendingAnomaly> {
    const anomaly = await this.anomalyRepo.findOne({
      where: { id: anomalyId, userId },
    });

    if (!anomaly) {
      throw new Error('Anomaly not found');
    }

    anomaly.status = status;
    anomaly.reviewedAt = new Date();
    if (note) {
      anomaly.userNote = note;
    }

    return await this.anomalyRepo.save(anomaly);
  }
}
