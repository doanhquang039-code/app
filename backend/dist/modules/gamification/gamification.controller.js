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
exports.GamificationController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const gamification_service_1 = require("./gamification.service");
const swagger_1 = require("@nestjs/swagger");
let GamificationController = class GamificationController {
    gamificationService;
    constructor(gamificationService) {
        this.gamificationService = gamificationService;
    }
    async getUserStats(req) {
        return await this.gamificationService.getUserStats(req.user.userId);
    }
    async updateDailyStreak(req) {
        const result = await this.gamificationService.updateDailyStreak(req.user.userId);
        if (result.pointsAwarded > 0) {
            await this.gamificationService.awardPoints(req.user.userId, 'DAILY_LOGIN');
        }
        return {
            success: true,
            streak: result.streak,
            pointsAwarded: result.pointsAwarded,
            message: `Chuỗi đăng nhập: ${result.streak} ngày`,
        };
    }
    async getLeaderboard(limit) {
        const leaderboard = await this.gamificationService.getLeaderboard(limit || 50);
        return leaderboard.map((entry, index) => ({
            rank: index + 1,
            userId: entry.userId,
            username: entry.user?.username || 'Unknown',
            totalPoints: entry.totalPoints,
            level: entry.level,
            rankTitle: entry.rank,
            dailyStreak: entry.dailyStreak,
        }));
    }
    async getPointsHistory(req, limit) {
        return await this.gamificationService.getPointsHistory(req.user.userId, limit || 50);
    }
    async getUserAchievements(req) {
        return await this.gamificationService.getUserAchievements(req.user.userId);
    }
    async getAllAchievements() {
        return await this.gamificationService.getAllAchievements();
    }
    async seedAchievements() {
        await this.gamificationService.seedAchievements();
        return {
            success: true,
            message: 'Đã khởi tạo thành tích thành công',
        };
    }
    async checkAchievements(req) {
        await this.gamificationService.checkAchievements(req.user.userId);
        return {
            success: true,
            message: 'Đã kiểm tra thành tích',
        };
    }
};
exports.GamificationController = GamificationController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy thống kê điểm và cấp độ của user' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "getUserStats", null);
__decorate([
    (0, common_1.Post)('daily-login'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật chuỗi đăng nhập hàng ngày' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "updateDailyStreak", null);
__decorate([
    (0, common_1.Get)('leaderboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy bảng xếp hạng' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "getLeaderboard", null);
__decorate([
    (0, common_1.Get)('points-history'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy lịch sử điểm' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "getPointsHistory", null);
__decorate([
    (0, common_1.Get)('achievements'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách thành tích của user' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "getUserAchievements", null);
__decorate([
    (0, common_1.Get)('achievements/all'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy tất cả thành tích có thể đạt được' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "getAllAchievements", null);
__decorate([
    (0, common_1.Post)('seed-achievements'),
    (0, swagger_1.ApiOperation)({ summary: 'Khởi tạo dữ liệu thành tích (Admin only)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "seedAchievements", null);
__decorate([
    (0, common_1.Post)('check-achievements'),
    (0, swagger_1.ApiOperation)({ summary: 'Kiểm tra và cập nhật thành tích' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "checkAchievements", null);
exports.GamificationController = GamificationController = __decorate([
    (0, swagger_1.ApiTags)('Gamification'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('gamification'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [gamification_service_1.GamificationService])
], GamificationController);
//# sourceMappingURL=gamification.controller.js.map