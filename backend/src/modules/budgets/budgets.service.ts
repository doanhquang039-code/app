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
    // Auto-derive month from startDate if not provided (Flutter compatibility)
    if (!dto.month && dto.startDate) {
      const d = new Date(dto.startDate);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      dto.month = `${y}-${m}`;
    }
    if (!dto.month) {
      const now = new Date();
      dto.month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    // categoryId is optional (null = catch-all budget)
    const exists = dto.categoryId
      ? await this.budgetRepo.findOne({
          where: { userId, categoryId: dto.categoryId, month: dto.month },
        })
      : null;

    if (exists) {
      throw new ConflictException(
        'Đã tồn tại ngân sách cho danh mục này trong tháng này',
      );
    }

    const budget = this.budgetRepo.create({ ...dto, userId });
    return this.budgetRepo.save(budget);
  }

  async findAll(userId: number, month?: string) {
    const where: Record<string, unknown> = { userId };
    // Default to current month if no month provided
    if (!month) {
      const now = new Date();
      month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    where.month = month;

    const budgets = await this.budgetRepo.find({
      where,
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });

    const [year, m] = month.split('-');

    // Enrich each budget with realtime spent amount
    const enriched = await Promise.all(
      budgets.map(async (budget) => {
        const qb = this.transactionRepo
          .createQueryBuilder('t')
          .select('SUM(t.amount)', 'total')
          .where('t.userId = :userId', { userId })
          .andWhere('t.type = :type', { type: 'expense' })
          .andWhere('MONTH(t.date) = :month AND YEAR(t.date) = :year', {
            month: parseInt(m),
            year: parseInt(year),
          });

        if (budget.categoryId) {
          qb.andWhere('t.categoryId = :categoryId', {
            categoryId: budget.categoryId,
          });
        }

        const spentResult = await qb.getRawOne<{ total: string }>();
        const spent = Number(spentResult?.total) || 0;
        const amount = Number(budget.amount);

        return {
          id: budget.id,
          userId: budget.userId,
          categoryId: budget.categoryId,
          categoryName: budget.category?.name ?? null,
          amount,
          spent,
          remaining: amount - spent,
          period: 'monthly',
          month: budget.month,
          startDate: `${year}-${m}-01`,
          endDate: new Date(parseInt(year), parseInt(m), 0).toISOString().split('T')[0],
          createdAt: budget.createdAt,
        };
      }),
    );

    return enriched;
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
    const enriched = await this.findAll(userId, month);

    if (enriched.length === 0) {
      return { budgets: [], totalBudget: 0, totalSpent: 0 };
    }

    const result = enriched.map((budget) => {
      const percentage =
        budget.amount > 0
          ? Math.round((budget.spent / budget.amount) * 100)
          : 0;

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
        categoryName: budget.categoryName ?? '',
        budgetAmount: budget.amount,
        spent: budget.spent,
        remaining: budget.remaining,
        percentage,
        status,
      };
    });

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
