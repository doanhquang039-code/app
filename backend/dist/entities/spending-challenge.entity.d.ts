import { User } from './user.entity';
export declare class SpendingChallenge {
    id: number;
    creatorId: number;
    creator: User;
    name: string;
    description: string;
    challengeType: string;
    targetAmount: number;
    startDate: Date;
    endDate: Date;
    status: string;
    isPublic: boolean;
    participantCount: number;
    icon: string;
    rules: string;
    createdAt: Date;
    updatedAt: Date;
}
