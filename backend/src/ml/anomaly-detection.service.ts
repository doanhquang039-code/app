import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';

@Injectable()
export class AnomalyDetectionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
  ) {}

  async detectFraudulentTransactions(userId: number): Promise<any[]> {
    const transactions = await this.transactionRepo.find({
      where: { userId },
      order: { date: 'DESC' },
      take: 100,
    });

    const fraudulent: any[] = [];

    for (const transaction of transactions) {
      const score = await this.calculateFraudScore(transaction, transactions);
      
      if (score > 0.7) {
        fraudulent.push({
          transaction,
          fraudScore: score,
          reasons: this.getFraudReasons(transaction, transactions),
          recommendation: 'Review this transaction',
        });
      }
    }

    return fraudulent;
  }

  async detectUnusualSpending(userId: number): Promise<any[]> {
    const transactions = await this.transactionRepo.find({
      where: { userId, type: 'expense' as any },
      order: { date: 'DESC' },
      take: 90,
    });

    const unusual: any[] = [];
    const stats = this.calculateStats(transactions);

    for (const transaction of transactions) {
      const zScore = (transaction.amount - stats.mean) / stats.stdDev;
      
      if (Math.abs(zScore) > 2) {
        unusual.push({
          transaction,
          deviation: zScore,
          severity: Math.abs(zScore) > 3 ? 'high' : 'medium',
          message: `${Math.abs(zScore).toFixed(1)}x higher than average`,
        });
      }
    }

    return unusual;
  }

  async detectDuplicateTransactions(userId: number): Promise<any[]> {
    const transactions = await this.transactionRepo.find({
      where: { userId },
      order: { date: 'DESC' },
      take: 100,
    });

    const duplicates: any[] = [];

    for (let i = 0; i < transactions.length; i++) {
      for (let j = i + 1; j < transactions.length; j++) {
        if (this.areSimilar(transactions[i], transactions[j])) {
          duplicates.push({
            transaction1: transactions[i],
            transaction2: transactions[j],
            similarity: this.calculateSimilarity(transactions[i], transactions[j]),
            recommendation: 'Possible duplicate',
          });
        }
      }
    }

    return duplicates;
  }

  private async calculateFraudScore(transaction: Transaction, allTransactions: Transaction[]): Promise<number> {
    let score = 0;

    // Check amount anomaly
    const stats = this.calculateStats(allTransactions);
    const zScore = Math.abs((transaction.amount - stats.mean) / stats.stdDev);
    if (zScore > 3) score += 0.3;

    // Check time anomaly
    const hour = new Date(transaction.date).getHours();
    if (hour < 6 || hour > 23) score += 0.2;

    // Check frequency
    const sameDay = allTransactions.filter(t => 
      new Date(t.date).toDateString() === new Date(transaction.date).toDateString()
    );
    if (sameDay.length > 10) score += 0.2;

    // Check round numbers (often fraudulent)
    if (transaction.amount % 100 === 0 && transaction.amount > 1000) score += 0.1;

    // Check category consistency
    const categoryTransactions = allTransactions.filter(t => t.categoryId === transaction.categoryId);
    const categoryStats = this.calculateStats(categoryTransactions);
    const categoryZScore = Math.abs((transaction.amount - categoryStats.mean) / categoryStats.stdDev);
    if (categoryZScore > 2.5) score += 0.2;

    return Math.min(score, 1);
  }

  private getFraudReasons(transaction: Transaction, allTransactions: Transaction[]): string[] {
    const reasons: string[] = [];

    const stats = this.calculateStats(allTransactions);
    const zScore = Math.abs((transaction.amount - stats.mean) / stats.stdDev);
    if (zScore > 3) reasons.push('Unusually high amount');

    const hour = new Date(transaction.date).getHours();
    if (hour < 6 || hour > 23) reasons.push('Unusual time of day');

    if (transaction.amount % 100 === 0 && transaction.amount > 1000) {
      reasons.push('Round number (common in fraud)');
    }

    return reasons;
  }

  private areSimilar(t1: Transaction, t2: Transaction): boolean {
    // Same amount
    if (Math.abs(t1.amount - t2.amount) < 0.01) {
      // Within 24 hours
      const timeDiff = Math.abs(new Date(t1.date).getTime() - new Date(t2.date).getTime());
      if (timeDiff < 24 * 60 * 60 * 1000) {
        return true;
      }
    }

    return false;
  }

  private calculateSimilarity(t1: Transaction, t2: Transaction): number {
    let similarity = 0;

    // Amount similarity
    const amountDiff = Math.abs(t1.amount - t2.amount);
    similarity += (1 - Math.min(amountDiff / Math.max(t1.amount, t2.amount), 1)) * 0.5;

    // Time similarity
    const timeDiff = Math.abs(new Date(t1.date).getTime() - new Date(t2.date).getTime());
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    similarity += (1 - Math.min(hoursDiff / 24, 1)) * 0.3;

    // Category similarity
    if (t1.categoryId === t2.categoryId) similarity += 0.2;

    return similarity;
  }

  private calculateStats(transactions: Transaction[]): any {
    const amounts = transactions.map(t => t.amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);

    return { mean, stdDev, variance };
  }
}
