import { Repository } from 'typeorm';
import { Currency, MultiCurrencyWallet, ExchangeRateHistory } from '../../entities/multi-currency.entity';
import { CreateCurrencyDto, CreateMultiWalletDto, UpdateExchangeRateDto } from './dto/multi-currency.dto';
export declare class MultiCurrencyService {
    private currencyRepository;
    private multiWalletRepository;
    private exchangeHistoryRepository;
    constructor(currencyRepository: Repository<Currency>, multiWalletRepository: Repository<MultiCurrencyWallet>, exchangeHistoryRepository: Repository<ExchangeRateHistory>);
    createCurrency(createCurrencyDto: CreateCurrencyDto): Promise<Currency>;
    getAllCurrencies(): Promise<Currency[]>;
    getCurrency(code: string): Promise<Currency | null>;
    updateExchangeRate(code: string, updateRateDto: UpdateExchangeRateDto): Promise<Currency>;
    createMultiCurrencyWallet(userId: number, createWalletDto: CreateMultiWalletDto): Promise<MultiCurrencyWallet>;
    getWalletCurrencies(userId: number, walletId: number): Promise<MultiCurrencyWallet[]>;
    updateWalletBalance(userId: number, walletId: number, currencyCode: string, newBalance: number): Promise<MultiCurrencyWallet>;
    convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<any>;
    convertToBaseCurrency(amount: number, currencyCode: string): Promise<number>;
    convertFromBaseCurrency(amount: number, currencyCode: string): Promise<number>;
    getTotalWalletBalanceInUSD(userId: number, walletId: number): Promise<number>;
    getTotalWalletBalanceInCurrency(userId: number, walletId: number, targetCurrency: string): Promise<number>;
    getExchangeRateHistory(fromCurrency: string, toCurrency: string, days?: number): Promise<ExchangeRateHistory[]>;
    getMultiCurrencyBalanceReport(userId: number, walletId: number): Promise<any>;
}
