import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Category } from '../../entities/category.entity';
import { Budget } from '../../entities/budget.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersService {
    private userRepo;
    private transactionRepo;
    private categoryRepo;
    private budgetRepo;
    constructor(userRepo: Repository<User>, transactionRepo: Repository<Transaction>, categoryRepo: Repository<Category>, budgetRepo: Repository<Budget>);
    getProfile(userId: number): Promise<{
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
    updateProfile(userId: number, dto: UpdateProfileDto): Promise<{
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
    changePassword(userId: number, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    deleteAccount(userId: number): Promise<{
        message: string;
    }>;
}
