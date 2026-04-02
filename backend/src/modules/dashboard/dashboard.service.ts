import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { Wallet } from '../../entities/wallet.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
  ) {}

  /**
   * Tổng quan: thu/chi/dư tháng hiện tại + tổng số dư tất cả ví
   */
  async getOverview(userId: number) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Tổng thu/chi tháng hiện tại
    const result = await this.transactionRepo
      .createQueryBuilder('t')
      .select('t.type', 'type')
      .addSelect('SUM(t.amount)', 'total')
      .where('t.userId = :userId', { userId })
      .andWhere('MONTH(t.date) = :month AND YEAR(t.date) = :year', {
        month,
        year,
      })
      .groupBy('t.type')
      .getRawMany();

    const income = Number(result.find((r) => r.type === 'income')?.total) || 0;
    const expense =
      Number(result.find((r) => r.type === 'expense')?.total) || 0;

    // Tổng số dư tất cả ví
    const walletResult = await this.walletRepo
      .createQueryBuilder('w')
      .select('SUM(w.balance)', 'totalBalance')
      .where('w.userId = :userId', { userId })
      .getRawOne();

    const totalBalance = Number(walletResult?.totalBalance) || 0;

    // Đếm giao dịch tháng này
    const transactionCount = await this.transactionRepo
      .createQueryBuilder('t')
      .where('t.userId = :userId', { userId })
      .andWhere('MONTH(t.date) = :month AND YEAR(t.date) = :year', {
        month,
        year,
      })
      .getCount();

    return {
      income,
      expense,
      balance: income - expense,
      totalBalance,
      transactionCount,
      month: `${year}-${String(month).padStart(2, '0')}`,
    };
  }

  /**
   * Giao dịch gần nhất
   */
  async getRecentTransactions(userId: number, limit: number = 10) {
    return this.transactionRepo.find({
      where: { userId },
      relations: ['category', 'wallet'],
      order: { date: 'DESC' },
      take: limit,
    });
  }

  /**
   * Thống kê chi tiêu theo danh mục (cho biểu đồ tròn)
   */
  async getExpenseByCategory(userId: number, month: string) {
    const [year, m] = month.split('-');

    const result = await this.transactionRepo
      .createQueryBuilder('t')
      .leftJoin('t.category', 'c')
      .select('c.id', 'categoryId')
      .addSelect('c.name', 'categoryName')
      .addSelect('c.icon', 'categoryIcon')
      .addSelect('c.color', 'categoryColor')
      .addSelect('SUM(t.amount)', 'total')
      .addSelect('COUNT(t.id)', 'count')
      .where('t.userId = :userId', { userId })
      .andWhere('t.type = :type', { type: 'expense' })
      .andWhere('MONTH(t.date) = :month AND YEAR(t.date) = :year', {
        month: parseInt(m),
        year: parseInt(year),
      })
      .groupBy('c.id')
      .addGroupBy('c.name')
      .addGroupBy('c.icon')
      .addGroupBy('c.color')
      .orderBy('total', 'DESC')
      .getRawMany();

    const grandTotal = result.reduce((s, r) => s + Number(r.total), 0);

    return result.map((r) => ({
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      categoryIcon: r.categoryIcon,
      categoryColor: r.categoryColor,
      total: Number(r.total),
      count: Number(r.count),
      percentage:
        grandTotal > 0
          ? Math.round((Number(r.total) / grandTotal) * 100)
          : 0,
    }));
  }

  /**
   * Chi tiêu theo ngày trong tháng (cho biểu đồ cột)
   */
  async getDailyTrend(userId: number, month: string) {
    const [year, m] = month.split('-');

    const result = await this.transactionRepo
      .createQueryBuilder('t')
      .select('DAY(t.date)', 'day')
      .addSelect('t.type', 'type')
      .addSelect('SUM(t.amount)', 'total')
      .where('t.userId = :userId', { userId })
      .andWhere('MONTH(t.date) = :month AND YEAR(t.date) = :year', {
        month: parseInt(m),
        year: parseInt(year),
      })
      .groupBy('DAY(t.date)')
      .addGroupBy('t.type')
      .orderBy('day', 'ASC')
      .getRawMany();

    // Tạo mảng đầy đủ cho tất cả ngày trong tháng
    const daysInMonth = new Date(parseInt(year), parseInt(m), 0).getDate();
    const dailyData: { day: number; date: string; income: number; expense: number }[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const incomeRow = result.find(
        (r) => Number(r.day) === d && r.type === 'income',
      );
      const expenseRow = result.find(
        (r) => Number(r.day) === d && r.type === 'expense',
      );

      dailyData.push({
        day: d,
        date: `${year}-${m}-${String(d).padStart(2, '0')}`,
        income: Number(incomeRow?.total) || 0,
        expense: Number(expenseRow?.total) || 0,
      });
    }

    return dailyData;
  }

  /**
   * So sánh thu/chi 6 tháng gần nhất (cho biểu đồ line)
   */
  async getMonthlyComparison(userId: number) {
    const result = await this.transactionRepo
      .createQueryBuilder('t')
      .select('YEAR(t.date)', 'year')
      .addSelect('MONTH(t.date)', 'month')
      .addSelect('t.type', 'type')
      .addSelect('SUM(t.amount)', 'total')
      .where('t.userId = :userId', { userId })
      .andWhere('t.date >= DATEADD(MONTH, -6, GETDATE())')
      .groupBy('YEAR(t.date)')
      .addGroupBy('MONTH(t.date)')
      .addGroupBy('t.type')
      .orderBy('year', 'ASC')
      .addOrderBy('month', 'ASC')
      .getRawMany();

    // Tạo mảng 6 tháng gần nhất
    const months: { month: string; income: number; expense: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const label = `${y}-${String(m).padStart(2, '0')}`;

      const incomeRow = result.find(
        (r) => Number(r.year) === y && Number(r.month) === m && r.type === 'income',
      );
      const expenseRow = result.find(
        (r) => Number(r.year) === y && Number(r.month) === m && r.type === 'expense',
      );

      months.push({
        month: label,
        income: Number(incomeRow?.total) || 0,
        expense: Number(expenseRow?.total) || 0,
      });
    }

    return months;
  }
}
