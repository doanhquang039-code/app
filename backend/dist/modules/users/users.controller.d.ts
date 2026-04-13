import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
        name: string;
        transactionCount: number;
        categoryCount: number;
        budgetCount: number;
        id: number;
        email: string;
        fullName: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    updateProfile(req: any, dto: UpdateProfileDto): Promise<{
        message: string;
        user: {
            name: string;
            id: number;
            email: string;
            fullName: string;
            isActive: boolean;
            createdAt: Date;
        };
    }>;
    changePassword(req: any, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    deleteAccount(req: any): Promise<{
        message: string;
    }>;
}
