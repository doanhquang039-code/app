import { Repository } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';
export declare class ReportsService {
    private transactionRepo;
    constructor(transactionRepo: Repository<Transaction>);
    getTransactions(userId: number, from: string, to: string): Promise<Transaction[]>;
    exportExcel(userId: number, from: string, to: string): Promise<Buffer>;
    exportPdf(userId: number, from: string, to: string): Promise<Buffer>;
}
