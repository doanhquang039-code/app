import { Repository } from 'typeorm';
import { Investment, InvestmentTransaction } from '../../entities/investment.entity';
export declare class InvestmentsService {
    private investmentRepo;
    private txRepo;
    constructor(investmentRepo: Repository<Investment>, txRepo: Repository<InvestmentTransaction>);
    findAll(userId: number): Promise<Investment[]>;
    findOne(id: number, userId: number): Promise<Investment | null>;
    create(userId: number, data: Partial<Investment>): Promise<Investment>;
    update(id: number, userId: number, data: Partial<Investment>): Promise<Investment>;
    remove(id: number, userId: number): Promise<void>;
    getPortfolioSummary(userId: number): Promise<{
        totalInvested: number;
        totalCurrentValue: number;
        totalProfitLoss: number;
        profitLossPercentage: number;
        holdingCount: number;
        soldCount: number;
        byType: {};
    }>;
    getTransactions(investmentId: number, userId: number): Promise<InvestmentTransaction[]>;
    addTransaction(investmentId: number, userId: number, data: Partial<InvestmentTransaction>): Promise<InvestmentTransaction>;
}
