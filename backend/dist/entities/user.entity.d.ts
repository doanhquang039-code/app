export declare class User {
    id: number;
    email: string;
    password: string | null;
    fullName: string;
    username: string;
    isActive: boolean;
    authProvider?: string;
    socialProviderId?: string;
    avatarUrl?: string;
    lastLoginAt?: Date;
    role: string;
    createdAt: Date;
}
