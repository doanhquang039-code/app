import { Repository } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { Budget } from '../../entities/budget.entity';
import { Category } from '../../entities/category.entity';
export declare class SearchService {
    private transactionRepo;
    private budgetRepo;
    private categoryRepo;
    constructor(transactionRepo: Repository<Transaction>, budgetRepo: Repository<Budget>, categoryRepo: Repository<Category>);
    searchTransactions(userId: number, filters: any): Promise<any>;
    advancedSearch(userId: number, searchParams: any): Promise<any>;
    getFilterOptions(userId: number): Promise<any>;
}
