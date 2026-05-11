import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  LinearProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  Analytics,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Refresh,
} from '@mui/icons-material';

interface SpendingAnalysis {
  totalSpending: number;
  averageDaily: number;
  topCategories: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
  trends: {
    vsLastMonth: number;
    vsLastWeek: number;
  };
  insights: string[];
  recommendations: string[];
  score: number; // 0-100
}

export const AISpendingAnalyzer: React.FC = () => {
  const [analysis, setAnalysis] = useState<SpendingAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai-advisor/analyze-spending', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      // Mock data for demo
      setAnalysis({
        totalSpending: 8500000,
        averageDaily: 283333,
        topCategories: [
          { name: 'Ăn uống', amount: 3500000, percentage: 41.2 },
          { name: 'Giải trí', amount: 2000000, percentage: 23.5 },
          { name: 'Di chuyển', amount: 1500000, percentage: 17.6 },
        ],
        trends: {
          vsLastMonth: -5.2,
          vsLastWeek: 12.3,
        },
        insights: [
          'Chi tiêu ăn uống chiếm 41% tổng chi tiêu, cao hơn mức khuyến nghị 30%',
          'Chi tiêu tuần này tăng 12% so với tuần trước',
          'Bạn đã tiết kiệm được 5% so với tháng trước',
        ],
        recommendations: [
          'Giảm chi tiêu ăn uống bằng cách nấu ăn tại nhà nhiều hơn',
          'Xem xét các phương tiện di chuyển tiết kiệm hơn',
          'Đặt ngân sách cụ thể cho từng danh mục',
        ],
        score: 72,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Xuất sắc';
    if (score >= 60) return 'Tốt';
    if (score >= 40) return 'Trung bình';
    return 'Cần cải thiện';
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Analytics color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              AI Spending Analyzer
            </Typography>
          </Box>
          <Button
            startIcon={<Refresh />}
            onClick={fetchAnalysis}
            size="small"
          >
            Làm mới
          </Button>
        </Box>

        {/* Score */}
        <Card variant="outlined" sx={{ mb: 3, bgcolor: 'background.default' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Điểm chi tiêu của bạn
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {analysis.score}
              </Typography>
              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={analysis.score}
                  color={getScoreColor(analysis.score) as any}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {getScoreLabel(analysis.score)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Overview */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Tổng chi tiêu
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {analysis.totalSpending.toLocaleString('vi-VN')}đ
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Trung bình/ngày
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {analysis.averageDaily.toLocaleString('vi-VN')}đ
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Trends */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Xu hướng
          </Typography>
          <Grid container spacing={1}>
            <Grid size={{ xs: 6 }}>
              <Chip
                icon={analysis.trends.vsLastMonth < 0 ? <TrendingDown /> : <TrendingUp />}
                label={`${Math.abs(analysis.trends.vsLastMonth)}% vs tháng trước`}
                color={analysis.trends.vsLastMonth < 0 ? 'success' : 'error'}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Chip
                icon={analysis.trends.vsLastWeek < 0 ? <TrendingDown /> : <TrendingUp />}
                label={`${Math.abs(analysis.trends.vsLastWeek)}% vs tuần trước`}
                color={analysis.trends.vsLastWeek < 0 ? 'success' : 'error'}
                size="small"
              />
            </Grid>
          </Grid>
        </Box>

        {/* Top Categories */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
            Danh mục chi tiêu cao nhất
          </Typography>
          {analysis.topCategories.map((category, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">{category.name}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {category.amount.toLocaleString('vi-VN')}đ ({category.percentage}%)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={category.percentage}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Insights */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            💡 Insights
          </Typography>
          {analysis.insights.map((insight, index) => (
            <Alert
              key={index}
              severity="info"
              icon={<CheckCircle />}
              sx={{ mb: 1 }}
            >
              {insight}
            </Alert>
          ))}
        </Box>

        {/* Recommendations */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            🎯 Gợi ý cải thiện
          </Typography>
          {analysis.recommendations.map((rec, index) => (
            <Alert
              key={index}
              severity="warning"
              icon={<Warning />}
              sx={{ mb: 1 }}
            >
              {rec}
            </Alert>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AISpendingAnalyzer;
