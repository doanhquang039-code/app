import { GamificationService } from './gamification.service';
export declare class GamificationController {
    private readonly gamificationService;
    constructor(gamificationService: GamificationService);
    getStats(req: any): Promise<import("./gamification.service").UserStats>;
    getLeaderboard(limit?: number): Promise<{
        rank: number;
        userId: number;
        username: string;
        points: number;
        level: number;
        badges: number;
    }[]>;
    checkAchievements(req: any): Promise<import("./gamification.service").Achievement[]>;
}
