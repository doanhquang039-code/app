"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavingsGoalsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const savings_goal_entity_1 = require("../../entities/savings-goal.entity");
const wallet_entity_1 = require("../../entities/wallet.entity");
let SavingsGoalsService = class SavingsGoalsService {
    savingsGoalRepository;
    walletRepository;
    constructor(savingsGoalRepository, walletRepository) {
        this.savingsGoalRepository = savingsGoalRepository;
        this.walletRepository = walletRepository;
    }
    async create(userId, dto) {
        if (dto.targetAmount <= 0) {
            throw new common_1.BadRequestException('Mục tiêu tiết kiệm phải lớn hơn 0');
        }
        const wallet = await this.walletRepository.findOne({
            where: { id: dto.walletId, userId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Ví không tìm thấy');
        }
        const startDate = new Date(dto.startDate);
        const targetDate = dto.targetDate ? new Date(dto.targetDate) : null;
        if (isNaN(startDate.getTime())) {
            throw new common_1.BadRequestException('Ngày bắt đầu không hợp lệ');
        }
        if (targetDate && isNaN(targetDate.getTime())) {
            throw new common_1.BadRequestException('Ngày mục tiêu không hợp lệ');
        }
        const goal = this.savingsGoalRepository.create({
            userId,
            walletId: dto.walletId,
            name: dto.name,
            description: dto.description,
            targetAmount: dto.targetAmount,
            icon: dto.icon,
            startDate,
            targetDate,
            currentAmount: 0,
            progressPercentage: 0,
            status: 'active',
        });
        return await this.savingsGoalRepository.save(goal);
    }
    async findAll(userId, query) {
        const qb = this.savingsGoalRepository
            .createQueryBuilder('s')
            .leftJoinAndSelect('s.wallet', 'wallet')
            .where('s.userId = :userId', { userId })
            .orderBy('s.targetDate', 'ASC');
        if (query.status) {
            qb.andWhere('s.status = :status', { status: query.status });
        }
        if (query.walletId) {
            qb.andWhere('s.walletId = :walletId', { walletId: query.walletId });
        }
        const goals = await qb.getMany();
        return goals.map((goal) => ({
            ...goal,
            progressPercentage: Math.min((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100, 100),
        }));
    }
    async findOne(userId, id) {
        const goal = await this.savingsGoalRepository.findOne({
            where: { id, userId },
            relations: ['wallet'],
        });
        if (!goal) {
            throw new common_1.NotFoundException('Không tìm thấy mục tiêu tiết kiệm');
        }
        return {
            ...goal,
            progressPercentage: Math.min((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100, 100),
        };
    }
    async update(userId, id, dto) {
        const goal = await this.findOne(userId, id);
        if (dto.name)
            goal.name = dto.name;
        if (dto.description)
            goal.description = dto.description;
        if (dto.targetAmount && dto.targetAmount <= 0) {
            throw new common_1.BadRequestException('Mục tiêu tiết kiệm phải lớn hơn 0');
        }
        if (dto.targetAmount)
            goal.targetAmount = dto.targetAmount;
        if (dto.icon)
            goal.icon = dto.icon;
        if (dto.startDate)
            goal.startDate = new Date(dto.startDate);
        if (dto.targetDate)
            goal.targetDate = new Date(dto.targetDate);
        const updated = await this.savingsGoalRepository.save(goal);
        return {
            ...updated,
            progressPercentage: Math.min((Number(updated.currentAmount) / Number(updated.targetAmount)) * 100, 100),
        };
    }
    async remove(userId, id) {
        const goal = await this.findOne(userId, id);
        await this.savingsGoalRepository.remove(goal);
        return { message: 'Đã xóa mục tiêu tiết kiệm' };
    }
    async addToGoal(userId, id, amount) {
        if (amount <= 0) {
            throw new common_1.BadRequestException('Số tiền phải lớn hơn 0');
        }
        const goal = await this.findOne(userId, id);
        goal.currentAmount = Number(goal.currentAmount) + Number(amount);
        if (goal.currentAmount >= goal.targetAmount) {
            goal.status = 'completed';
        }
        const updated = await this.savingsGoalRepository.save(goal);
        return {
            ...updated,
            progressPercentage: Math.min((Number(updated.currentAmount) / Number(updated.targetAmount)) * 100, 100),
            message: goal.currentAmount >= goal.targetAmount
                ? 'Chúc mừng! Bạn đã đạt được mục tiêu tiết kiệm'
                : 'Đã thêm tiền vào mục tiêu',
        };
    }
    async withdrawFromGoal(userId, id, amount) {
        if (amount <= 0) {
            throw new common_1.BadRequestException('Số tiền phải lớn hơn 0');
        }
        const goal = await this.findOne(userId, id);
        if (goal.currentAmount < amount) {
            throw new common_1.BadRequestException('Số tiền rút vượt quá số tiền hiện tại');
        }
        goal.currentAmount = Number(goal.currentAmount) - Number(amount);
        if (goal.status === 'completed') {
            goal.status = 'active';
        }
        const updated = await this.savingsGoalRepository.save(goal);
        return {
            ...updated,
            progressPercentage: Math.min((Number(updated.currentAmount) / Number(updated.targetAmount)) * 100, 100),
        };
    }
    async updateStatus(userId, id, status) {
        const goal = await this.findOne(userId, id);
        const validStatuses = ['active', 'completed', 'paused', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new common_1.BadRequestException('Trạng thái không hợp lệ');
        }
        goal.status = status;
        const updated = await this.savingsGoalRepository.save(goal);
        return {
            ...updated,
            progressPercentage: Math.min((Number(updated.currentAmount) / Number(updated.targetAmount)) * 100, 100),
        };
    }
    async getProgress(userId, id) {
        const goal = await this.findOne(userId, id);
        const progressPercentage = Math.min((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100, 100);
        const remainingAmount = Math.max(Number(goal.targetAmount) - Number(goal.currentAmount), 0);
        return {
            goalId: goal.id,
            goalName: goal.name,
            currentAmount: goal.currentAmount,
            targetAmount: goal.targetAmount,
            remainingAmount,
            progressPercentage,
            status: goal.status,
            startDate: goal.startDate,
            targetDate: goal.targetDate,
            daysRemaining: goal.targetDate
                ? Math.max(Math.ceil((goal.targetDate.getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)), 0)
                : null,
        };
    }
};
exports.SavingsGoalsService = SavingsGoalsService;
exports.SavingsGoalsService = SavingsGoalsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(savings_goal_entity_1.SavingsGoal)),
    __param(1, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SavingsGoalsService);
//# sourceMappingURL=savings-goals.service.js.map