import { Repository } from 'typeorm';
import { RecurringTransaction } from '../../entities/recurring-transaction.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Wallet } from '../../entities/wallet.entity';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';
import { QueryRecurringTransactionDto } from './dto/query-recurring-transaction.dto';
export declare class RecurringTransactionsService {
    private recurringRepository;
    private transactionRepository;
    private walletRepository;
    constructor(recurringRepository: Repository<RecurringTransaction>, transactionRepository: Repository<Transaction>, walletRepository: Repository<Wallet>);
    create(userId: number, dto: CreateRecurringTransactionDto): Promise<RecurringTransaction>;
    findAll(userId: number, query: QueryRecurringTransactionDto): Promise<RecurringTransaction[]>;
    findOne(userId: number, id: number): Promise<RecurringTransaction>;
    update(userId: number, id: number, dto: UpdateRecurringTransactionDto): Promise<RecurringTransaction>;
    remove(userId: number, id: number): Promise<{
        message: string;
    }>;
    toggleActive(userId: number, id: number, isActive: boolean): Promise<RecurringTransaction>;
    executeRecurringTransactions(): Promise<void>;
    private calculateNextExecution;
    private updateWalletBalance;
}
