import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
export declare class MLService {
    private transactionRepo;
    constructor(transactionRepo: Repository<Transaction>);
    predictNextMonthSpending(userId: number): Promise<number>;
    analyzeSpendingTrend(userId: number, months?: number): Promise<any>;
    identifySpendingPatterns(userId: number): Promise<any[]>;
    detectAnomalies(userId: number): Promise<any[]>;
    private groupByMonth;
    private linearRegression;
    private calculateTrend;
    private detectSeasonality;
    private calculateVolatility;
    private forecastNextMonths;
    private clusterTransactions;
    private calculateStatistics;
    private getMostCommon;
}
