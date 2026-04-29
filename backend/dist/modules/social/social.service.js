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
exports.SocialService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_friend_entity_1 = require("../../entities/user-friend.entity");
const spending_challenge_entity_1 = require("../../entities/spending-challenge.entity");
const challenge_participant_entity_1 = require("../../entities/challenge-participant.entity");
const user_entity_1 = require("../../entities/user.entity");
let SocialService = class SocialService {
    userFriendRepo;
    challengeRepo;
    participantRepo;
    userRepo;
    constructor(userFriendRepo, challengeRepo, participantRepo, userRepo) {
        this.userFriendRepo = userFriendRepo;
        this.challengeRepo = challengeRepo;
        this.participantRepo = participantRepo;
        this.userRepo = userRepo;
    }
    async sendFriendRequest(userId, friendId) {
        if (userId === friendId) {
            throw new common_1.BadRequestException('Không thể kết bạn với chính mình');
        }
        const friend = await this.userRepo.findOne({ where: { id: friendId } });
        if (!friend) {
            throw new common_1.NotFoundException('Người dùng không tồn tại');
        }
        const existing = await this.userFriendRepo.findOne({
            where: [
                { userId, friendId },
                { userId: friendId, friendId: userId },
            ],
        });
        if (existing) {
            throw new common_1.BadRequestException('Yêu cầu kết bạn đã tồn tại');
        }
        const friendRequest = this.userFriendRepo.create({
            userId,
            friendId,
            status: 'PENDING',
        });
        return await this.userFriendRepo.save(friendRequest);
    }
    async acceptFriendRequest(userId, requestId) {
        const request = await this.userFriendRepo.findOne({
            where: { id: requestId, friendId: userId, status: 'PENDING' },
        });
        if (!request) {
            throw new common_1.NotFoundException('Yêu cầu kết bạn không tồn tại');
        }
        request.status = 'ACCEPTED';
        request.acceptedAt = new Date();
        return await this.userFriendRepo.save(request);
    }
    async rejectFriendRequest(userId, requestId) {
        const request = await this.userFriendRepo.findOne({
            where: { id: requestId, friendId: userId, status: 'PENDING' },
        });
        if (!request) {
            throw new common_1.NotFoundException('Yêu cầu kết bạn không tồn tại');
        }
        request.status = 'REJECTED';
        await this.userFriendRepo.save(request);
    }
    async removeFriend(userId, friendshipId) {
        const friendship = await this.userFriendRepo.findOne({
            where: [
                { id: friendshipId, userId },
                { id: friendshipId, friendId: userId },
            ],
        });
        if (!friendship) {
            throw new common_1.NotFoundException('Quan hệ bạn bè không tồn tại');
        }
        await this.userFriendRepo.remove(friendship);
    }
    async getFriends(userId) {
        const friendships = await this.userFriendRepo.find({
            where: [
                { userId, status: 'ACCEPTED' },
                { friendId: userId, status: 'ACCEPTED' },
            ],
            relations: ['user', 'friend'],
        });
        return friendships.map(f => {
            const friend = f.userId === userId ? f.friend : f.user;
            return {
                friendshipId: f.id,
                userId: friend.id,
                username: friend.username,
                email: friend.email,
                canViewTransactions: f.canViewTransactions,
                canViewBudgets: f.canViewBudgets,
                canViewGoals: f.canViewGoals,
                friendSince: f.acceptedAt,
            };
        });
    }
    async getPendingRequests(userId) {
        const requests = await this.userFriendRepo.find({
            where: { friendId: userId, status: 'PENDING' },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
        return requests.map(r => ({
            requestId: r.id,
            fromUserId: r.userId,
            fromUsername: r.user.username,
            fromEmail: r.user.email,
            createdAt: r.createdAt,
        }));
    }
    async updateFriendPermissions(userId, friendshipId, permissions) {
        const friendship = await this.userFriendRepo.findOne({
            where: { id: friendshipId, userId, status: 'ACCEPTED' },
        });
        if (!friendship) {
            throw new common_1.NotFoundException('Quan hệ bạn bè không tồn tại');
        }
        Object.assign(friendship, permissions);
        return await this.userFriendRepo.save(friendship);
    }
    async createChallenge(userId, data) {
        const challenge = this.challengeRepo.create({
            creatorId: userId,
            ...data,
            participantCount: 1,
        });
        const savedChallenge = await this.challengeRepo.save(challenge);
        await this.joinChallenge(userId, savedChallenge.id);
        return savedChallenge;
    }
    async getPublicChallenges() {
        return await this.challengeRepo.find({
            where: { isPublic: true, status: 'ACTIVE' },
            relations: ['creator'],
            order: { createdAt: 'DESC' },
        });
    }
    async getUserChallenges(userId) {
        const participants = await this.participantRepo.find({
            where: { userId },
            relations: ['challenge', 'challenge.creator'],
            order: { joinedAt: 'DESC' },
        });
        return participants.map(p => ({
            ...p.challenge,
            participation: {
                currentAmount: p.currentAmount,
                progress: p.progress,
                status: p.status,
                rank: p.rank,
                joinedAt: p.joinedAt,
            },
        }));
    }
    async joinChallenge(userId, challengeId) {
        const challenge = await this.challengeRepo.findOne({
            where: { id: challengeId },
        });
        if (!challenge) {
            throw new common_1.NotFoundException('Thử thách không tồn tại');
        }
        if (challenge.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('Thử thách không còn hoạt động');
        }
        const existing = await this.participantRepo.findOne({
            where: { userId, challengeId },
        });
        if (existing) {
            throw new common_1.BadRequestException('Bạn đã tham gia thử thách này');
        }
        const participant = this.participantRepo.create({
            userId,
            challengeId,
            currentAmount: 0,
            progress: 0,
            status: 'IN_PROGRESS',
        });
        await this.participantRepo.save(participant);
        challenge.participantCount += 1;
        await this.challengeRepo.save(challenge);
        return participant;
    }
    async leaveChallenge(userId, challengeId) {
        const participant = await this.participantRepo.findOne({
            where: { userId, challengeId },
        });
        if (!participant) {
            throw new common_1.NotFoundException('Bạn chưa tham gia thử thách này');
        }
        participant.status = 'QUIT';
        await this.participantRepo.save(participant);
        const challenge = await this.challengeRepo.findOne({
            where: { id: challengeId },
        });
        if (challenge) {
            challenge.participantCount = Math.max(0, challenge.participantCount - 1);
            await this.challengeRepo.save(challenge);
        }
    }
    async getChallengeLeaderboard(challengeId) {
        const participants = await this.participantRepo.find({
            where: { challengeId },
            relations: ['user'],
            order: { progress: 'DESC', currentAmount: 'DESC' },
        });
        return participants.map((p, index) => ({
            rank: index + 1,
            userId: p.userId,
            username: p.user.username,
            currentAmount: p.currentAmount,
            progress: p.progress,
            status: p.status,
            completedAt: p.completedAt,
        }));
    }
    async updateChallengeProgress(userId, challengeId, amount) {
        const participant = await this.participantRepo.findOne({
            where: { userId, challengeId },
            relations: ['challenge'],
        });
        if (!participant) {
            throw new common_1.NotFoundException('Bạn chưa tham gia thử thách này');
        }
        participant.currentAmount = amount;
        participant.progress = Math.min(100, Math.floor((amount / participant.challenge.targetAmount) * 100));
        if (participant.progress >= 100 && participant.status === 'IN_PROGRESS') {
            participant.status = 'COMPLETED';
            participant.completedAt = new Date();
        }
        return await this.participantRepo.save(participant);
    }
    async searchUsers(query, currentUserId) {
        const users = await this.userRepo
            .createQueryBuilder('user')
            .where('user.id != :currentUserId', { currentUserId })
            .andWhere('(user.username LIKE :query OR user.email LIKE :query)', {
            query: `%${query}%`,
        })
            .take(20)
            .getMany();
        return users.map(u => ({
            id: u.id,
            username: u.username,
            email: u.email,
        }));
    }
};
exports.SocialService = SocialService;
exports.SocialService = SocialService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_friend_entity_1.UserFriend)),
    __param(1, (0, typeorm_1.InjectRepository)(spending_challenge_entity_1.SpendingChallenge)),
    __param(2, (0, typeorm_1.InjectRepository)(challenge_participant_entity_1.ChallengeParticipant)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SocialService);
//# sourceMappingURL=social.service.js.map