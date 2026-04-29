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
exports.SocialController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const social_service_1 = require("./social.service");
const swagger_1 = require("@nestjs/swagger");
let SocialController = class SocialController {
    socialService;
    constructor(socialService) {
        this.socialService = socialService;
    }
    async sendFriendRequest(req, friendId) {
        return await this.socialService.sendFriendRequest(req.user.userId, friendId);
    }
    async acceptFriendRequest(req, requestId) {
        return await this.socialService.acceptFriendRequest(req.user.userId, requestId);
    }
    async rejectFriendRequest(req, requestId) {
        await this.socialService.rejectFriendRequest(req.user.userId, requestId);
        return { success: true, message: 'Đã từ chối lời mời kết bạn' };
    }
    async removeFriend(req, friendshipId) {
        await this.socialService.removeFriend(req.user.userId, friendshipId);
        return { success: true, message: 'Đã xóa bạn bè' };
    }
    async getFriends(req) {
        return await this.socialService.getFriends(req.user.userId);
    }
    async getPendingRequests(req) {
        return await this.socialService.getPendingRequests(req.user.userId);
    }
    async updateFriendPermissions(req, friendshipId, permissions) {
        return await this.socialService.updateFriendPermissions(req.user.userId, friendshipId, permissions);
    }
    async searchUsers(req, query) {
        return await this.socialService.searchUsers(query, req.user.userId);
    }
    async createChallenge(req, data) {
        return await this.socialService.createChallenge(req.user.userId, data);
    }
    async getPublicChallenges() {
        return await this.socialService.getPublicChallenges();
    }
    async getUserChallenges(req) {
        return await this.socialService.getUserChallenges(req.user.userId);
    }
    async joinChallenge(req, challengeId) {
        return await this.socialService.joinChallenge(req.user.userId, challengeId);
    }
    async leaveChallenge(req, challengeId) {
        await this.socialService.leaveChallenge(req.user.userId, challengeId);
        return { success: true, message: 'Đã rời khỏi thử thách' };
    }
    async getChallengeLeaderboard(challengeId) {
        return await this.socialService.getChallengeLeaderboard(challengeId);
    }
    async updateChallengeProgress(req, challengeId, data) {
        return await this.socialService.updateChallengeProgress(req.user.userId, challengeId, data.amount);
    }
};
exports.SocialController = SocialController;
__decorate([
    (0, common_1.Post)('friends/request/:friendId'),
    (0, swagger_1.ApiOperation)({ summary: 'Gửi lời mời kết bạn' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('friendId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "sendFriendRequest", null);
__decorate([
    (0, common_1.Put)('friends/accept/:requestId'),
    (0, swagger_1.ApiOperation)({ summary: 'Chấp nhận lời mời kết bạn' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('requestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "acceptFriendRequest", null);
__decorate([
    (0, common_1.Put)('friends/reject/:requestId'),
    (0, swagger_1.ApiOperation)({ summary: 'Từ chối lời mời kết bạn' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('requestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "rejectFriendRequest", null);
__decorate([
    (0, common_1.Delete)('friends/:friendshipId'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa bạn bè' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('friendshipId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "removeFriend", null);
__decorate([
    (0, common_1.Get)('friends'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách bạn bè' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "getFriends", null);
__decorate([
    (0, common_1.Get)('friends/requests'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách lời mời kết bạn' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "getPendingRequests", null);
__decorate([
    (0, common_1.Put)('friends/:friendshipId/permissions'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật quyền xem của bạn bè' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('friendshipId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "updateFriendPermissions", null);
__decorate([
    (0, common_1.Get)('users/search'),
    (0, swagger_1.ApiOperation)({ summary: 'Tìm kiếm người dùng' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "searchUsers", null);
__decorate([
    (0, common_1.Post)('challenges'),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo thử thách chi tiêu' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "createChallenge", null);
__decorate([
    (0, common_1.Get)('challenges/public'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách thử thách công khai' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "getPublicChallenges", null);
__decorate([
    (0, common_1.Get)('challenges/my'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách thử thách của tôi' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "getUserChallenges", null);
__decorate([
    (0, common_1.Post)('challenges/:challengeId/join'),
    (0, swagger_1.ApiOperation)({ summary: 'Tham gia thử thách' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('challengeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "joinChallenge", null);
__decorate([
    (0, common_1.Delete)('challenges/:challengeId/leave'),
    (0, swagger_1.ApiOperation)({ summary: 'Rời khỏi thử thách' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('challengeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "leaveChallenge", null);
__decorate([
    (0, common_1.Get)('challenges/:challengeId/leaderboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy bảng xếp hạng thử thách' }),
    __param(0, (0, common_1.Param)('challengeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "getChallengeLeaderboard", null);
__decorate([
    (0, common_1.Put)('challenges/:challengeId/progress'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật tiến độ thử thách' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('challengeId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "updateChallengeProgress", null);
exports.SocialController = SocialController = __decorate([
    (0, swagger_1.ApiTags)('Social'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('social'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [social_service_1.SocialService])
], SocialController);
//# sourceMappingURL=social.controller.js.map