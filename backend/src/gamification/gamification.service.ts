import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt?: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number; // points
  completed: boolean;
}

export interface UserStats {
  level: number;
  points: number;
  nextLevelPoints: number;
  badges: Badge[];
  achievements: Achievement[];
  streak: number; // consecutive days
  rank: number;
  totalUsers: number;
}

@Injectable()
export class GamificationService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  private readonly BADGES: Badge[] = [
    {
      id: 'first_transaction',
      name: 'Bước đầu tiên',
      description: 'Tạo giao dịch đầu tiên',
      icon: '🎯',
      rarity: 'common',
    },
    {
      id: 'budget_master',
      name: 'Chuyên gia ngân sách',
      description: 'Tuân thủ ngân sách 3 tháng liên tiếp',
      icon: '💰',
      rarity: 'rare',
    },
    {
      id: 'savings_hero',
      name: 'Anh hùng tiết kiệm',
      description: 'Đạt 5 mục tiêu tiết kiệm',
      icon: '🏆',
      rarity: 'epic',
    },
    {
      id: 'millionaire',
      name: 'Triệu phú',
      description: 'Tổng tài sản đạt 1 triệu',
      icon: '💎',
      rarity: 'legendary',
    },
    {
      id: 'streak_7',
      name: 'Kiên trì 7 ngày',
      description: 'Ghi chép chi tiêu 7 ngày liên tiếp',
      icon: '🔥',
      rarity: 'common',
    },
    {
      id: 'streak_30',
      name: 'Kiên trì 30 ngày',
      description: 'Ghi chép chi tiêu 30 ngày liên tiếp',
      icon: '⚡',
      rarity: 'rare',
    },
    {
      id: 'early_bird',
      name: 'Chim sớm',
      description: 'Ghi chép trước 8h sáng 10 lần',
      icon: '🌅',
      rarity: 'common',
    },
    {
      id: 'night_owl',
      name: 'Cú đêm',
      description: 'Ghi chép sau 10h tối 10 lần',
      icon: '🦉',
      rarity: 'common',
    },
    {
      id: 'category_master',
      name: 'Chuyên gia phân loại',
      description: 'Sử dụng đủ 10 danh mục khác nhau',
      icon: '📊',
      rarity: 'rare',
    },
    {
      id: 'social_butterfly',
      name: 'Bướm xã hội',
      description: 'Tham gia 5 nhóm chi tiêu',
      icon: '🦋',
      rarity: 'rare',
    },
  ];

  async getUserStats(userId: number): Promise<UserStats> {
    // Calculate user level and points
    const user = await this.userRepo.findOne({ where: { id: userId } });
    
    // Mock data - in real app, store in database
    const points = 1250;
    const level = Math.floor(points / 500) + 1;
    const nextLevelPoints = level * 500;

    // Get earned badges
    const earnedBadges = this.BADGES.slice(0, 3).map((badge) => ({
      ...badge,
      earnedAt: new Date(),
    }));

    // Get achievements
    const achievements: Achievement[] = [
      {
        id: 'transactions_100',
        title: '100 giao dịch',
        description: 'Tạo 100 giao dịch',
        progress: 45,
        target: 100,
        reward: 100,
        completed: false,
      },
      {
        id: 'savings_1m',
        title: 'Tiết kiệm 1 triệu',
        description: 'Tiết kiệm được 1 triệu đồng',
        progress: 750000,
        target: 1000000,
        reward: 200,
        completed: false,
      },
      {
        id: 'budget_perfect',
        title: 'Ngân sách hoàn hảo',
        description: 'Không vượt ngân sách trong 1 tháng',
        progress: 15,
        target: 30,
        reward: 150,
        completed: false,
      },
    ];

    // Calculate streak
    const streak = 7; // Mock data

    // Get rank
    const totalUsers = await this.userRepo.count();
    const rank = Math.floor(Math.random() * totalUsers) + 1;

    return {
      level,
      points,
      nextLevelPoints,
      badges: earnedBadges,
      achievements,
      streak,
      rank,
      totalUsers,
    };
  }

  async getLeaderboard(limit: number = 10) {
    // Mock leaderboard data
    const leaderboard = Array.from({ length: limit }, (_, i) => ({
      rank: i + 1,
      userId: i + 1,
      username: `User${i + 1}`,
      points: 5000 - i * 200,
      level: Math.floor((5000 - i * 200) / 500) + 1,
      badges: Math.floor(Math.random() * 10),
    }));

    return leaderboard;
  }

  async awardBadge(userId: number, badgeId: string): Promise<Badge> {
    const badge = this.BADGES.find((b) => b.id === badgeId);
    if (!badge) {
      throw new Error('Badge not found');
    }

    // In real app, save to database
    return {
      ...badge,
      earnedAt: new Date(),
    };
  }

  async addPoints(userId: number, points: number): Promise<number> {
    // In real app, update user points in database
    return points;
  }

  async checkAchievements(userId: number): Promise<Achievement[]> {
    // Check if user completed any achievements
    const stats = await this.getUserStats(userId);
    return stats.achievements.filter((a) => a.progress >= a.target && !a.completed);
  }
}
