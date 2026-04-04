import { User } from './user.entity';
import { Wallet } from './wallet.entity';
import { Category } from './category.entity';
export declare class RecurringTransaction {
    id: number;
    userId: number;
    walletId: number;
    categoryId: number;
    amount: number;
    type: string;
    note: string;
    frequency: string;
    frequencyDay: string;
    startDate: Date;
    endDate: Date | null;
    isActive: boolean;
    lastExecutedDate: Date;
    nextExecutionDate: Date;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    wallet: Wallet;
    category: Category;
}
