import { User } from './user.entity';
export declare class NetWorthSnapshot {
    id: number;
    userId: number;
    snapshotDate: Date;
    walletTotal: number;
    bankTotal: number;
    investmentTotal: number;
    receivablesTotal: number;
    borrowingsTotal: number;
    creditCardDebtTotal: number;
    netWorth: number;
    currency: string;
    note: string;
    createdAt: Date;
    user: User;
}
