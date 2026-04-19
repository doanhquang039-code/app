import { InvestmentsService } from './investments.service';
export declare class InvestmentsController {
    private readonly service;
    constructor(service: InvestmentsService);
    findAll(req: any): Promise<import("../../entities/investment.entity").Investment[]>;
    getPortfolio(req: any): Promise<{
        totalInvested: number;
        totalCurrentValue: number;
        totalProfitLoss: number;
        profitLossPercentage: number;
        holdingCount: number;
        soldCount: number;
        byType: {};
    }>;
    findOne(id: number, req: any): Promise<import("../../entities/investment.entity").Investment | null>;
    create(data: any, req: any): Promise<import("../../entities/investment.entity").Investment>;
    update(id: number, data: any, req: any): Promise<import("../../entities/investment.entity").Investment>;
    remove(id: number, req: any): Promise<void>;
    getTransactions(id: number, req: any): Promise<import("../../entities/investment.entity").InvestmentTransaction[]>;
    addTransaction(id: number, data: any, req: any): Promise<import("../../entities/investment.entity").InvestmentTransaction>;
}
