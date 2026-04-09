import { Test, TestingModule } from '@nestjs/testing';
import { FinancialReportsService } from './financial-reports.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FinancialReport } from '../../entities/financial-report.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Budget } from '../../entities/budget.entity';

describe('FinancialReportsService', () => {
  let service: FinancialReportsService;

  const mockReportRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    delete: jest.fn(),
  };

  const mockTransactionRepository = {
    find: jest.fn(),
  };

  const mockBudgetRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialReportsService,
        {
          provide: getRepositoryToken(FinancialReport),
          useValue: mockReportRepository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(Budget),
          useValue: mockBudgetRepository,
        },
      ],
    }).compile();

    service = module.get<FinancialReportsService>(FinancialReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateMonthlyReport', () => {
    it('should generate a monthly report', async () => {
      const userId = 1;
      const month = 4;
      const year = 2026;

      mockTransactionRepository.find.mockResolvedValue([
        { userId, type: 'income', amount: 5000, categoryId: 1, date: new Date('2026-04-05') },
        { userId, type: 'expense', amount: 1500, categoryId: 2, date: new Date('2026-04-10') },
      ]);

      mockBudgetRepository.find.mockResolvedValue([]);

      mockReportRepository.create.mockReturnValue({
        userId,
        month,
        year,
        totalIncome: 5000,
        totalExpense: 1500,
        netSavings: 3500,
      });

      mockReportRepository.save.mockResolvedValue({
        id: 1,
        userId,
        month,
        year,
        totalIncome: 5000,
        totalExpense: 1500,
        netSavings: 3500,
      });

      const result = await service.generateMonthlyReport(userId, month, year);

      expect(result).toBeDefined();
      expect(result.totalIncome).toBe(5000);
      expect(result.totalExpense).toBe(1500);
      expect(result.netSavings).toBe(3500);
    });
  });

  describe('generateYearlyReport', () => {
    it('should generate a yearly report', async () => {
      const userId = 1;
      const year = 2026;

      mockTransactionRepository.find.mockResolvedValue([]);
      mockBudgetRepository.find.mockResolvedValue([]);

      mockReportRepository.create.mockReturnValue({
        userId,
        year,
        totalIncome: 0,
        totalExpense: 0,
      });

      mockReportRepository.save.mockResolvedValue({
        id: 1,
        userId,
        year,
        totalIncome: 0,
        totalExpense: 0,
      });

      const result = await service.generateYearlyReport(userId, year);

      expect(result).toBeDefined();
    });
  });

  describe('exportReportAsJSON', () => {
    it('should export report as JSON', async () => {
      const reportId = 1;
      const userId = 1;

      mockReportRepository.findOne.mockResolvedValue({
        id: reportId,
        userId,
        month: 4,
        year: 2026,
        reportType: 'MONTHLY',
        reportData: JSON.stringify({
          totalIncome: 5000,
          totalExpense: 1500,
        }),
        createdAt: new Date(),
      });

      const result = await service.exportReportAsJSON(reportId, userId);

      expect(result).toBeDefined();
      expect(result.totalIncome).toBe(5000);
    });
  });
});
