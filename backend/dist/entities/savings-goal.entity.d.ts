import { User } from './user.entity';
import { Wallet } from './wallet.entity';
export declare class SavingsGoal {
    id: number;
    userId: number;
    walletId: number;
    name: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
    icon: string;
    startDate: Date;
    targetDate: Date | null;
    status: string;
    progressPercentage: number;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    wallet: Wallet;
}
