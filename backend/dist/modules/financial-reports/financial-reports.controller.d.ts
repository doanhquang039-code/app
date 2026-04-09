import { FinancialReportsService } from './financial-reports.service';
export declare class FinancialReportsController {
    private readonly reportsService;
    constructor(reportsService: FinancialReportsService);
    generateMonthly(req: any, month: number, year: number): Promise<import("../../entities/financial-report.entity").FinancialReport>;
    generateQuarterly(req: any, quarter: number, year: number): Promise<import("../../entities/financial-report.entity").FinancialReport>;
    generateYearly(req: any, year: number): Promise<import("../../entities/financial-report.entity").FinancialReport>;
    getReports(req: any, reportType?: string): Promise<import("../../entities/financial-report.entity").FinancialReport[]>;
    getReport(id: string, req: any): Promise<import("../../entities/financial-report.entity").FinancialReport | null>;
    exportAsJSON(id: string, req: any): Promise<any>;
    exportAsCSV(id: string, req: any): Promise<{
        csv: string;
    }>;
    deleteReport(id: string, req: any): Promise<void>;
}
