import { Repository } from 'typeorm';
import { UserFriend } from '../../entities/user-friend.entity';
import { SpendingChallenge } from '../../entities/spending-challenge.entity';
import { ChallengeParticipant } from '../../entities/challenge-participant.entity';
import { User } from '../../entities/user.entity';
export declare class SocialService {
    private userFriendRepo;
    private challengeRepo;
    private participantRepo;
    private userRepo;
    constructor(userFriendRepo: Repository<UserFriend>, challengeRepo: Repository<SpendingChallenge>, participantRepo: Repository<ChallengeParticipant>, userRepo: Repository<User>);
    sendFriendRequest(userId: number, friendId: number): Promise<UserFriend>;
    acceptFriendRequest(userId: number, requestId: number): Promise<UserFriend>;
    rejectFriendRequest(userId: number, requestId: number): Promise<void>;
    removeFriend(userId: number, friendshipId: number): Promise<void>;
    getFriends(userId: number): Promise<any[]>;
    getPendingRequests(userId: number): Promise<any[]>;
    updateFriendPermissions(userId: number, friendshipId: number, permissions: {
        canViewTransactions?: boolean;
        canViewBudgets?: boolean;
        canViewGoals?: boolean;
    }): Promise<UserFriend>;
    createChallenge(userId: number, data: any): Promise<SpendingChallenge>;
    getPublicChallenges(): Promise<SpendingChallenge[]>;
    getUserChallenges(userId: number): Promise<any[]>;
    joinChallenge(userId: number, challengeId: number): Promise<ChallengeParticipant>;
    leaveChallenge(userId: number, challengeId: number): Promise<void>;
    getChallengeLeaderboard(challengeId: number): Promise<any[]>;
    updateChallengeProgress(userId: number, challengeId: number, amount: number): Promise<ChallengeParticipant>;
    searchUsers(query: string, currentUserId: number): Promise<any[]>;
}
