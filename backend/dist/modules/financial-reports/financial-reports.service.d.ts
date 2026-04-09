import { Repository } from 'typeorm';
import { FinancialReport } from '../../entities/financial-report.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Budget } from '../../entities/budget.entity';
export declare class FinancialReportsService {
    private reportRepository;
    private transactionRepository;
    private budgetRepository;
    constructor(reportRepository: Repository<FinancialReport>, transactionRepository: Repository<Transaction>, budgetRepository: Repository<Budget>);
    generateMonthlyReport(userId: number, month: number, year: number): Promise<FinancialReport>;
    generateQuarterlyReport(userId: number, quarter: number, year: number): Promise<FinancialReport>;
    generateYearlyReport(userId: number, year: number): Promise<FinancialReport>;
    getReport(reportId: number, userId: number): Promise<FinancialReport | null>;
    getReportsByUser(userId: number, reportType?: string): Promise<FinancialReport[]>;
    deleteReport(reportId: number, userId: number): Promise<void>;
    exportReportAsJSON(reportId: number, userId: number): Promise<any>;
    exportReportAsCSV(reportId: number, userId: number): Promise<string>;
    private getCategoryBreakdown;
    private getBudgetStatus;
    private getTopCategories;
}
