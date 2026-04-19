import { Repository } from 'typeorm';
import { NetWorthSnapshot } from '../../entities/net-worth-snapshot.entity';
import { Wallet } from '../../entities/wallet.entity';
import { BankAccount } from '../../entities/bank-account.entity';
import { CreditCard } from '../../entities/credit-card.entity';
import { Investment } from '../../entities/investment.entity';
import { Debt } from '../../entities/debt.entity';
export declare class NetWorthService {
    private snapshotRepo;
    private walletRepo;
    private bankRepo;
    private cardRepo;
    private investmentRepo;
    private debtRepo;
    constructor(snapshotRepo: Repository<NetWorthSnapshot>, walletRepo: Repository<Wallet>, bankRepo: Repository<BankAccount>, cardRepo: Repository<CreditCard>, investmentRepo: Repository<Investment>, debtRepo: Repository<Debt>);
    computeBreakdown(userId: number): Promise<{
        walletTotal: number;
        bankTotal: number;
        investmentTotal: number;
        receivablesTotal: number;
        borrowingsTotal: number;
        creditCardDebtTotal: number;
        netWorth: number;
        currency: "VND";
    }>;
    captureSnapshot(userId: number, note?: string): Promise<NetWorthSnapshot>;
    findRange(userId: number, from?: string, to?: string): Promise<NetWorthSnapshot[]>;
    findLatest(userId: number, take?: number): Promise<NetWorthSnapshot[]>;
}
