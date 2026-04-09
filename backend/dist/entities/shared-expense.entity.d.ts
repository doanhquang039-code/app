import { User } from './user.entity';
export declare class SharedExpenseGroup {
    id: number;
    groupName: string;
    ownerId: number;
    description: string;
    totalAmount: number;
    icon: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    owner: User;
    members: User[];
}
export declare class SharedExpense {
    id: number;
    groupId: number;
    paidByUserId: number;
    description: string;
    amount: number;
    splits: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
    group: SharedExpenseGroup;
    paidByUser: User;
}
export declare class GroupSettlement {
    id: number;
    groupId: number;
    fromUserId: number;
    toUserId: number;
    amount: number;
    isSettled: boolean;
    settledDate: Date;
    createdAt: Date;
    updatedAt: Date;
    group: SharedExpenseGroup;
}
