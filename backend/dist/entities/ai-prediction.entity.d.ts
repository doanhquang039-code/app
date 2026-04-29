import { User } from './user.entity';
export declare class AIPrediction {
    id: number;
    userId: number;
    user: User;
    predictionType: string;
    category: string;
    targetDate: Date;
    predictedAmount: number;
    actualAmount: number;
    confidence: number;
    accuracy: number;
    factors: string;
    recommendations: string;
    status: string;
    isNotified: boolean;
    createdAt: Date;
}
