import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { RecurringTransaction } from '../../entities/recurring-transaction.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Wallet } from '../../entities/wallet.entity';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';
import { QueryRecurringTransactionDto } from './dto/query-recurring-transaction.dto';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class RecurringTransactionsService {
  constructor(
    @InjectRepository(RecurringTransaction)
    private recurringRepository: Repository<RecurringTransaction>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {}

  async create(userId: number, dto: CreateRecurringTransactionDto) {
    if (dto.amount <= 0) {
      throw new BadRequestException('Số tiền phải lớn hơn 0');
    }

    // Ensure startDate is a Date object
    const startDate = new Date(dto.startDate);
    if (isNaN(startDate.getTime())) {
      throw new BadRequestException('Ngày bắt đầu không hợp lệ');
    }

    // Calculate next execution date
    const nextExecutionDate = this.calculateNextExecution(
      startDate,
      dto.frequency,
      dto.frequencyDay,
    );

    const recurring = this.recurringRepository.create({
      userId,
      walletId: dto.walletId,
      categoryId: dto.categoryId,
      amount: dto.amount,
      type: dto.type,
      note: dto.note,
      frequency: dto.frequency,
      frequencyDay: dto.frequencyDay,
      startDate,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      nextExecutionDate,
      isActive: true,
    });

    return await this.recurringRepository.save(recurring);
  }

  async findAll(userId: number, query: QueryRecurringTransactionDto) {
    const qb = this.recurringRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.category', 'category')
      .leftJoinAndSelect('r.wallet', 'wallet')
      .where('r.userId = :userId', { userId })
      .orderBy('r.nextExecutionDate', 'ASC');

    if (query.frequency) {
      qb.andWhere('r.frequency = :frequency', { frequency: query.frequency });
    }

    if (query.isActive) {
      qb.andWhere('r.isActive = :isActive', {
        isActive: query.isActive === 'true',
      });
    }

    return await qb.getMany();
  }

  async findOne(userId: number, id: number) {
    const recurring = await this.recurringRepository.findOne({
      where: { id, userId },
      relations: ['category', 'wallet'],
    });
    if (!recurring) {
      throw new NotFoundException('Không tìm thấy giao dịch định kỳ');
    }
    return recurring;
  }

  async update(
    userId: number,
    id: number,
    dto: UpdateRecurringTransactionDto,
  ) {
    const recurring = await this.findOne(userId, id);

    if (dto.amount && dto.amount <= 0) {
      throw new BadRequestException('Số tiền phải lớn hơn 0');
    }

    // Recalculate next execution if frequency or frequency day changed
    if (
      dto.frequency ||
      dto.frequencyDay ||
      dto.startDate
    ) {
      recurring.nextExecutionDate = this.calculateNextExecution(
        dto.startDate || recurring.startDate,
        dto.frequency || recurring.frequency,
        dto.frequencyDay || recurring.frequencyDay,
      );
    }

    // Update fields if provided
    if (dto.walletId) recurring.walletId = dto.walletId;
    if (dto.categoryId) recurring.categoryId = dto.categoryId;
    if (dto.amount) recurring.amount = dto.amount;
    if (dto.type) recurring.type = dto.type;
    if (dto.note) recurring.note = dto.note;
    if (dto.frequency) recurring.frequency = dto.frequency;
    if (dto.frequencyDay) recurring.frequencyDay = dto.frequencyDay;
    if (dto.startDate) recurring.startDate = new Date(dto.startDate);
    if (dto.endDate) recurring.endDate = new Date(dto.endDate);

    return await this.recurringRepository.save(recurring);
  }

  async remove(userId: number, id: number) {
    const recurring = await this.findOne(userId, id);
    await this.recurringRepository.remove(recurring);
    return { message: 'Đã xóa giao dịch định kỳ' };
  }

  async toggleActive(userId: number, id: number, isActive: boolean) {
    const recurring = await this.findOne(userId, id);
    recurring.isActive = isActive;
    return await this.recurringRepository.save(recurring);
  }

  // Cron job to execute recurring transactions every hour
  @Cron('0 * * * *') // Every hour
  async executeRecurringTransactions() {
    const now = new Date();
    const recurringTransactions = await this.recurringRepository.find({
      where: {
        isActive: true,
        nextExecutionDate: LessThanOrEqual(now),
      },
    });

    for (const recurring of recurringTransactions) {
      // Check if end date has passed
      if (recurring.endDate && recurring.endDate < now) {
        recurring.isActive = false;
        await this.recurringRepository.save(recurring);
        continue;
      }

      // Create transaction
      const transaction = this.transactionRepository.create({
        userId: recurring.userId,
        walletId: recurring.walletId,
        categoryId: recurring.categoryId,
        amount: recurring.amount,
        type: recurring.type,
        note: `[Auto] ${recurring.note || 'Giao dịch định kỳ'}`,
        date: now,
      });

      await this.transactionRepository.save(transaction);

      // Update wallet balance
      await this.updateWalletBalance(
        recurring.walletId,
        recurring.amount,
        recurring.type,
      );

      // Update recurring transaction
      recurring.lastExecutedDate = now;
      recurring.nextExecutionDate = this.calculateNextExecution(
        now,
        recurring.frequency,
        recurring.frequencyDay,
      );

      await this.recurringRepository.save(recurring);
    }
  }

  private calculateNextExecution(
    fromDate: Date,
    frequency: string,
    frequencyDay?: string,
  ): Date {
    const next = new Date(fromDate);

    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'biweekly':
        next.setDate(next.getDate() + 14);
        break;
      case 'monthly':
        const day = frequencyDay ? parseInt(frequencyDay) : fromDate.getDate();
        next.setMonth(next.getMonth() + 1);
        next.setDate(day);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }

    return next;
  }

  private async updateWalletBalance(
    walletId: number,
    amount: number,
    type: string,
  ) {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException('Ví không tìm thấy');
    }

    if (type === 'income') {
      wallet.balance = Number(wallet.balance) + Number(amount);
    } else {
      wallet.balance = Number(wallet.balance) - Number(amount);
    }

    await this.walletRepository.save(wallet);
  }
}
