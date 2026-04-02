import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersService {
    private userRepo;
    constructor(userRepo: Repository<User>);
    getProfile(userId: number): Promise<{
        id: number;
        email: string;
        fullName: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    updateProfile(userId: number, dto: UpdateProfileDto): Promise<{
        message: string;
        user: {
            id: number;
            email: string;
            fullName: string;
            isActive: boolean;
            createdAt: Date;
        };
    }>;
    changePassword(userId: number, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    deleteAccount(userId: number): Promise<{
        message: string;
    }>;
}
