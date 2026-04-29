import { User } from './user.entity';
import { Achievement } from './achievement.entity';
export declare class UserAchievement {
    id: number;
    userId: number;
    user: User;
    achievementId: number;
    achievement: Achievement;
    progress: number;
    isUnlocked: boolean;
    unlockedAt: Date;
    isNotified: boolean;
    createdAt: Date;
}
