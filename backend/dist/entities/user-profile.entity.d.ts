import { User } from './user.entity';
export declare class UserProfile {
    id: number;
    userId: number;
    avatarUrl: string;
    phoneNumber: string;
    dateOfBirth: Date;
    gender: string;
    address: string;
    city: string;
    country: string;
    defaultCurrency: string;
    language: string;
    timezone: string;
    monthlyIncomeTarget: number;
    monthlyExpenseLimit: number;
    notificationEnabled: boolean;
    emailNotification: boolean;
    darkMode: boolean;
    biometricEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
