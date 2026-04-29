"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_points_entity_1 = require("../../entities/user-points.entity");
const points_history_entity_1 = require("../../entities/points-history.entity");
const achievement_entity_1 = require("../../entities/achievement.entity");
const user_achievement_entity_1 = require("../../entities/user-achievement.entity");
let GamificationService = class GamificationService {
    userPointsRepo;
    pointsHistoryRepo;
    achievementRepo;
    userAchievementRepo;
    POINTS_CONFIG = {
        TRANSACTION_ADDED: 5,
        BUDGET_CREATED: 10,
        BUDGET_COMPLETED: 20,
        SAVINGS_GOAL_CREATED: 15,
        SAVINGS_GOAL_ACHIEVED: 50,
        BILL_PAID_ON_TIME: 10,
        DAILY_LOGIN: 5,
        WEEKLY_STREAK: 25,
        MONTHLY_STREAK: 100,
        EXPORT_DATA: 5,
        PROFILE_COMPLETED: 20,
    };
    RANK_THRESHOLDS = [
        { rank: 'Người mới', minPoints: 0 },
        { rank: 'Đồng', minPoints: 100 },
        { rank: 'Bạc', minPoints: 500 },
        { rank: 'Vàng', minPoints: 1500 },
        { rank: 'Bạch kim', minPoints: 3000 },
        { rank: 'Kim cương', minPoints: 6000 },
        { rank: 'Huyền thoại', minPoints: 10000 },
    ];
    constructor(userPointsRepo, pointsHistoryRepo, achievementRepo, userAchievementRepo) {
        this.userPointsRepo = userPointsRepo;
        this.pointsHistoryRepo = pointsHistoryRepo;
        this.achievementRepo = achievementRepo;
        this.userAchievementRepo = userAchievementRepo;
    }
    async initializeUserPoints(userId) {
        const existing = await this.userPointsRepo.findOne({ where: { userId } });
        if (existing)
            return existing;
        const userPoints = this.userPointsRepo.create({
            userId,
            totalPoints: 0,
            level: 1,
            currentLevelPoints: 0,
            nextLevelPoints: 100,
            dailyStreak: 0,
            longestStreak: 0,
            rank: 'Người mới',
        });
        return await this.userPointsRepo.save(userPoints);
    }
    async awardPoints(userId, action, description, metadata) {
        const pointsToAward = this.POINTS_CONFIG[action] || 0;
        if (pointsToAward === 0) {
            return { points: 0, levelUp: false };
        }
        let userPoints = await this.userPointsRepo.findOne({ where: { userId } });
        if (!userPoints) {
            userPoints = await this.initializeUserPoints(userId);
        }
        userPoints.totalPoints += pointsToAward;
        userPoints.currentLevelPoints += pointsToAward;
        let levelUp = false;
        let newLevel = userPoints.level;
        while (userPoints.currentLevelPoints >= userPoints.nextLevelPoints) {
            levelUp = true;
            userPoints.currentLevelPoints -= userPoints.nextLevelPoints;
            userPoints.level += 1;
            newLevel = userPoints.level;
            userPoints.nextLevelPoints = this.calculateNextLevelPoints(userPoints.level);
        }
        userPoints.rank = this.calculateRank(userPoints.totalPoints);
        await this.userPointsRepo.save(userPoints);
        const historyEntry = this.pointsHistoryRepo.create({
            userId,
            points: pointsToAward,
            action,
            description,
            metadata: metadata ? JSON.stringify(metadata) : undefined,
        });
        await this.pointsHistoryRepo.save(historyEntry);
        await this.checkAchievements(userId);
        return { points: pointsToAward, levelUp, newLevel: levelUp ? newLevel : undefined };
    }
    calculateNextLevelPoints(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    }
    calculateRank(totalPoints) {
        for (let i = this.RANK_THRESHOLDS.length - 1; i >= 0; i--) {
            if (totalPoints >= this.RANK_THRESHOLDS[i].minPoints) {
                return this.RANK_THRESHOLDS[i].rank;
            }
        }
        return 'Người mới';
    }
    async updateDailyStreak(userId) {
        let userPoints = await this.userPointsRepo.findOne({ where: { userId } });
        if (!userPoints) {
            userPoints = await this.initializeUserPoints(userId);
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastActivity = userPoints.lastActivityDate
            ? new Date(userPoints.lastActivityDate)
            : null;
        if (lastActivity) {
            lastActivity.setHours(0, 0, 0, 0);
            const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff === 1) {
                userPoints.dailyStreak += 1;
            }
            else if (daysDiff > 1) {
                userPoints.dailyStreak = 1;
            }
        }
        else {
            userPoints.dailyStreak = 1;
        }
        userPoints.lastActivityDate = new Date();
        if (userPoints.dailyStreak > userPoints.longestStreak) {
            userPoints.longestStreak = userPoints.dailyStreak;
        }
        await this.userPointsRepo.save(userPoints);
        let pointsAwarded = 0;
        if (userPoints.dailyStreak % 7 === 0) {
            await this.awardPoints(userId, 'WEEKLY_STREAK', `Chuỗi ${userPoints.dailyStreak} ngày`);
            pointsAwarded = this.POINTS_CONFIG.WEEKLY_STREAK;
        }
        else if (userPoints.dailyStreak % 30 === 0) {
            await this.awardPoints(userId, 'MONTHLY_STREAK', `Chuỗi ${userPoints.dailyStreak} ngày`);
            pointsAwarded = this.POINTS_CONFIG.MONTHLY_STREAK;
        }
        return { streak: userPoints.dailyStreak, pointsAwarded };
    }
    async getUserStats(userId) {
        let userPoints = await this.userPointsRepo.findOne({ where: { userId } });
        if (!userPoints) {
            userPoints = await this.initializeUserPoints(userId);
        }
        const recentHistory = await this.pointsHistoryRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 10,
        });
        const achievements = await this.getUserAchievements(userId);
        return {
            ...userPoints,
            progressToNextLevel: Math.floor((userPoints.currentLevelPoints / userPoints.nextLevelPoints) * 100),
            recentActivity: recentHistory,
            achievements: {
                total: achievements.length,
                unlocked: achievements.filter(a => a.isUnlocked).length,
                locked: achievements.filter(a => !a.isUnlocked).length,
            },
        };
    }
    async getLeaderboard(limit = 50) {
        return await this.userPointsRepo.find({
            relations: ['user'],
            order: { totalPoints: 'DESC' },
            take: limit,
        });
    }
    async getPointsHistory(userId, limit = 50) {
        return await this.pointsHistoryRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async seedAchievements() {
        const achievements = [
            {
                name: 'Bước đầu tiên',
                description: 'Thêm giao dịch đầu tiên',
                category: 'TRACKING',
                icon: '🎯',
                rarity: 'COMMON',
                points: 10,
                criteria: JSON.stringify({ type: 'TRANSACTION_COUNT', value: 1 }),
            },
            {
                name: 'Người ghi chép',
                description: 'Thêm 50 giao dịch',
                category: 'TRACKING',
                icon: '📝',
                rarity: 'RARE',
                points: 50,
                criteria: JSON.stringify({ type: 'TRANSACTION_COUNT', value: 50 }),
            },
            {
                name: 'Chuyên gia tài chính',
                description: 'Thêm 200 giao dịch',
                category: 'TRACKING',
                icon: '💼',
                rarity: 'EPIC',
                points: 200,
                criteria: JSON.stringify({ type: 'TRANSACTION_COUNT', value: 200 }),
            },
            {
                name: 'Người lập kế hoạch',
                description: 'Tạo ngân sách đầu tiên',
                category: 'BUDGETING',
                icon: '📊',
                rarity: 'COMMON',
                points: 15,
                criteria: JSON.stringify({ type: 'BUDGET_COUNT', value: 1 }),
            },
            {
                name: 'Kỷ luật tài chính',
                description: 'Hoàn thành 5 ngân sách',
                category: 'BUDGETING',
                icon: '🎖️',
                rarity: 'RARE',
                points: 75,
                criteria: JSON.stringify({ type: 'BUDGET_COMPLETED', value: 5 }),
            },
            {
                name: 'Người tiết kiệm',
                description: 'Đạt mục tiêu tiết kiệm đầu tiên',
                category: 'SAVINGS',
                icon: '💰',
                rarity: 'RARE',
                points: 100,
                criteria: JSON.stringify({ type: 'SAVINGS_GOAL_ACHIEVED', value: 1 }),
            },
            {
                name: 'Triệu phú',
                description: 'Tiết kiệm được 10 triệu đồng',
                category: 'SAVINGS',
                icon: '💎',
                rarity: 'EPIC',
                points: 250,
                criteria: JSON.stringify({ type: 'TOTAL_SAVINGS', value: 10000000 }),
            },
            {
                name: 'Chuỗi 7 ngày',
                description: 'Đăng nhập liên tục 7 ngày',
                category: 'STREAK',
                icon: '🔥',
                rarity: 'COMMON',
                points: 30,
                criteria: JSON.stringify({ type: 'DAILY_STREAK', value: 7 }),
            },
            {
                name: 'Chuỗi 30 ngày',
                description: 'Đăng nhập liên tục 30 ngày',
                category: 'STREAK',
                icon: '⚡',
                rarity: 'EPIC',
                points: 150,
                criteria: JSON.stringify({ type: 'DAILY_STREAK', value: 30 }),
            },
            {
                name: 'Huyền thoại',
                description: 'Đăng nhập liên tục 100 ngày',
                category: 'STREAK',
                icon: '👑',
                rarity: 'LEGENDARY',
                points: 500,
                criteria: JSON.stringify({ type: 'DAILY_STREAK', value: 100 }),
            },
        ];
        for (const achievement of achievements) {
            const existing = await this.achievementRepo.findOne({
                where: { name: achievement.name },
            });
            if (!existing) {
                await this.achievementRepo.save(achievement);
            }
        }
    }
    async checkAchievements(userId) {
        const achievements = await this.achievementRepo.find({ where: { isActive: true } });
        for (const achievement of achievements) {
            const criteria = JSON.parse(achievement.criteria);
            const progress = await this.calculateAchievementProgress(userId, criteria);
            let userAchievement = await this.userAchievementRepo.findOne({
                where: { userId, achievementId: achievement.id },
            });
            if (!userAchievement) {
                userAchievement = this.userAchievementRepo.create({
                    userId,
                    achievementId: achievement.id,
                    progress: 0,
                    isUnlocked: false,
                });
            }
            userAchievement.progress = Math.min(progress, 100);
            if (progress >= 100 && !userAchievement.isUnlocked) {
                userAchievement.isUnlocked = true;
                userAchievement.unlockedAt = new Date();
                await this.awardPoints(userId, 'ACHIEVEMENT_UNLOCKED', `Mở khóa: ${achievement.name}`, { achievementId: achievement.id });
            }
            await this.userAchievementRepo.save(userAchievement);
        }
    }
    async calculateAchievementProgress(userId, criteria) {
        return 0;
    }
    async getUserAchievements(userId) {
        return await this.userAchievementRepo.find({
            where: { userId },
            relations: ['achievement'],
            order: { isUnlocked: 'DESC', progress: 'DESC' },
        });
    }
    async getAllAchievements() {
        return await this.achievementRepo.find({
            where: { isActive: true },
            order: { rarity: 'ASC', points: 'ASC' },
        });
    }
};
exports.GamificationService = GamificationService;
exports.GamificationService = GamificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_points_entity_1.UserPoints)),
    __param(1, (0, typeorm_1.InjectRepository)(points_history_entity_1.PointsHistory)),
    __param(2, (0, typeorm_1.InjectRepository)(achievement_entity_1.Achievement)),
    __param(3, (0, typeorm_1.InjectRepository)(user_achievement_entity_1.UserAchievement)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], GamificationService);
//# sourceMappingURL=gamification.service.js.map