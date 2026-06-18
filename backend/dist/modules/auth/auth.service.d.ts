import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
type SocialProvider = 'google' | 'facebook' | 'microsoft' | 'zalo' | 'tiktok' | 'instagram';
export declare class AuthService {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        message: string;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: number;
            email: string;
            username: string;
            fullName: string;
            authProvider: string;
            avatarUrl: string | undefined;
        };
    }>;
    getSocialAuthUrl(providerInput: string, targetInput?: string): string;
    getSocialProviders(): {
        id: SocialProvider;
        enabled: boolean;
        configured: boolean;
    }[];
    handleSocialCallback(providerInput: string, code?: string, state?: string): Promise<string>;
    getSocialErrorRedirect(message: string, stateOrTarget?: string): string;
    private signToken;
    private toAuthUser;
    private findOrCreateSocialUser;
    private buildUniqueUsername;
    private exchangeCodeForToken;
    private fetchSocialProfile;
    private mapProfile;
    private fetchJson;
    private assertProvider;
    private requiredEnv;
    private assertProviderEnabled;
    private isProviderEnabled;
    private getRedirectUri;
    private getFrontendUrl;
    private getMobileCallbackUrl;
    private getSocialAuthTarget;
    private applyFreshLoginParams;
    private getTargetFromStateOrValue;
    private getStateSecret;
    private createState;
    private verifyState;
}
export {};
