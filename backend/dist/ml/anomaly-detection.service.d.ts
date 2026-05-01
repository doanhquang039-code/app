import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
export declare class AnomalyDetectionService {
    private transactionRepo;
    constructor(transactionRepo: Repository<Transaction>);
    detectFraudulentTransactions(userId: number): Promise<any[]>;
    detectUnusualSpending(userId: number): Promise<any[]>;
    detectDuplicateTransactions(userId: number): Promise<any[]>;
    private calculateFraudScore;
    private getFraudReasons;
    private areSimilar;
    private calculateSimilarity;
    private calculateStats;
}
