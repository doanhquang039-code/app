import { Transaction } from './transaction.entity';
import { User } from './user.entity';
export declare class TransactionAttachment {
    id: number;
    transactionId: number;
    userId: number;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    thumbnailUrl: string;
    description: string;
    createdAt: Date;
    transaction: Transaction;
    user: User;
}
