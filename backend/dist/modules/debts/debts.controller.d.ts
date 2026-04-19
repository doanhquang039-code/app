import { DebtsService } from './debts.service';
export declare class DebtsController {
    private readonly service;
    constructor(service: DebtsService);
    findAll(req: any): Promise<import("../../entities/debt.entity").Debt[]>;
    getSummary(req: any): Promise<{
        totalLent: number;
        totalBorrowed: number;
        totalLentPaid: number;
        totalBorrowedPaid: number;
        remainingLent: number;
        remainingBorrowed: number;
        activeDebts: number;
        overdueDebts: number;
        totalDebts: number;
    }>;
    findOne(id: number, req: any): Promise<import("../../entities/debt.entity").Debt | null>;
    create(data: any, req: any): Promise<import("../../entities/debt.entity").Debt>;
    update(id: number, data: any, req: any): Promise<import("../../entities/debt.entity").Debt>;
    remove(id: number, req: any): Promise<void>;
    getPayments(id: number, req: any): Promise<import("../../entities/debt.entity").DebtPayment[]>;
    addPayment(id: number, data: any, req: any): Promise<import("../../entities/debt.entity").DebtPayment>;
}
