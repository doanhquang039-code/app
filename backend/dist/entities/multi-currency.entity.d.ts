import { User } from './user.entity';
import { Wallet } from './wallet.entity';
export declare class Currency {
    id: number;
    code: string;
    name: string;
    symbol: string;
    exchangeRate: number;
    icon: string;
    isActive: boolean;
    createdAt: Date;
}
export declare class MultiCurrencyWallet {
    id: number;
    userId: number;
    walletId: number;
    currencyCode: string;
    balance: number;
    createdAt: Date;
    user: User;
    wallet: Wallet;
}
export declare class ExchangeRateHistory {
    id: number;
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    date: Date;
    createdAt: Date;
}
