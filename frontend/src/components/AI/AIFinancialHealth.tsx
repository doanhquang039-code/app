import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  IconButton,
  Alert,
  Divider,
} from '@mui/material';
import {
  Favorite,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Savings,
  CreditCard,
  Assessment,
  Refresh,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
} from '@mui/icons-material';

interface HealthMetric {
  name: string;
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  trend: 'up' | 'down' | 'stable';
  description: string;
  recommendations: string[];
}

interface FinancialHealth {
  overallScore: number;
  overallStatus: 'excellent' | 'good' | 'fair' | 'poor';
  metrics: {
    budgetAdherence: HealthMetric;
    savingsRate: HealthMetric;
    debtRatio: HealthMetric;
    emergencyFund: HealthMetric;
    spendingPattern: HealthMetric;
  };
  summary: string;
  topRecommendations: string[];
}

export const AIFinancialHealth: React.FC = () => {
  const [health, setHealth] = useState<FinancialHealth | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFinancialHealth();
  }, []);

  const fetchFinancialHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai-advisor/financial-health', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error('Error fetching financial health:', error);
      // Mock data
      setHealth({
        overallScore: 72,
        overallStatus: 'good',
        summary: 'Tình hình tài chính của bạn đang ở mức tốt. Bạn đang quản lý ngân sách khá tốt và có tỷ lệ tiết kiệm ổn định. Tuy nhiên, cần chú ý đến quỹ khẩn cấp và giảm nợ.',
        topRecommendations: [
          'Tăng quỹ khẩn cấp lên 3-6 tháng chi tiêu',
          'Giảm chi tiêu không cần thiết xuống 10%',
          'Tăng tỷ lệ tiết kiệm lên 25% thu nhập',
        ],
        metrics: {
          budgetAdherence: {
            name: 'Tuân thủ ngân sách',
            score: 85,
            status: 'excellent',
            trend: 'up',
            description: 'Bạn đang tuân thủ ngân sách rất tốt',
            recommendations: [
              'Tiếp tục duy trì thói quen tốt này',
              'Xem xét tăng mục tiêu tiết kiệm',
            ],
          },
          savingsRate: {
            name: 'Tỷ lệ tiết kiệm',
            score: 70,
            status: 'good',
            trend: 'stable',
            description: 'Đang tiết kiệm 18% thu nhập',
            recommendations: [
              'Mục tiêu lý tưởng là 20-30%',
              'Tìm cách tăng thu nhập hoặc giảm chi tiêu',
            ],
          },
          debtRatio: {
            name: 'Tỷ lệ nợ',
            score: 65,
            status: 'fair',
            trend: 'down',
            description: 'Nợ chiếm 35% thu nhập',
            recommendations: [
              'Nên giảm xuống dưới 30%',
              'Ưu tiên trả nợ lãi suất cao',
              'Tránh vay thêm nợ mới',
            ],
          },
          emergencyFund: {
            name: 'Quỹ khẩn cấp',
            score: 50,
            status: 'fair',
            trend: 'up',
            description: 'Đủ cho 1.5 tháng chi tiêu',
            recommendations: [
              'Mục tiêu: 3-6 tháng chi tiêu',
              'Tăng 500k/tháng vào quỹ này',
              'Đặt tự động chuyển tiền',
            ],
          },
          spendingPattern: {
            name: 'Mô hình chi tiêu',
            score: 78,
            status: 'good',
            trend: 'stable',
            description: 'Chi tiêu ổn định và có kế hoạch',
            recommendations: [
              'Giảm chi tiêu bốc đồng',
              'Lập kế hoạch cho chi tiêu lớn',
            ],
          },
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    if (score >= 40) return '#ff5722';
    return '#f44336';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle sx={{ color: '#4caf50' }} />;
      case 'good':
        return <CheckCircle sx={{ color: '#8bc34a' }} />;
      case 'fair':
        return <Warning sx={{ color: '#ff9800' }} />;
      case 'poor':
        return <ErrorIcon sx={{ color: '#f44336' }} />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'Xuất sắc';
      case 'good':
        return 'Tốt';
      case 'fair':
        return 'Trung bình';
      case 'poor':
        return 'Kém';
      default:
        return status;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp sx={{ color: '#4caf50', fontSize: 20 }} />;
      case 'down':
        return <TrendingDown sx={{ color: '#f44336', fontSize: 20 }} />;
      default:
        return null;
    }
  };

  if (loading || !health) {
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
            <Favorite sx={{ fontSize: 32, color: 'error.main' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Financial Health Dashboard
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tổng quan sức khỏe tài chính
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={fetchFinancialHealth} size="small">
            <Refresh />
          </IconButton>
        </Box>

        {/* Overall Score */}
        <Card
          variant="outlined"
          sx={{
            mb: 3,
            background: `linear-gradient(135deg, ${getScoreColor(health.overallScore)}20 0%, ${getScoreColor(health.overallScore)}40 100%)`,
          }}
        >
          <CardContent>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      border: `8px solid ${getScoreColor(health.overallScore)}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: getScoreColor(health.overallScore) }}>
                      {health.overallScore}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      / 100
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 1 }}>
                    {getStatusIcon(health.overallStatus)}
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {getStatusLabel(health.overallStatus)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Tóm tắt
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {health.summary}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block' }}>
                  Khuyến nghị hàng đầu:
                </Typography>
                {health.topRecommendations.map((rec, index) => (
                  <Chip
                    key={index}
                    label={rec}
                    size="small"
                    sx={{ mr: 0.5, mb: 0.5 }}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Health Metrics */}
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
          📊 Chi tiết các chỉ số
        </Typography>

        <Grid container spacing={2}>
          {Object.entries(health.metrics).map(([key, metric]) => (
            <Grid size={{ xs: 12, md: 6 }} key={key}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {metric.name}
                      </Typography>
                      {getTrendIcon(metric.trend)}
                    </Box>
                    <Chip
                      label={getStatusLabel(metric.status)}
                      size="small"
                      icon={getStatusIcon(metric.status)}
                      sx={{
                        bgcolor: `${getScoreColor(metric.score)}20`,
                        color: getScoreColor(metric.score),
                      }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {metric.description}
                  </Typography>

                  <Box sx={{ mt: 2, mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Điểm số
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: getScoreColor(metric.score) }}>
                        {metric.score}/100
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={metric.score}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getScoreColor(metric.score),
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block' }}>
                      💡 Khuyến nghị:
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {metric.recommendations.map((rec, index) => (
                        <li key={index}>
                          <Typography variant="caption">{rec}</Typography>
                        </li>
                      ))}
                    </ul>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Action Alert */}
        <Alert
          severity={health.overallScore >= 70 ? 'success' : 'warning'}
          icon={health.overallScore >= 70 ? <CheckCircle /> : <Warning />}
          sx={{ mt: 3 }}
        >
          <Typography variant="body2">
            {health.overallScore >= 70 ? (
              <>
                <strong>Làm tốt lắm!</strong> Sức khỏe tài chính của bạn đang ở mức tốt. 
                Hãy tiếp tục duy trì và cải thiện các chỉ số còn yếu.
              </>
            ) : (
              <>
                <strong>Cần cải thiện!</strong> Hãy tập trung vào các khuyến nghị trên 
                để nâng cao sức khỏe tài chính của bạn.
              </>
            )}
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default AIFinancialHealth;
