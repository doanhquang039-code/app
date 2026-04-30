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
const user_entity_1 = require("../entities/user.entity");
let GamificationService = class GamificationService {
    userRepo;
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    BADGES = [
        {
            id: 'first_transaction',
            name: 'Bước đầu tiên',
            description: 'Tạo giao dịch đầu tiên',
            icon: '🎯',
            rarity: 'common',
        },
        {
            id: 'budget_master',
            name: 'Chuyên gia ngân sách',
            description: 'Tuân thủ ngân sách 3 tháng liên tiếp',
            icon: '💰',
            rarity: 'rare',
        },
        {
            id: 'savings_hero',
            name: 'Anh hùng tiết kiệm',
            description: 'Đạt 5 mục tiêu tiết kiệm',
            icon: '🏆',
            rarity: 'epic',
        },
        {
            id: 'millionaire',
            name: 'Triệu phú',
            description: 'Tổng tài sản đạt 1 triệu',
            icon: '💎',
            rarity: 'legendary',
        },
        {
            id: 'streak_7',
            name: 'Kiên trì 7 ngày',
            description: 'Ghi chép chi tiêu 7 ngày liên tiếp',
            icon: '🔥',
            rarity: 'common',
        },
        {
            id: 'streak_30',
            name: 'Kiên trì 30 ngày',
            description: 'Ghi chép chi tiêu 30 ngày liên tiếp',
            icon: '⚡',
            rarity: 'rare',
        },
        {
            id: 'early_bird',
            name: 'Chim sớm',
            description: 'Ghi chép trước 8h sáng 10 lần',
            icon: '🌅',
            rarity: 'common',
        },
        {
            id: 'night_owl',
            name: 'Cú đêm',
            description: 'Ghi chép sau 10h tối 10 lần',
            icon: '🦉',
            rarity: 'common',
        },
        {
            id: 'category_master',
            name: 'Chuyên gia phân loại',
            description: 'Sử dụng đủ 10 danh mục khác nhau',
            icon: '📊',
            rarity: 'rare',
        },
        {
            id: 'social_butterfly',
            name: 'Bướm xã hội',
            description: 'Tham gia 5 nhóm chi tiêu',
            icon: '🦋',
            rarity: 'rare',
        },
    ];
    async getUserStats(userId) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        const points = 1250;
        const level = Math.floor(points / 500) + 1;
        const nextLevelPoints = level * 500;
        const earnedBadges = this.BADGES.slice(0, 3).map((badge) => ({
            ...badge,
            earnedAt: new Date(),
        }));
        const achievements = [
            {
                id: 'transactions_100',
                title: '100 giao dịch',
                description: 'Tạo 100 giao dịch',
                progress: 45,
                target: 100,
                reward: 100,
                completed: false,
            },
            {
                id: 'savings_1m',
                title: 'Tiết kiệm 1 triệu',
                description: 'Tiết kiệm được 1 triệu đồng',
                progress: 750000,
                target: 1000000,
                reward: 200,
                completed: false,
            },
            {
                id: 'budget_perfect',
                title: 'Ngân sách hoàn hảo',
                description: 'Không vượt ngân sách trong 1 tháng',
                progress: 15,
                target: 30,
                reward: 150,
                completed: false,
            },
        ];
        const streak = 7;
        const totalUsers = await this.userRepo.count();
        const rank = Math.floor(Math.random() * totalUsers) + 1;
        return {
            level,
            points,
            nextLevelPoints,
            badges: earnedBadges,
            achievements,
            streak,
            rank,
            totalUsers,
        };
    }
    async getLeaderboard(limit = 10) {
        const leaderboard = Array.from({ length: limit }, (_, i) => ({
            rank: i + 1,
            userId: i + 1,
            username: `User${i + 1}`,
            points: 5000 - i * 200,
            level: Math.floor((5000 - i * 200) / 500) + 1,
            badges: Math.floor(Math.random() * 10),
        }));
        return leaderboard;
    }
    async awardBadge(userId, badgeId) {
        const badge = this.BADGES.find((b) => b.id === badgeId);
        if (!badge) {
            throw new Error('Badge not found');
        }
        return {
            ...badge,
            earnedAt: new Date(),
        };
    }
    async addPoints(userId, points) {
        return points;
    }
    async checkAchievements(userId) {
        const stats = await this.getUserStats(userId);
        return stats.achievements.filter((a) => a.progress >= a.target && !a.completed);
    }
};
exports.GamificationService = GamificationService;
exports.GamificationService = GamificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], GamificationService);
//# sourceMappingURL=gamification.service.js.map