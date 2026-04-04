import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { BillReminder } from '../../entities/bill-reminder.entity';
import { CreateBillReminderDto } from './dto/create-bill-reminder.dto';
import { UpdateBillReminderDto } from './dto/update-bill-reminder.dto';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class BillRemindersService {
  constructor(
    @InjectRepository(BillReminder)
    private billReminderRepository: Repository<BillReminder>,
  ) {}

  async create(userId: number, dto: CreateBillReminderDto) {
    if (dto.amount <= 0) {
      throw new BadRequestException('Số tiền phải lớn hơn 0');
    }

    const dueDate = new Date(dto.dueDate);
    if (isNaN(dueDate.getTime())) {
      throw new BadRequestException('Ngày thanh toán không hợp lệ');
    }

    if (dueDate < new Date()) {
      throw new BadRequestException('Ngày thanh toán không được trong quá khứ');
    }

    const reminder = this.billReminderRepository.create({
      userId,
      billName: dto.billName,
      description: dto.description,
      amount: dto.amount,
      dueDate,
      reminderEnabled: dto.reminderEnabled !== false,
      remindDaysBefore: dto.remindDaysBefore || 3,
      status: 'upcoming',
    });

    return await this.billReminderRepository.save(reminder);
  }

  async findAll(userId: number, status?: string) {
    const qb = this.billReminderRepository
      .createQueryBuilder('b')
      .where('b.userId = :userId', { userId })
      .orderBy('b.dueDate', 'ASC');

    if (status) {
      qb.andWhere('b.status = :status', { status });
    }

    return await qb.getMany();
  }

  async findOne(userId: number, id: number) {
    const reminder = await this.billReminderRepository.findOne({
      where: { id, userId },
    });
    if (!reminder) {
      throw new NotFoundException('Nhắc nhở hóa đơn không tìm thấy');
    }
    return reminder;
  }

  async update(userId: number, id: number, dto: UpdateBillReminderDto) {
    const reminder = await this.findOne(userId, id);

    if (dto.amount && dto.amount <= 0) {
      throw new BadRequestException('Số tiền phải lớn hơn 0');
    }

    Object.assign(reminder, {
      billName: dto.billName || reminder.billName,
      description: dto.description !== undefined ? dto.description : reminder.description,
      amount: dto.amount || reminder.amount,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : reminder.dueDate,
      reminderEnabled: dto.reminderEnabled !== undefined ? dto.reminderEnabled : reminder.reminderEnabled,
      remindDaysBefore: dto.remindDaysBefore || reminder.remindDaysBefore,
    });

    return await this.billReminderRepository.save(reminder);
  }

  async remove(userId: number, id: number) {
    const reminder = await this.findOne(userId, id);
    await this.billReminderRepository.remove(reminder);
    return { message: 'Đã xóa nhắc nhở hóa đơn' };
  }

  async markAsPaid(userId: number, id: number) {
    const reminder = await this.findOne(userId, id);
    reminder.isPaid = true;
    reminder.paidDate = new Date();
    reminder.status = 'paid';
    return await this.billReminderRepository.save(reminder);
  }

  async getUpcomingBills(userId: number) {
    const now = new Date();
    const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const bills = await this.billReminderRepository.find({
      where: {
        userId,
        isPaid: false,
        dueDate: MoreThan(now) && LessThan(oneMonthLater),
      },
      order: { dueDate: 'ASC' },
    });

    return bills.map((bill) => {
      const daysUntilDue = Math.ceil(
        (new Date(bill.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      return {
        ...bill,
        daysUntilDue,
        isOverdue: daysUntilDue < 0,
      };
    });
  }

  // Cron job to check and update bill status every hour
  @Cron('0 * * * *')
  async updateBillStatuses() {
    const now = new Date();
    const bills = await this.billReminderRepository.find({
      where: { isPaid: false },
    });

    for (const bill of bills) {
      if (new Date(bill.dueDate) < now) {
        bill.status = 'overdue';
      } else {
        bill.status = 'upcoming';
      }
      await this.billReminderRepository.save(bill);
    }
  }
}
