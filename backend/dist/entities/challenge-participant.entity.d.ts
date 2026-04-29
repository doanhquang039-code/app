import { User } from './user.entity';
import { SpendingChallenge } from './spending-challenge.entity';
export declare class ChallengeParticipant {
    id: number;
    challengeId: number;
    challenge: SpendingChallenge;
    userId: number;
    user: User;
    currentAmount: number;
    progress: number;
    status: string;
    completedAt: Date;
    rank: number;
    joinedAt: Date;
    updatedAt: Date;
}
