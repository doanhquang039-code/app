import { User } from './user.entity';
export declare class Investment {
    id: number;
    userId: number;
    name: string;
    type: string;
    symbol: string;
    quantity: number;
    buyPrice: number;
    currentPrice: number;
    totalInvested: number;
    currentValue: number;
    profitLoss: number;
    profitLossPercentage: number;
    currency: string;
    platform: string;
    buyDate: Date;
    sellDate: Date;
    status: string;
    notes: string;
    icon: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
export declare class InvestmentTransaction {
    id: number;
    investmentId: number;
    userId: number;
    type: string;
    quantity: number;
    price: number;
    totalAmount: number;
    fee: number;
    transactionDate: Date;
    note: string;
    createdAt: Date;
    investment: Investment;
    user: User;
}
