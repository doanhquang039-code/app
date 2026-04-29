import { User } from './user.entity';
export declare class SpendingPattern {
    id: number;
    userId: number;
    user: User;
    patternType: string;
    category: string;
    averageAmount: number;
    minAmount: number;
    maxAmount: number;
    frequency: number;
    timePattern: string;
    dayOfWeek: number;
    dayOfMonth: number;
    confidence: number;
    insights: string;
    periodStart: Date;
    periodEnd: Date;
    occurrences: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
