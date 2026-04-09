export declare class CreateCurrencyDto {
    code: string;
    name: string;
    symbol: string;
    exchangeRate: number;
    icon?: string;
}
export declare class UpdateExchangeRateDto {
    exchangeRate: number;
}
export declare class CreateMultiWalletDto {
    walletId: number;
    currencyCode: string;
    balance?: number;
}
