import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NetWorthSnapshot } from '../../entities/net-worth-snapshot.entity';
import { Wallet } from '../../entities/wallet.entity';
import { BankAccount } from '../../entities/bank-account.entity';
import { CreditCard } from '../../entities/credit-card.entity';
import { Investment } from '../../entities/investment.entity';
import { Debt } from '../../entities/debt.entity';

@Injectable()
export class NetWorthService {
  constructor(
    @InjectRepository(NetWorthSnapshot)
    private snapshotRepo: Repository<NetWorthSnapshot>,
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
    @InjectRepository(BankAccount)
    private bankRepo: Repository<BankAccount>,
    @InjectRepository(CreditCard)
    private cardRepo: Repository<CreditCard>,
    @InjectRepository(Investment)
    private investmentRepo: Repository<Investment>,
    @InjectRepository(Debt)
    private debtRepo: Repository<Debt>,
  ) {}

  async computeBreakdown(userId: number) {
    const walletRow = await this.walletRepo
      .createQueryBuilder('w')
      .select('COALESCE(SUM(w.balance), 0)', 'sum')
      .where('w.userId = :userId', { userId })
      .getRawOne<{ sum: string }>();

    const bankRow = await this.bankRepo
      .createQueryBuilder('b')
      .select('COALESCE(SUM(b.balance), 0)', 'sum')
      .where('b.userId = :userId', { userId })
      .andWhere('b.isActive = :active', { active: true })
      .getRawOne<{ sum: string }>();

    const cardRow = await this.cardRepo
      .createQueryBuilder('c')
      .select('COALESCE(SUM(c.currentBalance), 0)', 'sum')
      .where('c.userId = :userId', { userId })
      .andWhere('c.isActive = :active', { active: true })
      .getRawOne<{ sum: string }>();

    const investments = await this.investmentRepo.find({
      where: { userId, status: 'holding' },
    });
    const investmentTotal = investments.reduce(
      (s, i) => s + Number(i.currentValue ?? i.totalInvested ?? 0),
      0,
    );

    const debts = await this.debtRepo.find({ where: { userId } });
    let receivablesTotal = 0;
    let borrowingsTotal = 0;
    for (const d of debts) {
      if (d.status === 'cancelled' || d.status === 'paid') continue;
      const remaining = Number(d.totalAmount) - Number(d.paidAmount ?? 0);
      if (d.type === 'lend') receivablesTotal += Math.max(0, remaining);
      if (d.type === 'borrow') borrowingsTotal += Math.max(0, remaining);
    }

    const walletTotal = Number(walletRow?.sum ?? 0);
    const bankTotal = Number(bankRow?.sum ?? 0);
    const creditCardDebtTotal = Number(cardRow?.sum ?? 0);

    const assets = walletTotal + bankTotal + investmentTotal + receivablesTotal;
    const liabilities = borrowingsTotal + creditCardDebtTotal;
    const netWorth = assets - liabilities;

    return {
      walletTotal,
      bankTotal,
      investmentTotal,
      receivablesTotal,
      borrowingsTotal,
      creditCardDebtTotal,
      netWorth,
      currency: 'VND' as const,
    };
  }

  /** Lưu hoặc cập nhật snapshot theo ngày (một bản ghi / user / ngày). */
  async captureSnapshot(userId: number, note?: string) {
    const breakdown = await this.computeBreakdown(userId);
    const snapshotDate = new Date();
    snapshotDate.setHours(0, 0, 0, 0);

    let existing = await this.snapshotRepo.findOne({
      where: { userId, snapshotDate },
    });

    if (existing) {
      Object.assign(existing, { ...breakdown, note: note ?? existing.note });
      return this.snapshotRepo.save(existing);
    }

    const row = this.snapshotRepo.create({
      userId,
      snapshotDate,
      ...breakdown,
      note,
    });
    return this.snapshotRepo.save(row);
  }

  async findRange(userId: number, from?: string, to?: string) {
    const qb = this.snapshotRepo
      .createQueryBuilder('s')
      .where('s.userId = :userId', { userId })
      .orderBy('s.snapshotDate', 'ASC');
    if (from) qb.andWhere('s.snapshotDate >= :from', { from });
    if (to) qb.andWhere('s.snapshotDate <= :to', { to });
    return qb.getMany();
  }

  async findLatest(userId: number, take = 12) {
    return this.snapshotRepo.find({
      where: { userId },
      order: { snapshotDate: 'DESC' },
      take,
    });
  }
}
