import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
export declare class ExportService {
    private transactionRepo;
    constructor(transactionRepo: Repository<Transaction>);
    exportToExcel(userId: number, startDate: Date, endDate: Date): Promise<Buffer>;
    exportToPDF(userId: number, startDate: Date, endDate: Date): Promise<Buffer>;
    exportToCSV(userId: number, startDate: Date, endDate: Date): Promise<string>;
}
