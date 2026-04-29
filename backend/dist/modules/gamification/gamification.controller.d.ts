import { GamificationService } from './gamification.service';
export declare class GamificationController {
    private readonly gamificationService;
    constructor(gamificationService: GamificationService);
    getUserStats(req: any): Promise<any>;
    updateDailyStreak(req: any): Promise<{
        success: boolean;
        streak: number;
        pointsAwarded: number;
        message: string;
    }>;
    getLeaderboard(limit?: number): Promise<{
        rank: number;
        userId: any;
        username: any;
        totalPoints: any;
        level: any;
        rankTitle: any;
        dailyStreak: any;
    }[]>;
    getPointsHistory(req: any, limit?: number): Promise<import("../../entities/points-history.entity").PointsHistory[]>;
    getUserAchievements(req: any): Promise<any[]>;
    getAllAchievements(): Promise<import("../../entities/achievement.entity").Achievement[]>;
    seedAchievements(): Promise<{
        success: boolean;
        message: string;
    }>;
    checkAchievements(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
