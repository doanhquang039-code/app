import { SocialService } from './social.service';
export declare class SocialController {
    private readonly socialService;
    constructor(socialService: SocialService);
    sendFriendRequest(req: any, friendId: number): Promise<import("../../entities/user-friend.entity").UserFriend>;
    acceptFriendRequest(req: any, requestId: number): Promise<import("../../entities/user-friend.entity").UserFriend>;
    rejectFriendRequest(req: any, requestId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    removeFriend(req: any, friendshipId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getFriends(req: any): Promise<any[]>;
    getPendingRequests(req: any): Promise<any[]>;
    updateFriendPermissions(req: any, friendshipId: number, permissions: any): Promise<import("../../entities/user-friend.entity").UserFriend>;
    searchUsers(req: any, query: string): Promise<any[]>;
    createChallenge(req: any, data: any): Promise<import("../../entities/spending-challenge.entity").SpendingChallenge>;
    getPublicChallenges(): Promise<import("../../entities/spending-challenge.entity").SpendingChallenge[]>;
    getUserChallenges(req: any): Promise<any[]>;
    joinChallenge(req: any, challengeId: number): Promise<import("../../entities/challenge-participant.entity").ChallengeParticipant>;
    leaveChallenge(req: any, challengeId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getChallengeLeaderboard(challengeId: number): Promise<any[]>;
    updateChallengeProgress(req: any, challengeId: number, data: {
        amount: number;
    }): Promise<import("../../entities/challenge-participant.entity").ChallengeParticipant>;
}
