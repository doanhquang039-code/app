import { Repository } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
export declare class TransactionsService {
    private transactionRepository;
    constructor(transactionRepository: Repository<Transaction>);
    create(userId: number, dto: CreateTransactionDto): Promise<Transaction>;
    findAll(userId: number, query: QueryTransactionDto): Promise<Transaction[]>;
    findOne(userId: number, id: number): Promise<Transaction>;
    update(userId: number, id: number, dto: UpdateTransactionDto): Promise<Transaction>;
    remove(userId: number, id: number): Promise<{
        message: string;
    }>;
    getSummary(userId: number, month: string): Promise<{
        income: any;
        expense: any;
        balance: number;
    }>;
}
