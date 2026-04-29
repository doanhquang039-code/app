import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ScheduledTransaction } from '../../entities/scheduled-transaction.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ScheduledTransactionsService {
  constructor(
    @InjectRepository(ScheduledTransaction)
    private scheduledRepo: Repository<ScheduledTransaction>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
  ) {}

  async create(userId: number, data: any): Promise<ScheduledTransaction> {
    const nextExecutionDate = this.calculateNextExecution(
      new Date(data.startDate),
      data.frequency,
      data,
    );

    const scheduled = this.scheduledRepo.create({
      userId,
      ...data,
      nextExecutionDate,
      status: 'ACTIVE',
    });

    return await this.scheduledRepo.save(scheduled) as unknown as ScheduledTransaction;
  }

  async findAll(userId: number): Promise<ScheduledTransaction[]> {
    return await this.scheduledRepo.find({
      where: { userId },
      relations: ['category', 'wallet'],
      order: { nextExecutionDate: 'ASC' },
    });
  }

  async findOne(userId: number, id: number): Promise<ScheduledTransaction> {
    const scheduled = await this.scheduledRepo.findOne({
      where: { id, userId },
      relations: ['category', 'wallet'],
    });

    if (!scheduled) {
      throw new NotFoundException('Scheduled transaction not found');
    }

    return scheduled;
  }

  async update(userId: number, id: number, data: any): Promise<ScheduledTransaction> {
    const scheduled = await this.findOne(userId, id);
    Object.assign(scheduled, data);

    if (data.frequency || data.startDate) {
      scheduled.nextExecutionDate = this.calculateNextExecution(
        scheduled.nextExecutionDate,
        scheduled.frequency,
        scheduled,
      );
    }

    return await this.scheduledRepo.save(scheduled) as unknown as ScheduledTransaction;
  }

  async pause(userId: number, id: number): Promise<ScheduledTransaction> {
    const scheduled = await this.findOne(userId, id);
    scheduled.status = 'PAUSED';
    return await this.scheduledRepo.save(scheduled) as unknown as ScheduledTransaction;
  }

  async resume(userId: number, id: number): Promise<ScheduledTransaction> {
    const scheduled = await this.findOne(userId, id);
    scheduled.status = 'ACTIVE';
    return await this.scheduledRepo.save(scheduled) as unknown as ScheduledTransaction;
  }

  async remove(userId: number, id: number): Promise<void> {
    const scheduled = await this.findOne(userId, id);
    await this.scheduledRepo.remove(scheduled);
  }

  async getUpcoming(userId: number, days: number = 30): Promise<ScheduledTransaction[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await this.scheduledRepo.find({
      where: {
        userId,
        status: 'ACTIVE',
        nextExecutionDate: LessThan(futureDate),
      },
      relations: ['category', 'wallet'],
      order: { nextExecutionDate: 'ASC' },
    });
  }

  async executeNow(userId: number, id: number): Promise<Transaction> {
    const scheduled = await this.findOne(userId, id);
    return await this.executeScheduled(scheduled);
  }

  private async executeScheduled(scheduled: ScheduledTransaction): Promise<Transaction> {
    const transaction = this.transactionRepo.create({
      userId: scheduled.userId,
      type: scheduled.type,
      amount: scheduled.amount,
      categoryId: scheduled.categoryId,
      walletId: scheduled.walletId,
      date: new Date(),
    });

    const savedTransaction = await this.transactionRepo.save(transaction) as unknown as Transaction;

    scheduled.executedCount += 1;
    scheduled.lastExecutionDate = new Date();
    scheduled.nextExecutionDate = this.calculateNextExecution(
      new Date(),
      scheduled.frequency,
      scheduled,
    );

    if (scheduled.occurrences && scheduled.executedCount >= scheduled.occurrences) {
      scheduled.status = 'COMPLETED';
    }

    await this.scheduledRepo.save(scheduled);

    return savedTransaction;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processScheduledTransactions(): Promise<void> {
    console.log('Processing scheduled transactions...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueTransactions = await this.scheduledRepo.find({
      where: {
        status: 'ACTIVE',
        autoExecute: true,
        nextExecutionDate: LessThan(tomorrow),
      },
    });

    for (const scheduled of dueTransactions) {
      try {
        await this.executeScheduled(scheduled);
        console.log(`Executed scheduled transaction ${scheduled.id}`);
      } catch (error) {
        console.error(`Failed to execute scheduled transaction ${scheduled.id}:`, error);
        scheduled.executionError = error.message;
        await this.scheduledRepo.save(scheduled);
      }
    }
  }

  private calculateNextExecution(
    currentDate: Date,
    frequency: string,
    data: any,
  ): Date {
    const nextDate = new Date(currentDate);

    switch (frequency) {
      case 'DAILY':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'WEEKLY':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'BIWEEKLY':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'MONTHLY':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'QUARTERLY':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'YEARLY':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    if (data.adjustForWeekends) {
      const dayOfWeek = nextDate.getDay();
      if (dayOfWeek === 0) nextDate.setDate(nextDate.getDate() + 1); // Sunday -> Monday
      if (dayOfWeek === 6) nextDate.setDate(nextDate.getDate() + 2); // Saturday -> Monday
    }

    return nextDate;
  }
}
