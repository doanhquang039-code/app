import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency, MultiCurrencyWallet, ExchangeRateHistory } from '../../entities/multi-currency.entity';
import { CreateCurrencyDto, CreateMultiWalletDto, UpdateExchangeRateDto } from './dto/multi-currency.dto';

@Injectable()
export class MultiCurrencyService {
  constructor(
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,
    @InjectRepository(MultiCurrencyWallet)
    private multiWalletRepository: Repository<MultiCurrencyWallet>,
    @InjectRepository(ExchangeRateHistory)
    private exchangeHistoryRepository: Repository<ExchangeRateHistory>,
  ) {}

  // Currency Management
  async createCurrency(createCurrencyDto: CreateCurrencyDto): Promise<Currency> {
    const currency = this.currencyRepository.create(createCurrencyDto);
    return this.currencyRepository.save(currency);
  }

  async getAllCurrencies(): Promise<Currency[]> {
    return this.currencyRepository.find({
      where: { isActive: true },
      order: { code: 'ASC' },
    });
  }

  async getCurrency(code: string): Promise<Currency | null> {
    return this.currencyRepository.findOne({
      where: { code },
    });
  }

  async updateExchangeRate(code: string, updateRateDto: UpdateExchangeRateDto): Promise<Currency> {
    const currency = await this.currencyRepository.findOne({ where: { code } });
    if (!currency) throw new Error('Currency not found');

    const oldRate = currency.exchangeRate;
    currency.exchangeRate = updateRateDto.exchangeRate;

    // Record history
    await this.exchangeHistoryRepository.save({
      fromCurrency: code,
      toCurrency: 'USD',
      rate: updateRateDto.exchangeRate,
      date: new Date(),
    } as any);

    return this.currencyRepository.save(currency);
  }

  // Multi-Currency Wallet
  async createMultiCurrencyWallet(userId: number, createWalletDto: CreateMultiWalletDto): Promise<MultiCurrencyWallet> {
    const wallet = this.multiWalletRepository.create({
      ...createWalletDto,
      userId,
    });
    return this.multiWalletRepository.save(wallet);
  }

  async getWalletCurrencies(userId: number, walletId: number): Promise<MultiCurrencyWallet[]> {
    return this.multiWalletRepository.find({
      where: { userId, walletId },
    });
  }

  async updateWalletBalance(userId: number, walletId: number, currencyCode: string, newBalance: number): Promise<MultiCurrencyWallet> {
    let wallet = await this.multiWalletRepository.findOne({
      where: { userId, walletId, currencyCode },
    });

    if (!wallet) {
      wallet = this.multiWalletRepository.create({
        userId,
        walletId,
        currencyCode,
        balance: newBalance,
      });
    } else {
      wallet.balance = newBalance;
    }

    return this.multiWalletRepository.save(wallet);
  }

  // Currency Conversion
  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<any> {
    if (fromCurrency === toCurrency) {
      return { amount, fromCurrency, toCurrency, convertedAmount: amount, rate: 1 };
    }

    const from = await this.getCurrency(fromCurrency);
    const to = await this.getCurrency(toCurrency);

    if (!from || !to) throw new Error('Invalid currency code');

    // Convert to USD first, then to target currency
    const usdAmount = amount / Number(from.exchangeRate);
    const convertedAmount = usdAmount * Number(to.exchangeRate);

    const rate = Number(to.exchangeRate) / Number(from.exchangeRate);

    return {
      amount,
      fromCurrency,
      toCurrency,
      convertedAmount,
      rate,
      timestamp: new Date(),
    };
  }

  async convertToBaseCurrency(amount: number, currencyCode: string): Promise<number> {
    const currency = await this.getCurrency(currencyCode);
    if (!currency) throw new Error('Currency not found');

    return amount / Number(currency.exchangeRate);
  }

  async convertFromBaseCurrency(amount: number, currencyCode: string): Promise<number> {
    const currency = await this.getCurrency(currencyCode);
    if (!currency) throw new Error('Currency not found');

    return amount * Number(currency.exchangeRate);
  }

  // Multi-Currency Balance
  async getTotalWalletBalanceInUSD(userId: number, walletId: number): Promise<number> {
    const wallets = await this.getWalletCurrencies(userId, walletId);
    let totalUSD = 0;

    for (const wallet of wallets) {
      const currency = await this.getCurrency(wallet.currencyCode);
      if (currency) {
        const usdAmount = await this.convertToBaseCurrency(Number(wallet.balance), wallet.currencyCode);
        totalUSD += usdAmount;
      }
    }

    return totalUSD;
  }

  async getTotalWalletBalanceInCurrency(userId: number, walletId: number, targetCurrency: string): Promise<number> {
    const totalUSD = await this.getTotalWalletBalanceInUSD(userId, walletId);
    return this.convertFromBaseCurrency(totalUSD, targetCurrency);
  }

  // Exchange Rate History
  async getExchangeRateHistory(fromCurrency: string, toCurrency: string, days: number = 30): Promise<ExchangeRateHistory[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.exchangeHistoryRepository.find({
      where: {
        fromCurrency,
        toCurrency,
      },
    });
  }

  // Report balances in multiple currencies
  async getMultiCurrencyBalanceReport(userId: number, walletId: number): Promise<any> {
    const wallets = await this.getWalletCurrencies(userId, walletId);
    const report = {
      walletId,
      currencies: {},
      totalInUSD: 0,
      totalInEUR: 0,
      totalInVND: 0,
    };

    for (const wallet of wallets) {
      const currency = await this.getCurrency(wallet.currencyCode);
      if (currency) {
        report.currencies[wallet.currencyCode] = {
          balance: Number(wallet.balance),
          currency: currency.name,
          symbol: currency.symbol,
        };

        // Calculate totals
        const usdAmount = await this.convertToBaseCurrency(Number(wallet.balance), wallet.currencyCode);
        report.totalInUSD += usdAmount;
      }
    }

    // Convert total to other major currencies
    report.totalInEUR = await this.convertFromBaseCurrency(report.totalInUSD, 'EUR');
    report.totalInVND = await this.convertFromBaseCurrency(report.totalInUSD, 'VND');

    return report;
  }
}
