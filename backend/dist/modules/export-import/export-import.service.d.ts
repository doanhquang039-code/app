import { Repository } from 'typeorm';
import { ExportHistory } from '../../entities/export-history.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Budget } from '../../entities/budget.entity';
import { SavingsGoal } from '../../entities/savings-goal.entity';
import { BillReminder } from '../../entities/bill-reminder.entity';
import { ExportDataDto, DataType } from './dto/export-data.dto';
export declare class ExportImportService {
    private exportHistoryRepo;
    private transactionRepo;
    private budgetRepo;
    private savingsGoalRepo;
    private billReminderRepo;
    constructor(exportHistoryRepo: Repository<ExportHistory>, transactionRepo: Repository<Transaction>, budgetRepo: Repository<Budget>, savingsGoalRepo: Repository<SavingsGoal>, billReminderRepo: Repository<BillReminder>);
    exportData(userId: number, dto: ExportDataDto): Promise<ExportHistory>;
    private getTransactionsData;
    private getBudgetsData;
    private getSavingsGoalsData;
    private getBillsData;
    private getAllData;
    private generateExcel;
    private addTransactionsSheet;
    private addBudgetsSheet;
    private addSavingsGoalsSheet;
    private addBillsSheet;
    private generateCSV;
    private generateJSON;
    private generatePDF;
    getExportHistory(userId: number): Promise<ExportHistory[]>;
    downloadExport(userId: number, exportId: number): Promise<{
        filePath: string;
        fileName: string;
    }>;
    cleanupOldExports(): Promise<number>;
    importData(userId: number, file: Express.Multer.File, dataType: DataType): Promise<any>;
    private parseCSV;
    private parseExcel;
    private importTransactions;
}
