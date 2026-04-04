import { DuplicateDetectionService } from './duplicate-detection.service';
export declare class DuplicateDetectionController {
    private duplicateDetectionService;
    constructor(duplicateDetectionService: DuplicateDetectionService);
    detectDuplicates(req: any, timeDiffMinutes?: string, amountTolerance?: string): Promise<{
        totalDuplicateGroups: number;
        groups: {
            suspicionLevel: number;
            transactions: {
                id: number;
                amount: number;
                type: string;
                date: Date;
                category: string;
                wallet: string;
                note: string;
            }[];
        }[];
    }>;
    findSimilar(req: any, transactionId: string): Promise<{
        message: string;
        originalTransaction?: undefined;
        similarCount?: undefined;
        similarTransactions?: undefined;
    } | {
        originalTransaction: {
            id: number;
            amount: number;
            type: string;
            date: Date;
            category: string;
            wallet: string;
        };
        similarCount: number;
        similarTransactions: {
            id: number;
            amount: number;
            type: string;
            date: Date;
            category: string;
            wallet: string;
            note: string;
        }[];
        message?: undefined;
    }>;
}
