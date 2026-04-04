import { SavingsGoalsService } from './savings-goals.service';
import { CreateSavingsGoalDto } from './dto/create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './dto/update-savings-goal.dto';
import { QuerySavingsGoalDto } from './dto/query-savings-goal.dto';
export declare class SavingsGoalsController {
    private savingsGoalsService;
    constructor(savingsGoalsService: SavingsGoalsService);
    create(req: any, dto: CreateSavingsGoalDto): Promise<import("../../entities/savings-goal.entity").SavingsGoal>;
    findAll(req: any, query: QuerySavingsGoalDto): Promise<{
        progressPercentage: number;
        id: number;
        userId: number;
        walletId: number;
        name: string;
        description: string;
        targetAmount: number;
        currentAmount: number;
        icon: string;
        startDate: Date;
        targetDate: Date | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        user: import("../../entities/user.entity").User;
        wallet: import("../../entities/wallet.entity").Wallet;
    }[]>;
    findOne(req: any, id: string): Promise<{
        progressPercentage: number;
        id: number;
        userId: number;
        walletId: number;
        name: string;
        description: string;
        targetAmount: number;
        currentAmount: number;
        icon: string;
        startDate: Date;
        targetDate: Date | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        user: import("../../entities/user.entity").User;
        wallet: import("../../entities/wallet.entity").Wallet;
    }>;
    getProgress(req: any, id: string): Promise<{
        goalId: number;
        goalName: string;
        currentAmount: number;
        targetAmount: number;
        remainingAmount: number;
        progressPercentage: number;
        status: string;
        startDate: Date;
        targetDate: Date | null;
        daysRemaining: number | null;
    }>;
    update(req: any, id: string, dto: UpdateSavingsGoalDto): Promise<{
        progressPercentage: number;
        id: number;
        userId: number;
        walletId: number;
        name: string;
        description: string;
        targetAmount: number;
        currentAmount: number;
        icon: string;
        startDate: Date;
        targetDate: Date | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        user: import("../../entities/user.entity").User;
        wallet: import("../../entities/wallet.entity").Wallet;
    }>;
    remove(req: any, id: string): Promise<{
        message: string;
    }>;
    addToGoal(req: any, id: string, body: {
        amount: number;
    }): Promise<{
        progressPercentage: number;
        message: string;
        id: number;
        userId: number;
        walletId: number;
        name: string;
        description: string;
        targetAmount: number;
        currentAmount: number;
        icon: string;
        startDate: Date;
        targetDate: Date | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        user: import("../../entities/user.entity").User;
        wallet: import("../../entities/wallet.entity").Wallet;
    }>;
    withdrawFromGoal(req: any, id: string, body: {
        amount: number;
    }): Promise<{
        progressPercentage: number;
        id: number;
        userId: number;
        walletId: number;
        name: string;
        description: string;
        targetAmount: number;
        currentAmount: number;
        icon: string;
        startDate: Date;
        targetDate: Date | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        user: import("../../entities/user.entity").User;
        wallet: import("../../entities/wallet.entity").Wallet;
    }>;
    updateStatus(req: any, id: string, body: {
        status: string;
    }): Promise<{
        progressPercentage: number;
        id: number;
        userId: number;
        walletId: number;
        name: string;
        description: string;
        targetAmount: number;
        currentAmount: number;
        icon: string;
        startDate: Date;
        targetDate: Date | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        user: import("../../entities/user.entity").User;
        wallet: import("../../entities/wallet.entity").Wallet;
    }>;
}
