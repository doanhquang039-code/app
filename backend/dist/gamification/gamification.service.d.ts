import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    earnedAt?: Date;
}
export interface Achievement {
    id: string;
    title: string;
    description: string;
    progress: number;
    target: number;
    reward: number;
    completed: boolean;
}
export interface UserStats {
    level: number;
    points: number;
    nextLevelPoints: number;
    badges: Badge[];
    achievements: Achievement[];
    streak: number;
    rank: number;
    totalUsers: number;
}
export declare class GamificationService {
    private userRepo;
    constructor(userRepo: Repository<User>);
    private readonly BADGES;
    getUserStats(userId: number): Promise<UserStats>;
    getLeaderboard(limit?: number): Promise<{
        rank: number;
        userId: number;
        username: string;
        points: number;
        level: number;
        badges: number;
    }[]>;
    awardBadge(userId: number, badgeId: string): Promise<Badge>;
    addPoints(userId: number, points: number): Promise<number>;
    checkAchievements(userId: number): Promise<Achievement[]>;
}
