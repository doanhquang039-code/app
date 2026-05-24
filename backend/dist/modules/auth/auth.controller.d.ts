import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    socialLogin(provider: string, target: string, res: any): any;
    socialCallback(provider: string, code: string, state: string, error: string, res: any): Promise<any>;
}
