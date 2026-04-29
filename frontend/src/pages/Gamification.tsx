import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { toast } from 'sonner'
import {
  Trophy,
  Star,
  Award,
  TrendingUp,
  Crown,
  Zap,
  Target,
  Calendar,
  Gift,
  Medal,
} from 'lucide-react'

interface PointHistory {
  id: number
  points: number
  action: string
  description: string
  createdAt: string
}

interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  category: string
  pointsReward: number
  requirement: number
  userAchievement?: {
    unlockedAt: string
    progress: number
  }
}

interface LeaderboardEntry {
  rank: number
  userId: number
  username: string
  totalPoints: number
  level: number
  rankTitle: string
  dailyStreak: number
}

export default function Gamification() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'leaderboard'>('overview')

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const { data } = await api.get('/gamification/stats')
      return data
    },
  })

  // Fetch points history
  const { data: pointsHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['points-history'],
    queryFn: async () => {
      const { data } = await api.get('/gamification/points-history?limit=20')
      return data
    },
    enabled: activeTab === 'overview',
  })

  // Fetch achievements
  const { data: achievements } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data } = await api.get('/gamification/achievements')
      return data
    },
    enabled: activeTab === 'achievements',
  })

  // Fetch all achievements
  const { data: allAchievements, isLoading: allAchievementsLoading } = useQuery({
    queryKey: ['all-achievements'],
    queryFn: async () => {
      const { data } = await api.get('/gamification/achievements/all')
      return data
    },
    enabled: activeTab === 'achievements',
  })

  // Fetch leaderboard
  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data } = await api.get('/gamification/leaderboard?limit=50')
      return data
    },
    enabled: activeTab === 'leaderboard',
  })

  // Daily login mutation
  const dailyLoginMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/gamification/daily-login')
      return data
    },
    onSuccess: (data: any) => {
      toast.success(data.message || 'Đã cập nhật chuỗi đăng nhập')
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
      queryClient.invalidateQueries({ queryKey: ['points-history'] })
    },
    onError: () => {
      toast.error('Không thể cập nhật chuỗi đăng nhập')
    },
  })

  // Check achievements mutation
  const checkAchievementsMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/gamification/check-achievements')
      return data
    },
    onSuccess: () => {
      toast.success('Đã kiểm tra thành tích')
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
    },
    onError: () => {
      toast.error('Không thể kiểm tra thành tích')
    },
  })

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'LEGEND':
        return 'from-purple-500 to-pink-500'
      case 'MASTER':
        return 'from-red-500 to-orange-500'
      case 'DIAMOND':
        return 'from-blue-500 to-cyan-500'
      case 'PLATINUM':
        return 'from-gray-400 to-gray-600'
      case 'GOLD':
        return 'from-yellow-400 to-yellow-600'
      case 'SILVER':
        return 'from-gray-300 to-gray-400'
      case 'BRONZE':
        return 'from-orange-400 to-orange-600'
      default:
        return 'from-gray-200 to-gray-300'
    }
  }

  const getAchievementIcon = (icon: string) => {
    switch (icon) {
      case 'TROPHY':
        return <Trophy className="w-6 h-6" />
      case 'STAR':
        return <Star className="w-6 h-6" />
      case 'MEDAL':
        return <Medal className="w-6 h-6" />
      case 'CROWN':
        return <Crown className="w-6 h-6" />
      case 'TARGET':
        return <Target className="w-6 h-6" />
      case 'ZAP':
        return <Zap className="w-6 h-6" />
      default:
        return <Award className="w-6 h-6" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SAVINGS':
        return 'bg-green-100 text-green-700'
      case 'SPENDING':
        return 'bg-blue-100 text-blue-700'
      case 'BUDGET':
        return 'bg-purple-100 text-purple-700'
      case 'STREAK':
        return 'bg-orange-100 text-orange-700'
      case 'SOCIAL':
        return 'bg-pink-100 text-pink-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thành tích</h1>
          <p className="text-gray-600 mt-1">Điểm thưởng, xếp hạng và thành tích</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => dailyLoginMutation.mutate()}
            disabled={dailyLoginMutation.isPending}
            className="btn-secondary flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Điểm danh
          </button>
          <button
            onClick={() => checkAchievementsMutation.mutate()}
            disabled={checkAchievementsMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            Kiểm tra thành tích
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Tổng quan
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'achievements'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Thành tích
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'leaderboard'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Bảng xếp hạng
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* User Stats Card */}
          <div className="card">
            <div className="flex items-center gap-6">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getRankColor(userStats?.rank || 'BRONZE')} flex items-center justify-center`}>
                <Crown className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{userStats?.rank || 'BRONZE'}</h2>
                <p className="text-gray-600">Cấp độ {userStats?.level || 1}</p>
                <div className="mt-3 flex items-center gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Tổng điểm</p>
                    <p className="text-xl font-bold text-gray-900">{userStats?.totalPoints?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Chuỗi đăng nhập</p>
                    <p className="text-xl font-bold text-orange-600">{userStats?.dailyStreak || 0} ngày</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Điểm tích lũy</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {userStats?.totalPoints?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cấp độ</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{userStats?.level || 1}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Chuỗi đăng nhập</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{userStats?.dailyStreak || 0}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Points History */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử điểm</h3>
            {historyLoading ? (
              <p className="text-gray-500 text-center py-8">Đang tải...</p>
            ) : pointsHistory && pointsHistory.length > 0 ? (
              <div className="space-y-3">
                {pointsHistory.map((history: PointHistory) => (
                  <div key={history.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        history.points > 0 ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <Gift className={`w-5 h-5 ${history.points > 0 ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{history.description}</p>
                        <p className="text-sm text-gray-600">{history.action}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${history.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {history.points > 0 ? '+' : ''}{history.points}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(history.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Gift className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Chưa có lịch sử điểm</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          {/* Unlocked Achievements */}
          {achievements && achievements.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thành tích đã mở khóa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement: Achievement) => (
                  <div key={achievement.id} className="p-4 border-2 border-green-500 rounded-lg bg-green-50">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                        {getAchievementIcon(achievement.icon)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(achievement.category)}`}>
                            {achievement.category}
                          </span>
                          <span className="text-sm font-medium text-green-600">
                            +{achievement.pointsReward} điểm
                          </span>
                        </div>
                        {achievement.userAchievement && (
                          <p className="text-xs text-gray-500 mt-2">
                            Mở khóa: {new Date(achievement.userAchievement.unlockedAt).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Achievements */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tất cả thành tích</h3>
            {allAchievementsLoading ? (
              <p className="text-gray-500 text-center py-8">Đang tải...</p>
            ) : allAchievements && allAchievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allAchievements.map((achievement: Achievement) => {
                  const isUnlocked = achievements?.some((a: Achievement) => a.id === achievement.id)
                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 border rounded-lg ${
                        isUnlocked ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          isUnlocked ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
                        }`}>
                          {getAchievementIcon(achievement.icon)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(achievement.category)}`}>
                              {achievement.category}
                            </span>
                            <span className="text-sm font-medium text-gray-600">
                              +{achievement.pointsReward} điểm
                            </span>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Tiến độ</span>
                              <span>
                                {achievement.userAchievement?.progress || 0}/{achievement.requirement}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${isUnlocked ? 'bg-green-600' : 'bg-gray-400'}`}
                                style={{
                                  width: `${Math.min(
                                    ((achievement.userAchievement?.progress || 0) / achievement.requirement) * 100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Không có thành tích nào</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bảng xếp hạng</h3>
          {leaderboardLoading ? (
            <p className="text-gray-500 text-center py-8">Đang tải...</p>
          ) : leaderboard && leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((entry: LeaderboardEntry, index: number) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-400'
                      : index === 1
                      ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-400'
                      : index === 2
                      ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-400'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white font-bold text-lg">
                    {index === 0 ? (
                      <Crown className="w-8 h-8 text-yellow-500" />
                    ) : index === 1 ? (
                      <Crown className="w-7 h-7 text-gray-400" />
                    ) : index === 2 ? (
                      <Crown className="w-6 h-6 text-orange-400" />
                    ) : (
                      <span className="text-gray-600">#{entry.rank}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{entry.username}</p>
                      <span className={`px-2 py-1 rounded text-xs font-medium bg-gradient-to-r ${getRankColor(entry.rankTitle)} text-white`}>
                        {entry.rankTitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>Cấp {entry.level}</span>
                      <span>•</span>
                      <span>{entry.dailyStreak} ngày streak</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">{entry.totalPoints.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">điểm</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Chưa có dữ liệu xếp hạng</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
