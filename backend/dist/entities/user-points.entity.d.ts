import { User } from './user.entity';
export declare class UserPoints {
    id: number;
    userId: number;
    user: User;
    totalPoints: number;
    level: number;
    currentLevelPoints: number;
    nextLevelPoints: number;
    dailyStreak: number;
    longestStreak: number;
    lastActivityDate: Date;
    rank: string;
    createdAt: Date;
    updatedAt: Date;
}
