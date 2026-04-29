import { Repository } from 'typeorm';
import { UserPoints } from '../../entities/user-points.entity';
import { PointsHistory } from '../../entities/points-history.entity';
import { Achievement } from '../../entities/achievement.entity';
import { UserAchievement } from '../../entities/user-achievement.entity';
export declare class GamificationService {
    private userPointsRepo;
    private pointsHistoryRepo;
    private achievementRepo;
    private userAchievementRepo;
    private readonly POINTS_CONFIG;
    private readonly RANK_THRESHOLDS;
    constructor(userPointsRepo: Repository<UserPoints>, pointsHistoryRepo: Repository<PointsHistory>, achievementRepo: Repository<Achievement>, userAchievementRepo: Repository<UserAchievement>);
    initializeUserPoints(userId: number): Promise<UserPoints>;
    awardPoints(userId: number, action: string, description?: string, metadata?: any): Promise<{
        points: number;
        levelUp: boolean;
        newLevel?: number;
    }>;
    private calculateNextLevelPoints;
    private calculateRank;
    updateDailyStreak(userId: number): Promise<{
        streak: number;
        pointsAwarded: number;
    }>;
    getUserStats(userId: number): Promise<any>;
    getLeaderboard(limit?: number): Promise<any[]>;
    getPointsHistory(userId: number, limit?: number): Promise<PointsHistory[]>;
    seedAchievements(): Promise<void>;
    checkAchievements(userId: number): Promise<void>;
    private calculateAchievementProgress;
    getUserAchievements(userId: number): Promise<any[]>;
    getAllAchievements(): Promise<Achievement[]>;
}
