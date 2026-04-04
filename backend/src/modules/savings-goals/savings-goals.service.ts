import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavingsGoal } from '../../entities/savings-goal.entity';
import { Wallet } from '../../entities/wallet.entity';
import { CreateSavingsGoalDto } from './dto/create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './dto/update-savings-goal.dto';
import { QuerySavingsGoalDto } from './dto/query-savings-goal.dto';

@Injectable()
export class SavingsGoalsService {
  constructor(
    @InjectRepository(SavingsGoal)
    private savingsGoalRepository: Repository<SavingsGoal>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {}

  async create(userId: number, dto: CreateSavingsGoalDto) {
    if (dto.targetAmount <= 0) {
      throw new BadRequestException('Mục tiêu tiết kiệm phải lớn hơn 0');
    }

    // Verify wallet exists
    const wallet = await this.walletRepository.findOne({
      where: { id: dto.walletId, userId },
    });
    if (!wallet) {
      throw new NotFoundException('Ví không tìm thấy');
    }

    // Ensure dates are properly converted
    const startDate = new Date(dto.startDate);
    const targetDate = dto.targetDate ? new Date(dto.targetDate) : null;
    
    if (isNaN(startDate.getTime())) {
      throw new BadRequestException('Ngày bắt đầu không hợp lệ');
    }
    if (targetDate && isNaN(targetDate.getTime())) {
      throw new BadRequestException('Ngày mục tiêu không hợp lệ');
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

  async findAll(userId: number, query: QuerySavingsGoalDto) {
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

    // Calculate progress percentage for each goal
    return goals.map((goal) => ({
      ...goal,
      progressPercentage: Math.min(
        (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100,
        100,
      ),
    }));
  }

  async findOne(userId: number, id: number) {
    const goal = await this.savingsGoalRepository.findOne({
      where: { id, userId },
      relations: ['wallet'],
    });
    if (!goal) {
      throw new NotFoundException('Không tìm thấy mục tiêu tiết kiệm');
    }

    return {
      ...goal,
      progressPercentage: Math.min(
        (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100,
        100,
      ),
    };
  }

  async update(userId: number, id: number, dto: UpdateSavingsGoalDto) {
    const goal = await this.findOne(userId, id);

    // Update fields if provided
    if (dto.name) goal.name = dto.name;
    if (dto.description) goal.description = dto.description;
    if (dto.targetAmount && dto.targetAmount <= 0) {
      throw new BadRequestException('Mục tiêu tiết kiệm phải lớn hơn 0');
    }
    if (dto.targetAmount) goal.targetAmount = dto.targetAmount;
    if (dto.icon) goal.icon = dto.icon;
    if (dto.startDate) goal.startDate = new Date(dto.startDate);
    if (dto.targetDate) goal.targetDate = new Date(dto.targetDate);

    const updated = await this.savingsGoalRepository.save(goal);

    return {
      ...updated,
      progressPercentage: Math.min(
        (Number(updated.currentAmount) / Number(updated.targetAmount)) * 100,
        100,
      ),
    };
  }

  async remove(userId: number, id: number) {
    const goal = await this.findOne(userId, id);
    await this.savingsGoalRepository.remove(goal);
    return { message: 'Đã xóa mục tiêu tiết kiệm' };
  }

  async addToGoal(userId: number, id: number, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Số tiền phải lớn hơn 0');
    }

    const goal = await this.findOne(userId, id);

    goal.currentAmount = Number(goal.currentAmount) + Number(amount);

    // Check if goal is completed
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    const updated = await this.savingsGoalRepository.save(goal);

    return {
      ...updated,
      progressPercentage: Math.min(
        (Number(updated.currentAmount) / Number(updated.targetAmount)) * 100,
        100,
      ),
      message:
        goal.currentAmount >= goal.targetAmount
          ? 'Chúc mừng! Bạn đã đạt được mục tiêu tiết kiệm'
          : 'Đã thêm tiền vào mục tiêu',
    };
  }

  async withdrawFromGoal(userId: number, id: number, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Số tiền phải lớn hơn 0');
    }

    const goal = await this.findOne(userId, id);

    if (goal.currentAmount < amount) {
      throw new BadRequestException('Số tiền rút vượt quá số tiền hiện tại');
    }

    goal.currentAmount = Number(goal.currentAmount) - Number(amount);

    // Reset status if not completed
    if (goal.status === 'completed') {
      goal.status = 'active';
    }

    const updated = await this.savingsGoalRepository.save(goal);

    return {
      ...updated,
      progressPercentage: Math.min(
        (Number(updated.currentAmount) / Number(updated.targetAmount)) * 100,
        100,
      ),
    };
  }

  async updateStatus(userId: number, id: number, status: string) {
    const goal = await this.findOne(userId, id);

    const validStatuses = ['active', 'completed', 'paused', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Trạng thái không hợp lệ');
    }

    goal.status = status;
    const updated = await this.savingsGoalRepository.save(goal);

    return {
      ...updated,
      progressPercentage: Math.min(
        (Number(updated.currentAmount) / Number(updated.targetAmount)) * 100,
        100,
      ),
    };
  }

  async getProgress(userId: number, id: number) {
    const goal = await this.findOne(userId, id);
    const progressPercentage = Math.min(
      (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100,
      100,
    );

    const remainingAmount = Math.max(
      Number(goal.targetAmount) - Number(goal.currentAmount),
      0,
    );

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
        ? Math.max(
            Math.ceil(
              (goal.targetDate.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24),
            ),
            0,
          )
        : null,
    };
  }
}
