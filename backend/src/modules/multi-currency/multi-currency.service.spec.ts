import { Test, TestingModule } from '@nestjs/testing';
import { MultiCurrencyService } from './multi-currency.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Currency, MultiCurrencyWallet, ExchangeRateHistory } from '../../entities/multi-currency.entity';

describe('MultiCurrencyService', () => {
  let service: MultiCurrencyService;

  const mockCurrencyRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockMultiWalletRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockExchangeHistoryRepository = {
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MultiCurrencyService,
        {
          provide: getRepositoryToken(Currency),
          useValue: mockCurrencyRepository,
        },
        {
          provide: getRepositoryToken(MultiCurrencyWallet),
          useValue: mockMultiWalletRepository,
        },
        {
          provide: getRepositoryToken(ExchangeRateHistory),
          useValue: mockExchangeHistoryRepository,
        },
      ],
    }).compile();

    service = module.get<MultiCurrencyService>(MultiCurrencyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCurrency', () => {
    it('should create a currency', async () => {
      const currencyDto = {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        exchangeRate: 1,
      };

      mockCurrencyRepository.create.mockReturnValue(currencyDto);
      mockCurrencyRepository.save.mockResolvedValue({ id: 1, ...currencyDto });

      const result = await service.createCurrency(currencyDto);

      expect(result).toBeDefined();
      expect(result.code).toBe('USD');
    });
  });

  describe('convertCurrency', () => {
    it('should convert currency', async () => {
      const usd = { code: 'USD', exchangeRate: 1 };
      const eur = { code: 'EUR', exchangeRate: 0.92 };

      mockCurrencyRepository.findOne
        .mockResolvedValueOnce(usd)
        .mockResolvedValueOnce(eur);

      const result = await service.convertCurrency(100, 'USD', 'EUR');

      expect(result).toBeDefined();
      expect(result.amount).toBe(100);
      expect(result.fromCurrency).toBe('USD');
      expect(result.toCurrency).toBe('EUR');
    });

    it('should return same amount when converting same currency', async () => {
      const result = await service.convertCurrency(100, 'USD', 'USD');

      expect(result.convertedAmount).toBe(100);
      expect(result.rate).toBe(1);
    });
  });

  describe('createMultiCurrencyWallet', () => {
    it('should create a multi-currency wallet entry', async () => {
      const userId = 1;
      const walletDto = {
        walletId: 1,
        currencyCode: 'USD',
        balance: 1000,
      };

      mockMultiWalletRepository.create.mockReturnValue(walletDto);
      mockMultiWalletRepository.save.mockResolvedValue({ id: 1, userId, ...walletDto });

      const result = await service.createMultiCurrencyWallet(userId, walletDto);

      expect(result).toBeDefined();
      expect(result.currencyCode).toBe('USD');
      expect(result.balance).toBe(1000);
    });
  });

  describe('getTotalWalletBalanceInUSD', () => {
    it('should calculate total balance in USD', async () => {
      const userId = 1;
      const walletId = 1;

      mockMultiWalletRepository.find.mockResolvedValue([
        { currencyCode: 'USD', balance: 1000 },
        { currencyCode: 'EUR', balance: 500 },
      ]);

      mockCurrencyRepository.findOne
        .mockResolvedValueOnce({ code: 'USD', exchangeRate: 1 })
        .mockResolvedValueOnce({ code: 'EUR', exchangeRate: 0.92 });

      const result = await service.getTotalWalletBalanceInUSD(userId, walletId);

      expect(result).toBeDefined();
      expect(typeof result).toBe('number');
    });
  });
});
