import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPoints } from '../../entities/user-points.entity';
import { PointsHistory } from '../../entities/points-history.entity';
import { Achievement } from '../../entities/achievement.entity';
import { UserAchievement } from '../../entities/user-achievement.entity';

@Injectable()
export class GamificationService {
  private readonly POINTS_CONFIG = {
    TRANSACTION_ADDED: 5,
    BUDGET_CREATED: 10,
    BUDGET_COMPLETED: 20,
    SAVINGS_GOAL_CREATED: 15,
    SAVINGS_GOAL_ACHIEVED: 50,
    BILL_PAID_ON_TIME: 10,
    DAILY_LOGIN: 5,
    WEEKLY_STREAK: 25,
    MONTHLY_STREAK: 100,
    EXPORT_DATA: 5,
    PROFILE_COMPLETED: 20,
  };

  private readonly RANK_THRESHOLDS = [
    { rank: 'Người mới', minPoints: 0 },
    { rank: 'Đồng', minPoints: 100 },
    { rank: 'Bạc', minPoints: 500 },
    { rank: 'Vàng', minPoints: 1500 },
    { rank: 'Bạch kim', minPoints: 3000 },
    { rank: 'Kim cương', minPoints: 6000 },
    { rank: 'Huyền thoại', minPoints: 10000 },
  ];

  constructor(
    @InjectRepository(UserPoints)
    private userPointsRepo: Repository<UserPoints>,
    @InjectRepository(PointsHistory)
    private pointsHistoryRepo: Repository<PointsHistory>,
    @InjectRepository(Achievement)
    private achievementRepo: Repository<Achievement>,
    @InjectRepository(UserAchievement)
    private userAchievementRepo: Repository<UserAchievement>,
  ) {}

  // Initialize user points
  async initializeUserPoints(userId: number): Promise<UserPoints> {
    const existing = await this.userPointsRepo.findOne({ where: { userId } });
    if (existing) return existing;

    const userPoints = this.userPointsRepo.create({
      userId,
      totalPoints: 0,
      level: 1,
      currentLevelPoints: 0,
      nextLevelPoints: 100,
      dailyStreak: 0,
      longestStreak: 0,
      rank: 'Người mới',
    });

    return await this.userPointsRepo.save(userPoints);
  }

  // Award points for action
  async awardPoints(
    userId: number,
    action: string,
    description?: string,
    metadata?: any,
  ): Promise<{ points: number; levelUp: boolean; newLevel?: number }> {
    const pointsToAward = this.POINTS_CONFIG[action] || 0;
    if (pointsToAward === 0) {
      return { points: 0, levelUp: false };
    }

    // Get or create user points
    let userPoints = await this.userPointsRepo.findOne({ where: { userId } });
    if (!userPoints) {
      userPoints = await this.initializeUserPoints(userId);
    }

    // Add points
    userPoints.totalPoints += pointsToAward;
    userPoints.currentLevelPoints += pointsToAward;

    // Check for level up
    let levelUp = false;
    let newLevel = userPoints.level;

    while (userPoints.currentLevelPoints >= userPoints.nextLevelPoints) {
      levelUp = true;
      userPoints.currentLevelPoints -= userPoints.nextLevelPoints;
      userPoints.level += 1;
      newLevel = userPoints.level;
      userPoints.nextLevelPoints = this.calculateNextLevelPoints(userPoints.level);
    }

    // Update rank
    userPoints.rank = this.calculateRank(userPoints.totalPoints);

    await this.userPointsRepo.save(userPoints);

    // Record points history
    await this.pointsHistoryRepo.save({
      userId,
      points: pointsToAward,
      action,
      description,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });

    // Check achievements
    await this.checkAchievements(userId);

    return { points: pointsToAward, levelUp, newLevel: levelUp ? newLevel : undefined };
  }

  // Calculate next level points requirement
  private calculateNextLevelPoints(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  // Calculate rank based on total points
  private calculateRank(totalPoints: number): string {
    for (let i = this.RANK_THRESHOLDS.length - 1; i >= 0; i--) {
      if (totalPoints >= this.RANK_THRESHOLDS[i].minPoints) {
        return this.RANK_THRESHOLDS[i].rank;
      }
    }
    return 'Người mới';
  }

  // Update daily streak
  async updateDailyStreak(userId: number): Promise<{ streak: number; pointsAwarded: number }> {
    let userPoints = await this.userPointsRepo.findOne({ where: { userId } });
    if (!userPoints) {
      userPoints = await this.initializeUserPoints(userId);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivity = userPoints.lastActivityDate
      ? new Date(userPoints.lastActivityDate)
      : null;

    if (lastActivity) {
      lastActivity.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Consecutive day
        userPoints.dailyStreak += 1;
      } else if (daysDiff > 1) {
        // Streak broken
        userPoints.dailyStreak = 1;
      }
      // If daysDiff === 0, same day, don't change streak
    } else {
      userPoints.dailyStreak = 1;
    }

    userPoints.lastActivityDate = new Date();

    if (userPoints.dailyStreak > userPoints.longestStreak) {
      userPoints.longestStreak = userPoints.dailyStreak;
    }

    await this.userPointsRepo.save(userPoints);

    // Award streak bonus
    let pointsAwarded = 0;
    if (userPoints.dailyStreak % 7 === 0) {
      await this.awardPoints(userId, 'WEEKLY_STREAK', `Chuỗi ${userPoints.dailyStreak} ngày`);
      pointsAwarded = this.POINTS_CONFIG.WEEKLY_STREAK;
    } else if (userPoints.dailyStreak % 30 === 0) {
      await this.awardPoints(userId, 'MONTHLY_STREAK', `Chuỗi ${userPoints.dailyStreak} ngày`);
      pointsAwarded = this.POINTS_CONFIG.MONTHLY_STREAK;
    }

    return { streak: userPoints.dailyStreak, pointsAwarded };
  }

  // Get user points and stats
  async getUserStats(userId: number): Promise<any> {
    let userPoints = await this.userPointsRepo.findOne({ where: { userId } });
    if (!userPoints) {
      userPoints = await this.initializeUserPoints(userId);
    }

    const recentHistory = await this.pointsHistoryRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const achievements = await this.getUserAchievements(userId);

    return {
      ...userPoints,
      progressToNextLevel: Math.floor(
        (userPoints.currentLevelPoints / userPoints.nextLevelPoints) * 100,
      ),
      recentActivity: recentHistory,
      achievements: {
        total: achievements.length,
        unlocked: achievements.filter(a => a.isUnlocked).length,
        locked: achievements.filter(a => !a.isUnlocked).length,
      },
    };
  }

  // Get leaderboard
  async getLeaderboard(limit: number = 50): Promise<any[]> {
    return await this.userPointsRepo.find({
      relations: ['user'],
      order: { totalPoints: 'DESC' },
      take: limit,
    });
  }

  // Get points history
  async getPointsHistory(userId: number, limit: number = 50): Promise<PointsHistory[]> {
    return await this.pointsHistoryRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // Seed achievements
  async seedAchievements(): Promise<void> {
    const achievements = [
      {
        name: 'Bước đầu tiên',
        description: 'Thêm giao dịch đầu tiên',
        category: 'TRACKING',
        icon: '🎯',
        rarity: 'COMMON',
        points: 10,
        criteria: JSON.stringify({ type: 'TRANSACTION_COUNT', value: 1 }),
      },
      {
        name: 'Người ghi chép',
        description: 'Thêm 50 giao dịch',
        category: 'TRACKING',
        icon: '📝',
        rarity: 'RARE',
        points: 50,
        criteria: JSON.stringify({ type: 'TRANSACTION_COUNT', value: 50 }),
      },
      {
        name: 'Chuyên gia tài chính',
        description: 'Thêm 200 giao dịch',
        category: 'TRACKING',
        icon: '💼',
        rarity: 'EPIC',
        points: 200,
        criteria: JSON.stringify({ type: 'TRANSACTION_COUNT', value: 200 }),
      },
      {
        name: 'Người lập kế hoạch',
        description: 'Tạo ngân sách đầu tiên',
        category: 'BUDGETING',
        icon: '📊',
        rarity: 'COMMON',
        points: 15,
        criteria: JSON.stringify({ type: 'BUDGET_COUNT', value: 1 }),
      },
      {
        name: 'Kỷ luật tài chính',
        description: 'Hoàn thành 5 ngân sách',
        category: 'BUDGETING',
        icon: '🎖️',
        rarity: 'RARE',
        points: 75,
        criteria: JSON.stringify({ type: 'BUDGET_COMPLETED', value: 5 }),
      },
      {
        name: 'Người tiết kiệm',
        description: 'Đạt mục tiêu tiết kiệm đầu tiên',
        category: 'SAVINGS',
        icon: '💰',
        rarity: 'RARE',
        points: 100,
        criteria: JSON.stringify({ type: 'SAVINGS_GOAL_ACHIEVED', value: 1 }),
      },
      {
        name: 'Triệu phú',
        description: 'Tiết kiệm được 10 triệu đồng',
        category: 'SAVINGS',
        icon: '💎',
        rarity: 'EPIC',
        points: 250,
        criteria: JSON.stringify({ type: 'TOTAL_SAVINGS', value: 10000000 }),
      },
      {
        name: 'Chuỗi 7 ngày',
        description: 'Đăng nhập liên tục 7 ngày',
        category: 'STREAK',
        icon: '🔥',
        rarity: 'COMMON',
        points: 30,
        criteria: JSON.stringify({ type: 'DAILY_STREAK', value: 7 }),
      },
      {
        name: 'Chuỗi 30 ngày',
        description: 'Đăng nhập liên tục 30 ngày',
        category: 'STREAK',
        icon: '⚡',
        rarity: 'EPIC',
        points: 150,
        criteria: JSON.stringify({ type: 'DAILY_STREAK', value: 30 }),
      },
      {
        name: 'Huyền thoại',
        description: 'Đăng nhập liên tục 100 ngày',
        category: 'STREAK',
        icon: '👑',
        rarity: 'LEGENDARY',
        points: 500,
        criteria: JSON.stringify({ type: 'DAILY_STREAK', value: 100 }),
      },
    ];

    for (const achievement of achievements) {
      const existing = await this.achievementRepo.findOne({
        where: { name: achievement.name },
      });
      if (!existing) {
        await this.achievementRepo.save(achievement);
      }
    }
  }

  // Check and update achievements
  async checkAchievements(userId: number): Promise<void> {
    const achievements = await this.achievementRepo.find({ where: { isActive: true } });

    for (const achievement of achievements) {
      const criteria = JSON.parse(achievement.criteria);
      const progress = await this.calculateAchievementProgress(userId, criteria);

      let userAchievement = await this.userAchievementRepo.findOne({
        where: { userId, achievementId: achievement.id },
      });

      if (!userAchievement) {
        userAchievement = this.userAchievementRepo.create({
          userId,
          achievementId: achievement.id,
          progress: 0,
          isUnlocked: false,
        });
      }

      userAchievement.progress = Math.min(progress, 100);

      if (progress >= 100 && !userAchievement.isUnlocked) {
        userAchievement.isUnlocked = true;
        userAchievement.unlockedAt = new Date();
        
        // Award achievement points
        await this.awardPoints(
          userId,
          'ACHIEVEMENT_UNLOCKED',
          `Mở khóa: ${achievement.name}`,
          { achievementId: achievement.id },
        );
      }

      await this.userAchievementRepo.save(userAchievement);
    }
  }

  // Calculate achievement progress
  private async calculateAchievementProgress(userId: number, criteria: any): Promise<number> {
    // This is a simplified version - implement based on your criteria types
    // You would query relevant data and calculate progress
    return 0; // Placeholder
  }

  // Get user achievements
  async getUserAchievements(userId: number): Promise<any[]> {
    return await this.userAchievementRepo.find({
      where: { userId },
      relations: ['achievement'],
      order: { isUnlocked: 'DESC', progress: 'DESC' },
    });
  }

  // Get all achievements
  async getAllAchievements(): Promise<Achievement[]> {
    return await this.achievementRepo.find({
      where: { isActive: true },
      order: { rarity: 'ASC', points: 'ASC' },
    });
  }
}
