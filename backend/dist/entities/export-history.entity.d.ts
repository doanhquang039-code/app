import { User } from './user.entity';
export declare class ExportHistory {
    id: number;
    userId: number;
    user: User;
    exportType: string;
    fileName: string;
    filePath: string;
    dataType: string;
    startDate: Date;
    endDate: Date;
    recordCount: number;
    fileSize: number;
    status: string;
    errorMessage: string;
    createdAt: Date;
    expiresAt: Date;
}
