import { User } from './user.entity';
export declare class BankAccount {
    id: number;
    userId: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    accountType: string;
    balance: number;
    branchCode: string;
    ifscCode: string;
    routingNumber: string;
    swiftCode: string;
    icon: string;
    isActive: boolean;
    linkedWalletId: number;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
