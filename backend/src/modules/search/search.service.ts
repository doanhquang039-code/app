import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { Budget } from '../../entities/budget.entity';
import { Category } from '../../entities/category.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(Budget)
    private budgetRepo: Repository<Budget>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async searchTransactions(userId: number, filters: any): Promise<any> {
    const {
      query,
      type,
      categoryId,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      tags,
      sortBy = 'date',
      sortOrder = 'DESC',
      page = 1,
      limit = 20,
    } = filters;

    const queryBuilder = this.transactionRepo
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId });

    // Text search in note
    if (query) {
      queryBuilder.andWhere('transaction.note LIKE :query', {
        query: `%${query}%`,
      });
    }

    // Filter by type
    if (type) {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }

    // Filter by category
    if (categoryId) {
      queryBuilder.andWhere('transaction.categoryId = :categoryId', {
        categoryId,
      });
    }

    // Filter by amount range
    if (minAmount !== undefined) {
      queryBuilder.andWhere('transaction.amount >= :minAmount', { minAmount });
    }
    if (maxAmount !== undefined) {
      queryBuilder.andWhere('transaction.amount <= :maxAmount', { maxAmount });
    }

    // Filter by date range
    if (startDate) {
      queryBuilder.andWhere('transaction.date >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('transaction.date <= :endDate', { endDate });
    }

    // Sorting
    queryBuilder.orderBy(`transaction.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [transactions, total] = await queryBuilder.getManyAndCount();

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async advancedSearch(userId: number, searchParams: any): Promise<any> {
    const results: {
      transactions: Transaction[];
      budgets: Budget[];
      categories: Category[];
      summary: {
        totalResults: number;
        transactionCount: number;
        budgetCount: number;
        categoryCount: number;
      };
    } = {
      transactions: [],
      budgets: [],
      categories: [],
      summary: {
        totalResults: 0,
        transactionCount: 0,
        budgetCount: 0,
        categoryCount: 0,
      },
    };

    const { query } = searchParams;

    // Search transactions
    if (query) {
      const transactions = await this.transactionRepo.find({
        where: [
          { userId, note: Like(`%${query}%`) },
        ],
        take: 10,
        order: { date: 'DESC' },
      });
      results.transactions = transactions;
      results.summary.transactionCount = transactions.length;
    }

    // Search categories
    const categories = await this.categoryRepo.find({
      where: { name: Like(`%${query}%`) },
      take: 5,
    });
    results.categories = categories;
    results.summary.categoryCount = categories.length;

    results.summary.totalResults =
      results.summary.transactionCount +
      results.summary.budgetCount +
      results.summary.categoryCount;

    return results;
  }

  async getFilterOptions(userId: number): Promise<any> {
    // Get available categories
    const categories = await this.categoryRepo.find();

    // Get date range
    const oldestTransaction = await this.transactionRepo.findOne({
      where: { userId },
      order: { date: 'ASC' },
    });

    const newestTransaction = await this.transactionRepo.findOne({
      where: { userId },
      order: { date: 'DESC' },
    });

    // Get amount range
    const amountStats = await this.transactionRepo
      .createQueryBuilder('transaction')
      .select('MIN(transaction.amount)', 'min')
      .addSelect('MAX(transaction.amount)', 'max')
      .where('transaction.userId = :userId', { userId })
      .getRawOne();

    return {
      categories: categories.map((c) => ({ id: c.id, name: c.name })),
      dateRange: {
        min: oldestTransaction?.date || new Date(),
        max: newestTransaction?.date || new Date(),
      },
      amountRange: {
        min: amountStats?.min || 0,
        max: amountStats?.max || 0,
      },
      types: ['income', 'expense'],
      sortOptions: [
        { value: 'date', label: 'Date' },
        { value: 'amount', label: 'Amount' },
        { value: 'createdAt', label: 'Created At' },
      ],
    };
  }
}
