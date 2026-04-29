import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFriend } from '../../entities/user-friend.entity';
import { SpendingChallenge } from '../../entities/spending-challenge.entity';
import { ChallengeParticipant } from '../../entities/challenge-participant.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(UserFriend)
    private userFriendRepo: Repository<UserFriend>,
    @InjectRepository(SpendingChallenge)
    private challengeRepo: Repository<SpendingChallenge>,
    @InjectRepository(ChallengeParticipant)
    private participantRepo: Repository<ChallengeParticipant>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // ========== FRIEND MANAGEMENT ==========

  // Send friend request
  async sendFriendRequest(userId: number, friendId: number): Promise<UserFriend> {
    if (userId === friendId) {
      throw new BadRequestException('Không thể kết bạn với chính mình');
    }

    // Check if friend exists
    const friend = await this.userRepo.findOne({ where: { id: friendId } });
    if (!friend) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Check if already friends or request exists
    const existing = await this.userFriendRepo.findOne({
      where: [
        { userId, friendId },
        { userId: friendId, friendId: userId },
      ],
    });

    if (existing) {
      throw new BadRequestException('Yêu cầu kết bạn đã tồn tại');
    }

    const friendRequest = this.userFriendRepo.create({
      userId,
      friendId,
      status: 'PENDING',
    });

    return await this.userFriendRepo.save(friendRequest);
  }

  // Accept friend request
  async acceptFriendRequest(userId: number, requestId: number): Promise<UserFriend> {
    const request = await this.userFriendRepo.findOne({
      where: { id: requestId, friendId: userId, status: 'PENDING' },
    });

    if (!request) {
      throw new NotFoundException('Yêu cầu kết bạn không tồn tại');
    }

    request.status = 'ACCEPTED';
    request.acceptedAt = new Date();

    return await this.userFriendRepo.save(request);
  }

  // Reject friend request
  async rejectFriendRequest(userId: number, requestId: number): Promise<void> {
    const request = await this.userFriendRepo.findOne({
      where: { id: requestId, friendId: userId, status: 'PENDING' },
    });

    if (!request) {
      throw new NotFoundException('Yêu cầu kết bạn không tồn tại');
    }

    request.status = 'REJECTED';
    await this.userFriendRepo.save(request);
  }

  // Remove friend
  async removeFriend(userId: number, friendshipId: number): Promise<void> {
    const friendship = await this.userFriendRepo.findOne({
      where: [
        { id: friendshipId, userId },
        { id: friendshipId, friendId: userId },
      ],
    });

    if (!friendship) {
      throw new NotFoundException('Quan hệ bạn bè không tồn tại');
    }

    await this.userFriendRepo.remove(friendship);
  }

  // Get friends list
  async getFriends(userId: number): Promise<any[]> {
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

  // Get pending friend requests
  async getPendingRequests(userId: number): Promise<any[]> {
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

  // Update friend permissions
  async updateFriendPermissions(
    userId: number,
    friendshipId: number,
    permissions: {
      canViewTransactions?: boolean;
      canViewBudgets?: boolean;
      canViewGoals?: boolean;
    },
  ): Promise<UserFriend> {
    const friendship = await this.userFriendRepo.findOne({
      where: { id: friendshipId, userId, status: 'ACCEPTED' },
    });

    if (!friendship) {
      throw new NotFoundException('Quan hệ bạn bè không tồn tại');
    }

    Object.assign(friendship, permissions);
    return await this.userFriendRepo.save(friendship);
  }

  // ========== SPENDING CHALLENGES ==========

  // Create challenge
  async createChallenge(userId: number, data: any): Promise<SpendingChallenge> {
    const challenge = this.challengeRepo.create({
      creatorId: userId,
      ...data,
      participantCount: 1,
    });

    const savedChallenge = await this.challengeRepo.save(challenge) as unknown as SpendingChallenge;

    // Auto-join creator
    await this.joinChallenge(userId, savedChallenge.id);

    return savedChallenge;
  }

  // Get all public challenges
  async getPublicChallenges(): Promise<SpendingChallenge[]> {
    return await this.challengeRepo.find({
      where: { isPublic: true, status: 'ACTIVE' },
      relations: ['creator'],
      order: { createdAt: 'DESC' },
    });
  }

  // Get user's challenges
  async getUserChallenges(userId: number): Promise<any[]> {
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

  // Join challenge
  async joinChallenge(userId: number, challengeId: number): Promise<ChallengeParticipant> {
    const challenge = await this.challengeRepo.findOne({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Thử thách không tồn tại');
    }

    if (challenge.status !== 'ACTIVE') {
      throw new BadRequestException('Thử thách không còn hoạt động');
    }

    // Check if already joined
    const existing = await this.participantRepo.findOne({
      where: { userId, challengeId },
    });

    if (existing) {
      throw new BadRequestException('Bạn đã tham gia thử thách này');
    }

    const participant = this.participantRepo.create({
      userId,
      challengeId,
      currentAmount: 0,
      progress: 0,
      status: 'IN_PROGRESS',
    });

    await this.participantRepo.save(participant);

    // Update participant count
    challenge.participantCount += 1;
    await this.challengeRepo.save(challenge);

    return participant;
  }

  // Leave challenge
  async leaveChallenge(userId: number, challengeId: number): Promise<void> {
    const participant = await this.participantRepo.findOne({
      where: { userId, challengeId },
    });

    if (!participant) {
      throw new NotFoundException('Bạn chưa tham gia thử thách này');
    }

    participant.status = 'QUIT';
    await this.participantRepo.save(participant);

    // Update participant count
    const challenge = await this.challengeRepo.findOne({
      where: { id: challengeId },
    });
    if (challenge) {
      challenge.participantCount = Math.max(0, challenge.participantCount - 1);
      await this.challengeRepo.save(challenge);
    }
  }

  // Get challenge leaderboard
  async getChallengeLeaderboard(challengeId: number): Promise<any[]> {
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

  // Update challenge progress
  async updateChallengeProgress(
    userId: number,
    challengeId: number,
    amount: number,
  ): Promise<ChallengeParticipant> {
    const participant = await this.participantRepo.findOne({
      where: { userId, challengeId },
      relations: ['challenge'],
    });

    if (!participant) {
      throw new NotFoundException('Bạn chưa tham gia thử thách này');
    }

    participant.currentAmount = amount;
    participant.progress = Math.min(
      100,
      Math.floor((amount / participant.challenge.targetAmount) * 100),
    );

    if (participant.progress >= 100 && participant.status === 'IN_PROGRESS') {
      participant.status = 'COMPLETED';
      participant.completedAt = new Date();
    }

    return await this.participantRepo.save(participant);
  }

  // Search users
  async searchUsers(query: string, currentUserId: number): Promise<any[]> {
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
}
