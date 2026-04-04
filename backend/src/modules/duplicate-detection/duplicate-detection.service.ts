import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';

@Injectable()
export class DuplicateDetectionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  /**
   * Detect potential duplicate transactions
   * Considers: amount, category, wallet, and time difference
   */
  async detectDuplicates(
    userId: number,
    options?: {
      timeDiffMinutes?: number; // Default: 30 minutes
      amountTolerance?: number; // Default: 0 (exact match)
    },
  ) {
    const timeDiffMinutes = options?.timeDiffMinutes || 30;
    const amountTolerance = options?.amountTolerance || 0;

    const transactions = await this.transactionRepository.find({
      where: { userId },
      relations: ['category', 'wallet'],
      order: { date: 'DESC' },
    });

    const duplicateGroups: Array<{
      suspicionLevel: number;
      transactions: Array<{
        id: number;
        amount: number;
        type: string;
        date: Date;
        category: string;
        wallet: string;
        note: string;
      }>;
    }> = [];
    const processed = new Set();

    for (let i = 0; i < transactions.length; i++) {
      if (processed.has(transactions[i].id)) continue;

      const group = [transactions[i]];
      processed.add(transactions[i].id);

      for (let j = i + 1; j < transactions.length; j++) {
        if (processed.has(transactions[j].id)) continue;

        if (
          this.isSuspiciousDuplicate(
            transactions[i],
            transactions[j],
            timeDiffMinutes,
            amountTolerance,
          )
        ) {
          group.push(transactions[j]);
          processed.add(transactions[j].id);
        }
      }

      if (group.length > 1) {
        duplicateGroups.push({
          suspicionLevel: this.calculateSuspicionLevel(group),
          transactions: group.map((t) => ({
            id: t.id,
            amount: t.amount,
            type: t.type,
            date: t.date,
            category: t.category?.name,
            wallet: t.wallet?.name,
            note: t.note,
          })),
        });
      }
    }

    return {
      totalDuplicateGroups: duplicateGroups.length,
      groups: duplicateGroups.sort(
        (a, b) => b.suspicionLevel - a.suspicionLevel,
      ),
    };
  }

  /**
   * Get similar transactions to a specific transaction
   */
  async findSimilar(userId: number, transactionId: number) {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId, userId },
      relations: ['category', 'wallet'],
    });

    if (!transaction) {
      return { message: 'Giao dịch không tìm thấy' };
    }

    const allTransactions = await this.transactionRepository.find({
      where: { userId },
      relations: ['category', 'wallet'],
    });

    const similar = allTransactions
      .filter((t) => t.id !== transaction.id)
      .filter(
        (t) =>
          t.type === transaction.type &&
          t.categoryId === transaction.categoryId &&
          this.isSimilarAmount(
            Number(t.amount),
            Number(transaction.amount),
            0.1,
          ) && // 10% tolerance
          this.isWithinTimeWindow(new Date(t.date), new Date(transaction.date), 60), // 1 hour
      )
      .map((t) => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        date: t.date,
        category: t.category?.name,
        wallet: t.wallet?.name,
        note: t.note,
      }));

    return {
      originalTransaction: {
        id: transaction.id,
        amount: transaction.amount,
        type: transaction.type,
        date: transaction.date,
        category: transaction.category?.name,
        wallet: transaction.wallet?.name,
      },
      similarCount: similar.length,
      similarTransactions: similar,
    };
  }

  // Helper methods
  private isSuspiciousDuplicate(
    t1: Transaction,
    t2: Transaction,
    timeDiffMinutes: number,
    amountTolerance: number,
  ): boolean {
    // Must be same type, category, and wallet
    if (
      t1.type !== t2.type ||
      t1.categoryId !== t2.categoryId ||
      t1.walletId !== t2.walletId
    ) {
      return false;
    }

    // Check amount similarity
    if (!this.isSimilarAmount(Number(t1.amount), Number(t2.amount), amountTolerance)) {
      return false;
    }

    // Check time difference
    return this.isWithinTimeWindow(new Date(t1.date), new Date(t2.date), timeDiffMinutes);
  }

  private isSimilarAmount(amount1: number, amount2: number, tolerance: number): boolean {
    const diff = Math.abs(amount1 - amount2);
    const maxDiff = amount1 * tolerance;
    return diff <= maxDiff;
  }

  private isWithinTimeWindow(date1: Date, date2: Date, minutes: number): boolean {
    const diffMs = Math.abs(date1.getTime() - date2.getTime());
    const diffMinutes = diffMs / (1000 * 60);
    return diffMinutes <= minutes;
  }

  private calculateSuspicionLevel(transactions: Transaction[]): number {
    // Score based on:
    // - Number of duplicates (more = higher suspicion)
    // - Amount exactness (exact = higher suspicion)
    // - Time proximity (closer = higher suspicion)

    let score = 0;

    // More duplicates = higher suspicion
    score += Math.min(transactions.length * 20, 40);

    // Check if amounts are exact
    const amounts = transactions.map((t) => Number(t.amount));
    const allExact = amounts.every((a) => a === amounts[0]);
    if (allExact) score += 30;

    // Check time proximity
    const times = transactions.map((t) => new Date(t.date).getTime());
    const maxTimeDiff = Math.max(...times) - Math.min(...times);
    const maxTimeDiffMinutes = maxTimeDiff / (1000 * 60);
    if (maxTimeDiffMinutes < 5) score += 30;
    else if (maxTimeDiffMinutes < 30) score += 15;

    return Math.min(score, 100);
  }
}
