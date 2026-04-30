import { Repository } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';
export declare class TransactionResolver {
    private transactionRepo;
    constructor(transactionRepo: Repository<Transaction>);
    getTransactions(userId: number, type?: string, startDate?: Date, endDate?: Date, limit?: number, offset?: number): Promise<{
        edges: {
            node: Transaction;
            cursor: string;
        }[];
        pageInfo: {
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor: string | null;
            endCursor: string | null;
        };
        totalCount: number;
    }>;
    getTransaction(id: number): Promise<Transaction | null>;
    createTransaction(input: any): Promise<Transaction[]>;
    updateTransaction(id: number, input: any): Promise<Transaction | null>;
    deleteTransaction(id: number): Promise<boolean>;
    transactionCreated(userId: number): AsyncIterator<unknown, any, any>;
    transactionUpdated(userId: number): AsyncIterator<unknown, any, any>;
    transactionDeleted(userId: number): AsyncIterator<unknown, any, any>;
}
