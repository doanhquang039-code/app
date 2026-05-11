import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  LinearProgress,
  Chip,
  Badge,
  IconButton,
  Tooltip,
  Alert,
  Button,
} from '@mui/material';
import {
  EmojiEvents,
  Star,
  TrendingUp,
  LocalFireDepartment,
  Refresh,
  Lock,
  CheckCircle,
  Timer,
} from '@mui/icons-material';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  target: number;
  expiresAt: string;
  completed: boolean;
}

interface UserStats {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalPoints: number;
  streak: number;
  rank: string;
  achievements: Achievement[];
  challenges: Challenge[];
}

export const AIGamification: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai-advisor/gamification-stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching gamification stats:', error);
      // Mock data
      setStats({
        level: 12,
        currentXP: 2450,
        nextLevelXP: 3000,
        totalPoints: 15680,
        streak: 7,
        rank: 'Chuyên gia Tài chính',
        achievements: [
          {
            id: '1',
            title: 'Người mới bắt đầu',
            description: 'Tạo giao dịch đầu tiên',
            icon: '🎯',
            unlocked: true,
            unlockedAt: '2026-04-15',
            progress: 1,
            maxProgress: 1,
            rarity: 'common',
            points: 10,
          },
          {
            id: '2',
            title: 'Tiết kiệm siêu hạng',
            description: 'Tiết kiệm được 10 triệu đồng',
            icon: '💰',
            unlocked: true,
            unlockedAt: '2026-04-28',
            progress: 10000000,
            maxProgress: 10000000,
            rarity: 'rare',
            points: 50,
          },
          {
            id: '3',
            title: 'Streak Master',
            description: 'Ghi chép chi tiêu 30 ngày liên tiếp',
            icon: '🔥',
            unlocked: false,
            progress: 7,
            maxProgress: 30,
            rarity: 'epic',
            points: 100,
          },
          {
            id: '4',
            title: 'Ngân sách hoàn hảo',
            description: 'Không vượt ngân sách trong 3 tháng',
            icon: '🎯',
            unlocked: false,
            progress: 1,
            maxProgress: 3,
            rarity: 'epic',
            points: 150,
          },
          {
            id: '5',
            title: 'Triệu phú',
            description: 'Tổng tiết kiệm đạt 100 triệu',
            icon: '👑',
            unlocked: false,
            progress: 15000000,
            maxProgress: 100000000,
            rarity: 'legendary',
            points: 500,
          },
        ],
        challenges: [
          {
            id: '1',
            title: 'Thử thách tuần này',
            description: 'Chi tiêu dưới 2 triệu đồng',
            reward: 50,
            progress: 1200000,
            target: 2000000,
            expiresAt: '2026-05-10',
            completed: false,
          },
          {
            id: '2',
            title: 'Ghi chép hàng ngày',
            description: 'Ghi chép chi tiêu 7 ngày liên tiếp',
            reward: 30,
            progress: 5,
            target: 7,
            expiresAt: '2026-05-12',
            completed: false,
          },
          {
            id: '3',
            title: 'Tiết kiệm thông minh',
            description: 'Tiết kiệm 500k trong tuần',
            reward: 40,
            progress: 500000,
            target: 500000,
            expiresAt: '2026-05-10',
            completed: true,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return '#9E9E9E';
      case 'rare':
        return '#2196F3';
      case 'epic':
        return '#9C27B0';
      case 'legendary':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'Thường';
      case 'rare':
        return 'Hiếm';
      case 'epic':
        return 'Sử thi';
      case 'legendary':
        return 'Huyền thoại';
      default:
        return rarity;
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} ngày`;
    if (hours > 0) return `${hours} giờ`;
    return 'Sắp hết hạn';
  };

  if (loading || !stats) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography>Đang tải...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const xpProgress = (stats.currentXP / stats.nextLevelXP) * 100;

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmojiEvents sx={{ fontSize: 32, color: 'warning.main' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Gamification
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Thành tựu & Thử thách
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={fetchUserStats} size="small">
            <Refresh />
          </IconButton>
        </Box>

        {/* Level & XP */}
        <Card variant="outlined" sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      margin: '0 auto',
                      fontSize: 32,
                      fontWeight: 'bold',
                    }}
                  >
                    {stats.level}
                  </Avatar>
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    Level {stats.level}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 9 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {stats.rank}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Star sx={{ fontSize: 20 }} />
                  <Typography variant="body2">
                    {stats.currentXP.toLocaleString()} / {stats.nextLevelXP.toLocaleString()} XP
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={xpProgress}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'white',
                    },
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Chip
                    icon={<LocalFireDepartment />}
                    label={`${stats.streak} ngày streak`}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                  <Chip
                    icon={<TrendingUp />}
                    label={`${stats.totalPoints.toLocaleString()} điểm`}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Active Challenges */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
            🎯 Thử thách đang diễn ra
          </Typography>
          <Grid container spacing={2}>
            {stats.challenges.filter(c => !c.completed).map((challenge) => (
              <Grid size={{ xs: 12, md: 6 }} key={challenge.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {challenge.title}
                      </Typography>
                      <Chip
                        icon={<Timer />}
                        label={getTimeRemaining(challenge.expiresAt)}
                        size="small"
                        color="warning"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {challenge.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption">
                          Tiến độ: {challenge.progress.toLocaleString()} / {challenge.target.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
                          +{challenge.reward} XP
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(challenge.progress / challenge.target) * 100}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Completed Challenges */}
        {stats.challenges.some(c => c.completed) && (
          <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              🎉 Hoàn thành thử thách!
            </Typography>
            {stats.challenges.filter(c => c.completed).map((challenge) => (
              <Typography key={challenge.id} variant="caption" sx={{ display: 'block' }}>
                • {challenge.title} (+{challenge.reward} XP)
              </Typography>
            ))}
          </Alert>
        )}

        {/* Achievements */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
            🏆 Thành tựu ({stats.achievements.filter(a => a.unlocked).length}/{stats.achievements.length})
          </Typography>
          <Grid container spacing={2}>
            {stats.achievements.map((achievement) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={achievement.id}>
                <Card
                  variant="outlined"
                  sx={{
                    opacity: achievement.unlocked ? 1 : 0.5,
                    borderColor: achievement.unlocked ? getRarityColor(achievement.rarity) : 'divider',
                    borderWidth: achievement.unlocked ? 2 : 1,
                    position: 'relative',
                  }}
                >
                  <CardContent>
                    {!achievement.unlocked && (
                      <Lock
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          fontSize: 20,
                          color: 'text.disabled',
                        }}
                      />
                    )}
                    <Box sx={{ textAlign: 'center', mb: 1 }}>
                      <Typography sx={{ fontSize: 40 }}>{achievement.icon}</Typography>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 0.5 }}>
                      {achievement.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 1 }}>
                      {achievement.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mb: 1 }}>
                      <Chip
                        label={getRarityLabel(achievement.rarity)}
                        size="small"
                        sx={{
                          bgcolor: getRarityColor(achievement.rarity),
                          color: 'white',
                          fontSize: 10,
                        }}
                      />
                      <Chip
                        label={`${achievement.points} điểm`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: 10 }}
                      />
                    </Box>
                    {!achievement.unlocked && (
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(achievement.progress / achievement.maxProgress) * 100}
                          sx={{ height: 4, borderRadius: 2 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
                          {achievement.progress.toLocaleString()} / {achievement.maxProgress.toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                    {achievement.unlocked && achievement.unlockedAt && (
                      <Typography variant="caption" color="success.main" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                        ✓ Mở khóa {new Date(achievement.unlockedAt).toLocaleDateString('vi-VN')}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Motivational Message */}
        <Alert severity="info" icon={<LocalFireDepartment />} sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Tiếp tục phát huy!</strong> Bạn đang có streak {stats.streak} ngày. 
            Hãy duy trì để nhận thêm nhiều phần thưởng! 🔥
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default AIGamification;
