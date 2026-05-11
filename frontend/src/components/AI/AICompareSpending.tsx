import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  CompareArrows,
  TrendingUp,
  TrendingDown,
  Refresh,
  People,
} from '@mui/icons-material';

interface ComparisonData {
  category: string;
  mySpending: number;
  averageSpending: number;
  percentile: number;
  trend: 'up' | 'down' | 'stable';
}

interface PeerComparison {
  ageGroup: string;
  incomeRange: string;
  location: string;
  comparisons: ComparisonData[];
  overallRank: number;
  totalUsers: number;
}

export const AICompareSpending: React.FC = () => {
  const [comparison, setComparison] = useState<PeerComparison | null>(null);
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComparison();
  }, [timeRange]);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai-advisor/compare-spending?timeRange=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setComparison(data);
    } catch (error) {
      console.error('Error fetching comparison:', error);
      // Mock data
      setComparison({
        ageGroup: '25-35 tuổi',
        incomeRange: '15-25 triệu/tháng',
        location: 'TP.HCM',
        overallRank: 3245,
        totalUsers: 10000,
        comparisons: [
          {
            category: 'Ăn uống',
            mySpending: 3500000,
            averageSpending: 4200000,
            percentile: 35,
            trend: 'down',
          },
          {
            category: 'Giải trí',
            mySpending: 2000000,
            averageSpending: 1500000,
            percentile: 65,
            trend: 'up',
          },
          {
            category: 'Di chuyển',
            mySpending: 1500000,
            averageSpending: 1800000,
            percentile: 40,
            trend: 'stable',
          },
          {
            category: 'Mua sắm',
            mySpending: 2500000,
            averageSpending: 3000000,
            percentile: 45,
            trend: 'down',
          },
          {
            category: 'Nhà cửa',
            mySpending: 5000000,
            averageSpending: 4500000,
            percentile: 55,
            trend: 'up',
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile <= 25) return '#4caf50'; // Green - Tốt
    if (percentile <= 50) return '#8bc34a'; // Light green
    if (percentile <= 75) return '#ff9800'; // Orange
    return '#f44336'; // Red - Cao
  };

  const getPercentileLabel = (percentile: number) => {
    if (percentile <= 25) return 'Rất tốt';
    if (percentile <= 50) return 'Tốt';
    if (percentile <= 75) return 'Trung bình';
    return 'Cao';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp sx={{ color: '#f44336', fontSize: 20 }} />;
      case 'down':
        return <TrendingDown sx={{ color: '#4caf50', fontSize: 20 }} />;
      default:
        return null;
    }
  };

  const getDifference = (mySpending: number, avgSpending: number) => {
    const diff = mySpending - avgSpending;
    const percent = ((diff / avgSpending) * 100).toFixed(1);
    return { diff, percent };
  };

  if (loading || !comparison) {
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

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CompareArrows color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                So Sánh Chi Tiêu
              </Typography>
              <Typography variant="caption" color="text.secondary">
                So với người dùng tương tự
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Thời gian</InputLabel>
              <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} label="Thời gian">
                <MenuItem value="week">Tuần này</MenuItem>
                <MenuItem value="month">Tháng này</MenuItem>
                <MenuItem value="quarter">Quý này</MenuItem>
                <MenuItem value="year">Năm này</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={fetchComparison} size="small">
              <Refresh />
            </IconButton>
          </Box>
        </Box>

        {/* Peer Group Info */}
        <Card variant="outlined" sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Nhóm so sánh của bạn:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={comparison.ageGroup} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              <Chip
                label={comparison.incomeRange}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Chip label={comparison.location} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
            </Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Xếp hạng: <strong>#{comparison.overallRank.toLocaleString()}</strong> / {comparison.totalUsers.toLocaleString()} người dùng
            </Typography>
          </CardContent>
        </Card>

        {/* Comparisons */}
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
          📊 So sánh theo danh mục
        </Typography>

        <Grid container spacing={2}>
          {comparison.comparisons.map((item) => {
            const { diff, percent } = getDifference(item.mySpending, item.averageSpending);
            const isLower = diff < 0;

            return (
              <Grid size={{ xs: 12 }} key={item.category}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {item.category}
                          </Typography>
                          {getTrendIcon(item.trend)}
                        </Box>
                        <Chip
                          label={`Percentile ${item.percentile}% - ${getPercentileLabel(item.percentile)}`}
                          size="small"
                          sx={{
                            bgcolor: `${getPercentileColor(item.percentile)}20`,
                            color: getPercentileColor(item.percentile),
                          }}
                        />
                      </Box>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Chi tiêu của bạn
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {item.mySpending.toLocaleString('vi-VN')}đ
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Trung bình nhóm
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {item.averageSpending.toLocaleString('vi-VN')}đ
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Alert
                      severity={isLower ? 'success' : 'warning'}
                      icon={isLower ? <TrendingDown /> : <TrendingUp />}
                      sx={{ mt: 2 }}
                    >
                      <Typography variant="body2">
                        {isLower ? (
                          <>
                            Bạn chi tiêu <strong>{Math.abs(Number(percent))}%</strong> ít hơn trung bình (
                            {Math.abs(diff).toLocaleString('vi-VN')}đ). Tuyệt vời! 👍
                          </>
                        ) : (
                          <>
                            Bạn chi tiêu <strong>{percent}%</strong> nhiều hơn trung bình (+
                            {diff.toLocaleString('vi-VN')}đ). Cân nhắc giảm chi tiêu.
                          </>
                        )}
                      </Typography>
                    </Alert>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Overall Insight */}
        <Alert severity="info" icon={<People />} sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>AI Insight:</strong> Dựa trên so sánh với {comparison.totalUsers.toLocaleString()} người dùng tương tự, bạn đang ở vị trí #{comparison.overallRank.toLocaleString()}. 
            {comparison.overallRank <= comparison.totalUsers * 0.3
              ? ' Bạn đang quản lý chi tiêu rất tốt! 🎉'
              : ' Hãy cải thiện các danh mục chi tiêu cao để tiết kiệm nhiều hơn.'}
          </Typography>
        </Alert>

        {/* Privacy Note */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="caption">
            🔒 <strong>Quyền riêng tư:</strong> Dữ liệu của bạn được ẩn danh và chỉ dùng để so sánh thống kê. 
            Chúng tôi không chia sẻ thông tin cá nhân của bạn.
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default AICompareSpending;
