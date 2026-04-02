import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from '../../entities/budget.entity';
import { Transaction } from '../../entities/transaction.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private budgetRepo: Repository<Budget>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
  ) {}

  async create(userId: number, dto: CreateBudgetDto): Promise<Budget> {
    // Kiểm tra trùng budget cho cùng category + tháng
    const exists = await this.budgetRepo.findOne({
      where: {
        userId,
        categoryId: dto.categoryId,
        month: dto.month,
      },
    });

    if (exists) {
      throw new ConflictException(
        'Đã tồn tại ngân sách cho danh mục này trong tháng này',
      );
    }

    const budget = this.budgetRepo.create({ ...dto, userId });
    return this.budgetRepo.save(budget);
  }

  async findAll(userId: number, month?: string): Promise<Budget[]> {
    const where: any = { userId };
    if (month) where.month = month;

    return this.budgetRepo.find({
      where,
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: number, id: number): Promise<Budget> {
    const budget = await this.budgetRepo.findOne({
      where: { id, userId },
      relations: ['category'],
    });
    if (!budget) throw new NotFoundException('Không tìm thấy ngân sách');
    return budget;
  }

  async update(
    userId: number,
    id: number,
    dto: UpdateBudgetDto,
  ): Promise<Budget> {
    const budget = await this.findOne(userId, id);
    Object.assign(budget, dto);
    return this.budgetRepo.save(budget);
  }

  async remove(userId: number, id: number): Promise<{ message: string }> {
    const budget = await this.findOne(userId, id);
    await this.budgetRepo.remove(budget);
    return { message: 'Xóa ngân sách thành công' };
  }

  async getBudgetStatus(userId: number, month: string) {
    const budgets = await this.findAll(userId, month);

    if (budgets.length === 0) {
      return { budgets: [], totalBudget: 0, totalSpent: 0 };
    }

    const [year, m] = month.split('-');

    const result = await Promise.all(
      budgets.map(async (budget) => {
        // Lấy tổng chi tiêu thực tế cho category này trong tháng
        const spentResult = await this.transactionRepo
          .createQueryBuilder('t')
          .select('SUM(t.amount)', 'total')
          .where('t.userId = :userId', { userId })
          .andWhere('t.categoryId = :categoryId', {
            categoryId: budget.categoryId,
          })
          .andWhere('t.type = :type', { type: 'expense' })
          .andWhere('MONTH(t.date) = :month AND YEAR(t.date) = :year', {
            month: parseInt(m),
            year: parseInt(year),
          })
          .getRawOne();

        const spent = Number(spentResult?.total) || 0;
        const budgetAmount = Number(budget.amount);
        const percentage =
          budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;

        let status: 'safe' | 'warning' | 'exceeded';
        if (percentage >= 100) {
          status = 'exceeded';
        } else if (percentage >= 80) {
          status = 'warning';
        } else {
          status = 'safe';
        }

        return {
          id: budget.id,
          categoryId: budget.categoryId,
          categoryName: budget.category?.name || '',
          categoryIcon: budget.category?.icon || '',
          budgetAmount,
          spent,
          remaining: budgetAmount - spent,
          percentage,
          status,
        };
      }),
    );

    const totalBudget = result.reduce((s, b) => s + b.budgetAmount, 0);
    const totalSpent = result.reduce((s, b) => s + b.spent, 0);

    return {
      budgets: result,
      totalBudget,
      totalSpent,
      totalRemaining: totalBudget - totalSpent,
      overallPercentage:
        totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
    };
  }
}
