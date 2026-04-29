import { User } from './user.entity';
export declare class PointsHistory {
    id: number;
    userId: number;
    user: User;
    points: number;
    action: string;
    description: string;
    metadata: string;
    createdAt: Date;
}
