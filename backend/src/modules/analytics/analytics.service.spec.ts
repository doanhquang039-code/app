import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnalyticsData, SpendingForecast } from '../../entities/analytics.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Category } from '../../entities/category.entity';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  const mockAnalyticsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockForecastRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockTransactionRepository = {
    find: jest.fn(),
  };

  const mockCategoryRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(AnalyticsData),
          useValue: mockAnalyticsRepository,
        },
        {
          provide: getRepositoryToken(SpendingForecast),
          useValue: mockForecastRepository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateDailyAnalytics', () => {
    it('should generate daily analytics', async () => {
      const userId = 1;
      const date = new Date('2026-04-09');

      mockTransactionRepository.find.mockResolvedValue([
        { userId, type: 'income', amount: 1000, categoryId: 1, date: new Date('2026-04-09') },
        { userId, type: 'expense', amount: 300, categoryId: 2, date: new Date('2026-04-09') },
      ]);

      mockAnalyticsRepository.create.mockReturnValue({
        userId,
        date,
        totalIncome: 1000,
        totalExpense: 300,
        savingsAmount: 700,
      });

      mockAnalyticsRepository.save.mockResolvedValue({
        id: 1,
        userId,
        date,
        totalIncome: 1000,
        totalExpense: 300,
        savingsAmount: 700,
      });

      const result = await service.generateDailyAnalytics(userId, date);

      expect(result).toBeDefined();
      expect(result.totalIncome).toBe(1000);
      expect(result.totalExpense).toBe(300);
    });
  });

  describe('createForecast', () => {
    it('should create a spending forecast', async () => {
      const userId = 1;
      const forecastDto = {
        categoryId: 2,
        month: 4,
        year: 2026,
        predictedAmount: 500,
        confidence: 85,
      };

      mockForecastRepository.create.mockReturnValue(forecastDto);
      mockForecastRepository.save.mockResolvedValue({ id: 1, ...forecastDto });

      const result = await service.createForecast(userId, forecastDto);

      expect(result).toBeDefined();
      expect(result.predictedAmount).toBe(500);
      expect(mockForecastRepository.create).toHaveBeenCalled();
    });
  });

  describe('getSpendingTrend', () => {
    it('should get spending trend for last 7 days', async () => {
      const userId = 1;

      mockTransactionRepository.find.mockResolvedValue([
        { userId, type: 'expense', amount: 100, date: new Date('2026-04-09') },
        { userId, type: 'expense', amount: 150, date: new Date('2026-04-08') },
      ]);

      const result = await service.getSpendingTrend(userId, 7);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });
});
