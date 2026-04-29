import { User } from './user.entity';
export declare class ThirdPartyIntegration {
    id: number;
    userId: number;
    user: User;
    provider: string;
    providerName: string;
    accessToken: string;
    refreshToken: string;
    tokenExpiresAt: Date;
    accountId: string;
    accountEmail: string;
    status: string;
    permissions: string;
    settings: string;
    autoSync: boolean;
    lastSyncedAt: Date;
    syncError: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
