import { MultiCurrencyService } from './multi-currency.service';
import { CreateCurrencyDto, CreateMultiWalletDto, UpdateExchangeRateDto } from './dto/multi-currency.dto';
export declare class MultiCurrencyController {
    private readonly multiCurrencyService;
    constructor(multiCurrencyService: MultiCurrencyService);
    getAllCurrencies(): Promise<import("../../entities/multi-currency.entity").Currency[]>;
    getCurrency(code: string): Promise<import("../../entities/multi-currency.entity").Currency | null>;
    createCurrency(createCurrencyDto: CreateCurrencyDto): Promise<import("../../entities/multi-currency.entity").Currency>;
    updateExchangeRate(code: string, updateRateDto: UpdateExchangeRateDto): Promise<import("../../entities/multi-currency.entity").Currency>;
    convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<any>;
    createMultiWallet(req: any, createWalletDto: CreateMultiWalletDto): Promise<import("../../entities/multi-currency.entity").MultiCurrencyWallet>;
    getWalletCurrencies(walletId: string, req: any): Promise<import("../../entities/multi-currency.entity").MultiCurrencyWallet[]>;
    updateWalletBalance(walletId: string, currencyCode: string, req: any, { balance }: {
        balance: number;
    }): Promise<import("../../entities/multi-currency.entity").MultiCurrencyWallet>;
    getTotalInUSD(walletId: string, req: any): Promise<{
        totalInUSD: number;
    }>;
    getTotalInCurrency(walletId: string, req: any, currency?: string): Promise<{
        [currency]: number;
    }>;
    getBalanceReport(walletId: string, req: any): Promise<any>;
    getExchangeHistory(fromCurrency: string, toCurrency: string, days?: number): Promise<import("../../entities/multi-currency.entity").ExchangeRateHistory[]>;
}
