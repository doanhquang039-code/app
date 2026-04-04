import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BudgetAlert } from '../../entities/budget-alert.entity';
import { Budget } from '../../entities/budget.entity';
import { Transaction } from '../../entities/transaction.entity';
import { CreateBudgetAlertDto } from './dto/create-budget-alert.dto';
import { UpdateBudgetAlertDto } from './dto/update-budget-alert.dto';

@Injectable()
export class BudgetAlertsService {
  constructor(
    @InjectRepository(BudgetAlert)
    private budgetAlertRepository: Repository<BudgetAlert>,
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async create(userId: number, dto: CreateBudgetAlertDto) {
    if (dto.thresholdPercentage < 0 || dto.thresholdPercentage > 100) {
      throw new BadRequestException('Threshold phải từ 0-100');
    }

    // Verify budget exists
    const budget = await this.budgetRepository.findOne({
      where: { id: dto.budgetId, userId },
    });
    if (!budget) {
      throw new NotFoundException('Budget không tìm thấy');
    }

    const alert = this.budgetAlertRepository.create({
      userId,
      budgetId: dto.budgetId,
      thresholdPercentage: dto.thresholdPercentage,
      enabled: dto.enabled !== false,
    });

    return await this.budgetAlertRepository.save(alert);
  }

  async findAll(userId: number) {
    return await this.budgetAlertRepository.find({
      where: { userId },
      relations: ['budget'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: number, id: number) {
    const alert = await this.budgetAlertRepository.findOne({
      where: { id, userId },
      relations: ['budget'],
    });
    if (!alert) {
      throw new NotFoundException('Budget alert không tìm thấy');
    }
    return alert;
  }

  async update(userId: number, id: number, dto: UpdateBudgetAlertDto) {
    const alert = await this.findOne(userId, id);

    if (dto.thresholdPercentage) {
      if (dto.thresholdPercentage < 0 || dto.thresholdPercentage > 100) {
        throw new BadRequestException('Threshold phải từ 0-100');
      }
      alert.thresholdPercentage = dto.thresholdPercentage;
    }

    if (dto.enabled !== undefined) {
      alert.enabled = dto.enabled;
    }

    return await this.budgetAlertRepository.save(alert);
  }

  async remove(userId: number, id: number) {
    const alert = await this.findOne(userId, id);
    await this.budgetAlertRepository.remove(alert);
    return { message: 'Đã xóa budget alert' };
  }

  // Check if budget has exceeded threshold and return alert status
  async checkBudgetStatus(userId: number, budgetId: number) {
    const budget = await this.budgetRepository.findOne({
      where: { id: budgetId, userId },
      relations: ['category'],
    });

    if (!budget) {
      throw new NotFoundException('Budget không tìm thấy');
    }

    const alert = await this.budgetAlertRepository.findOne({
      where: { budgetId, userId },
    });

    // Get current month spending
    const [year, month] = budget.month.split('-');
    const transactions = await this.transactionRepository.find({
      where: {
        userId,
        categoryId: budget.categoryId,
        type: 'expense',
      },
    });

    const spent = transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return (
          tDate.getFullYear() === parseInt(year) &&
          tDate.getMonth() === parseInt(month) - 1
        );
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const percentage = (spent / Number(budget.amount)) * 100;

    return {
      budgetId,
      categoryName: budget.categoryId,
      budgetAmount: budget.amount,
      spent: spent,
      percentage: Math.round(percentage),
      thresholdPercentage: alert?.thresholdPercentage || 80,
      isExceeded: percentage >= (alert?.thresholdPercentage || 80),
      hasAlert: !!alert,
      message:
        percentage >= 100
          ? 'Đã vượt quá ngân sách'
          : percentage >= (alert?.thresholdPercentage || 80)
            ? `Đã sử dụng ${Math.round(percentage)}% ngân sách`
            : 'Ngân sách còn bình thường',
    };
  }
}
