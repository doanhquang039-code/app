import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async create(userId: number, dto: CreateTransactionDto) {
    const transaction = this.transactionRepository.create({
      ...dto,
      userId,
      date: new Date(dto.date),
    });
    return this.transactionRepository.save(transaction);
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

    if (query.type) {
      qb.andWhere('t.type = :type', { type: query.type });
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
    Object.assign(transaction, dto);
    if (dto.date) transaction.date = new Date(dto.date);
    return this.transactionRepository.save(transaction);
  }

  async remove(userId: number, id: number) {
    const transaction = await this.findOne(userId, id);
    await this.transactionRepository.remove(transaction);
    return { message: 'Xóa thành công' };
  }

  async getSummary(userId: number, month: string) {
    const [year, m] = month.split('-');
    const result = await this.transactionRepository
      .createQueryBuilder('t')
      .select('t.type', 'type')
      .addSelect('SUM(t.amount)', 'total')
      .where('t.userId = :userId', { userId })
      .andWhere('MONTH(t.date) = :month AND YEAR(t.date) = :year', {
        month: parseInt(m),
        year: parseInt(year),
      })
      .groupBy('t.type')
      .getRawMany();

    const income = result.find((r) => r.type === 'income')?.total || 0;
    const expense = result.find((r) => r.type === 'expense')?.total || 0;
    return { income, expense, balance: income - expense };
  }
}
