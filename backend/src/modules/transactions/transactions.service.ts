import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { Wallet } from '../../entities/wallet.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {}

  async bulkCreate(
    userId: number,
    items: CreateTransactionDto[],
  ): Promise<{
    created: number;
    results: Transaction[];
    errors: { index: number; message: string }[];
  }> {
    const results: Transaction[] = [];
    const errors: { index: number; message: string }[] = [];
    for (let i = 0; i < items.length; i++) {
      try {
        const saved = await this.create(userId, items[i]);
        results.push(saved);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Lỗi không xác định';
        errors.push({ index: i, message });
      }
    }
    return { created: results.length, results, errors };
  }

  async create(userId: number, dto: CreateTransactionDto) {
    const transaction = this.transactionRepository.create({
      ...dto,
      userId,
      date: new Date(dto.date),
    });
    const saved = await this.transactionRepository.save(transaction);

    // Auto-update wallet balance
    await this.updateWalletBalance(dto.walletId, dto.amount, dto.type, 'add');

    return saved;
  }

  async findAll(userId: number, query: QueryTransactionDto) {
    const qb = this.transactionRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.category', 'category')
      .leftJoinAndSelect('t.wallet', 'wallet')
      .where('t.userId = :userId', { userId })
      .orderBy('t.date', 'DESC');

    if (query.month) {
      const [year, month] = query.month.split('-');
      qb.andWhere('MONTH(t.date) = :month AND YEAR(t.date) = :year', {
        month: parseInt(month),
        year: parseInt(year),
      });
    }

    if (query.categoryId) {
      qb.andWhere('t.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    if (query.walletId) {
      qb.andWhere('t.walletId = :walletId', { walletId: query.walletId });
    }

    if (query.type) {
      qb.andWhere('t.type = :type', { type: query.type });
    }

    if (query.startDate) {
      qb.andWhere('t.date >= :startDate', { startDate: new Date(query.startDate) });
    }

    if (query.endDate) {
      qb.andWhere('t.date <= :endDate', { endDate: new Date(query.endDate) });
    }

    if (query.limit) {
      qb.take(query.limit);
    }

    return qb.getMany();
  }

  async findOne(userId: number, id: number) {
    const transaction = await this.transactionRepository.findOne({
      where: { id, userId },
      relations: ['category', 'wallet'],
    });
    if (!transaction) throw new NotFoundException('Không tìm thấy giao dịch');
    return transaction;
  }

  async update(userId: number, id: number, dto: UpdateTransactionDto) {
    const transaction = await this.findOne(userId, id);

    // Hoàn lại balance cũ
    await this.updateWalletBalance(
      transaction.walletId,
      Number(transaction.amount),
      transaction.type,
      'revert',
    );

    Object.assign(transaction, dto);
    if (dto.date) transaction.date = new Date(dto.date);
    const saved = await this.transactionRepository.save(transaction);

    // Cập nhật balance mới
    await this.updateWalletBalance(
      saved.walletId,
      Number(saved.amount),
      saved.type,
      'add',
    );

    return saved;
  }

  async remove(userId: number, id: number) {
    const transaction = await this.findOne(userId, id);

    // Hoàn lại balance khi xóa
    await this.updateWalletBalance(
      transaction.walletId,
      Number(transaction.amount),
      transaction.type,
      'revert',
    );

    await this.transactionRepository.remove(transaction);
    return { message: 'Xóa thành công' };
  }

  async getSummary(userId: number, month?: string) {
    const qb = this.transactionRepository
      .createQueryBuilder('t')
      .select('t.type', 'type')
      .addSelect('SUM(t.amount)', 'total')
      .where('t.userId = :userId', { userId });

    if (month) {
      const [year, m] = month.split('-');
      qb.andWhere('MONTH(t.date) = :month AND YEAR(t.date) = :year', {
        month: parseInt(m),
        year: parseInt(year),
      });
    }

    const result = await qb.groupBy('t.type').getRawMany<{ type: string; total: string }>();

    const totalIncome = Number(result.find((r) => r.type === 'income')?.total) || 0;
    const totalExpense = Number(result.find((r) => r.type === 'expense')?.total) || 0;
    const balance = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      balance,
      income: totalIncome,
      expense: totalExpense,
    };
  }


  /**
   * Cập nhật balance ví khi tạo/sửa/xóa giao dịch
   * action: 'add' = thêm giao dịch mới, 'revert' = hoàn lại giao dịch
   */
  private async updateWalletBalance(
    walletId: number,
    amount: number,
    type: string,
    action: 'add' | 'revert',
  ) {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });
    if (!wallet) return;

    let adjustment = amount;
    if (type === 'expense') {
      adjustment = -amount; // Chi tiêu trừ balance
    }

    if (action === 'revert') {
      adjustment = -adjustment; // Hoàn lại thì đảo dấu
    }

    wallet.balance = Number(wallet.balance) + adjustment;
    await this.walletRepository.save(wallet);
  }
}

