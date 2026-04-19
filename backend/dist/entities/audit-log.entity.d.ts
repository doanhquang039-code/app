import { User } from './user.entity';
export declare class AuditLog {
    id: number;
    userId: number;
    action: string;
    entityType: string;
    entityId: number;
    oldValue: string;
    newValue: string;
    ipAddress: string;
    userAgent: string;
    description: string;
    createdAt: Date;
    user: User;
}
