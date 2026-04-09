import { User } from './user.entity';
export declare class FinancialReport {
    id: number;
    userId: number;
    month: number;
    year: number;
    reportType: string;
    reportData: string;
    totalIncome: number;
    totalExpense: number;
    netSavings: number;
    filePath: string;
    status: string;
    createdAt: Date;
    user: User;
}
