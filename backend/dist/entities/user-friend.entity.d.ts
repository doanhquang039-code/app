import { User } from './user.entity';
export declare class UserFriend {
    id: number;
    userId: number;
    user: User;
    friendId: number;
    friend: User;
    status: string;
    canViewTransactions: boolean;
    canViewBudgets: boolean;
    canViewGoals: boolean;
    createdAt: Date;
    acceptedAt: Date;
}
