import { Repository } from 'typeorm';
import { Debt, DebtPayment } from '../../entities/debt.entity';
export declare class DebtsService {
    private debtRepo;
    private paymentRepo;
    constructor(debtRepo: Repository<Debt>, paymentRepo: Repository<DebtPayment>);
    findAll(userId: number): Promise<Debt[]>;
    findOne(id: number, userId: number): Promise<Debt | null>;
    create(userId: number, data: Partial<Debt>): Promise<Debt>;
    update(id: number, userId: number, data: Partial<Debt>): Promise<Debt>;
    remove(id: number, userId: number): Promise<void>;
    getSummary(userId: number): Promise<{
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
    getPayments(debtId: number, userId: number): Promise<DebtPayment[]>;
    addPayment(debtId: number, userId: number, data: Partial<DebtPayment>): Promise<DebtPayment>;
}
