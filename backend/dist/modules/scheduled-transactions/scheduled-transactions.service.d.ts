import { Repository } from 'typeorm';
import { ScheduledTransaction } from '../../entities/scheduled-transaction.entity';
import { Transaction } from '../../entities/transaction.entity';
export declare class ScheduledTransactionsService {
    private scheduledRepo;
    private transactionRepo;
    constructor(scheduledRepo: Repository<ScheduledTransaction>, transactionRepo: Repository<Transaction>);
    create(userId: number, data: any): Promise<ScheduledTransaction>;
    findAll(userId: number): Promise<ScheduledTransaction[]>;
    findOne(userId: number, id: number): Promise<ScheduledTransaction>;
    update(userId: number, id: number, data: any): Promise<ScheduledTransaction>;
    pause(userId: number, id: number): Promise<ScheduledTransaction>;
    resume(userId: number, id: number): Promise<ScheduledTransaction>;
    remove(userId: number, id: number): Promise<void>;
    getUpcoming(userId: number, days?: number): Promise<ScheduledTransaction[]>;
    executeNow(userId: number, id: number): Promise<Transaction>;
    private executeScheduled;
    processScheduledTransactions(): Promise<void>;
    private calculateNextExecution;
}
