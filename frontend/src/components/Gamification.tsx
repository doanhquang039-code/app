import React, { useState, useEffect } from 'react';
import { Trophy, Award, TrendingUp, Zap, Star, Users } from 'lucide-react';
import axios from 'axios';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt?: Date;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  completed: boolean;
}

interface UserStats {
  level: number;
  points: number;
  nextLevelPoints: number;
  badges: Badge[];
  achievements: Achievement[];
  streak: number;
  rank: number;
  totalUsers: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  points: number;
  level: number;
  badges: number;
}

export const Gamification: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'leaderboard'>('stats');

  useEffect(() => {
    loadStats();
    loadLeaderboard();
  }, []);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/gamification/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/gamification/leaderboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 border-gray-300';
      case 'rare':
        return 'bg-blue-100 border-blue-300';
      case 'epic':
        return 'bg-purple-100 border-purple-300';
      case 'legendary':
        return 'bg-yellow-100 border-yellow-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const levelProgress = ((stats.points % 500) / 500) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Thành Tích & Xếp Hạng
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'stats'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Thống Kê
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'achievements'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Thành Tựu
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'leaderboard'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Bảng Xếp Hạng
          </button>
        </div>
      </div>

      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Level & Points */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm opacity-90">Level</p>
                <p className="text-4xl font-bold">{stats.level}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Điểm</p>
                <p className="text-2xl font-bold">{stats.points.toLocaleString()}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tiến độ lên level {stats.level + 1}</span>
                <span>{Math.round(levelProgress)}%</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-3">
                <div
                  className="bg-white rounded-full h-3 transition-all duration-500"
                  style={{ width: `${levelProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{stats.streak}</p>
              <p className="text-sm text-gray-600">Ngày liên tiếp</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{stats.badges.length}</p>
              <p className="text-sm text-gray-600">Huy hiệu</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">#{stats.rank}</p>
              <p className="text-sm text-gray-600">Xếp hạng</p>
            </div>
          </div>

          {/* Badges */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Huy Hiệu Đã Đạt
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {stats.badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`border-2 rounded-lg p-3 text-center ${getRarityColor(badge.rarity)}`}
                >
                  <div className="text-3xl mb-1">{badge.icon}</div>
                  <p className="text-xs font-medium text-gray-800">{badge.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-4">
          {stats.achievements.map((achievement) => (
            <div key={achievement.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">{achievement.title}</h3>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4" />
                  <span className="text-sm font-medium">+{achievement.reward}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    {achievement.progress.toLocaleString()} / {achievement.target.toLocaleString()}
                  </span>
                  <span>{Math.round((achievement.progress / achievement.target) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 rounded-full h-2 transition-all duration-500"
                    style={{
                      width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-4 text-gray-600">
            <Users className="w-5 h-5" />
            <span className="text-sm">Top {leaderboard.length} người dùng</span>
          </div>
          {leaderboard.map((entry) => (
            <div
              key={entry.userId}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                entry.rank <= 3
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    entry.rank === 1
                      ? 'bg-yellow-400 text-white'
                      : entry.rank === 2
                        ? 'bg-gray-300 text-white'
                        : entry.rank === 3
                          ? 'bg-orange-400 text-white'
                          : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {entry.rank}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{entry.username}</p>
                  <p className="text-sm text-gray-600">
                    Level {entry.level} • {entry.badges} huy hiệu
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">
                  {entry.points.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600">điểm</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
