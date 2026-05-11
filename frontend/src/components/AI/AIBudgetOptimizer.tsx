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
  Slider,
  Chip,
  Divider,
} from '@mui/material';
import {
  TuneOutlined,
  Savings,
  TrendingUp,
  CheckCircle,
  Refresh,
} from '@mui/icons-material';

interface BudgetOptimization {
  currentBudget: {
    [category: string]: number;
  };
  optimizedBudget: {
    [category: string]: number;
  };
  potentialSavings: number;
  recommendations: Array<{
    category: string;
    current: number;
    suggested: number;
    reason: string;
  }>;
}

export const AIBudgetOptimizer: React.FC = () => {
  const [optimization, setOptimization] = useState<BudgetOptimization | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingsGoal, setSavingsGoal] = useState(20); // percentage

  const fetchOptimization = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai-advisor/optimize-budget?savingsGoal=${savingsGoal}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setOptimization(data);
    } catch (error) {
      console.error('Error fetching optimization:', error);
      // Mock data
      setOptimization({
        currentBudget: {
          'Ăn uống': 4000000,
          'Giải trí': 2000000,
          'Di chuyển': 1500000,
          'Mua sắm': 1000000,
        },
        optimizedBudget: {
          'Ăn uống': 3000000,
          'Giải trí': 1500000,
          'Di chuyển': 1200000,
          'Mua sắm': 800000,
        },
        potentialSavings: 2000000,
        recommendations: [
          {
            category: 'Ăn uống',
            current: 4000000,
            suggested: 3000000,
            reason: 'Giảm 25% bằng cách nấu ăn tại nhà nhiều hơn',
          },
          {
            category: 'Giải trí',
            current: 2000000,
            suggested: 1500000,
            reason: 'Tìm các hoạt động giải trí miễn phí hoặc giá rẻ',
          },
          {
            category: 'Di chuyển',
            current: 1500000,
            suggested: 1200000,
            reason: 'Sử dụng phương tiện công cộng thay vì taxi',
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptimization();
  }, [savingsGoal]);

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

  if (!optimization) return null;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TuneOutlined color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              AI Budget Optimizer
            </Typography>
          </Box>
          <Button
            startIcon={<Refresh />}
            onClick={fetchOptimization}
            size="small"
          >
            Làm mới
          </Button>
        </Box>

        {/* Savings Goal Slider */}
        <Card variant="outlined" sx={{ mb: 3, bgcolor: 'background.default' }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Mục tiêu tiết kiệm: {savingsGoal}%
            </Typography>
            <Slider
              value={savingsGoal}
              onChange={(_, value) => setSavingsGoal(value as number)}
              min={10}
              max={50}
              step={5}
              marks
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
            />
            <Typography variant="caption" color="text.secondary">
              Điều chỉnh mục tiêu tiết kiệm để xem gợi ý tối ưu
            </Typography>
          </CardContent>
        </Card>

        {/* Potential Savings */}
        <Alert
          severity="success"
          icon={<Savings />}
          sx={{ mb: 3 }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            Tiết kiệm tiềm năng: {optimization.potentialSavings.toLocaleString('vi-VN')}đ/tháng
          </Typography>
          <Typography variant="body2">
            = {(optimization.potentialSavings * 12).toLocaleString('vi-VN')}đ/năm
          </Typography>
        </Alert>

        {/* Budget Comparison */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
            So sánh ngân sách
          </Typography>
          {Object.keys(optimization.currentBudget).map((category) => (
            <Box key={category} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">{category}</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={`Hiện tại: ${optimization.currentBudget[category].toLocaleString('vi-VN')}đ`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`Gợi ý: ${optimization.optimizedBudget[category].toLocaleString('vi-VN')}đ`}
                    size="small"
                    color="primary"
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ flex: 1, bgcolor: 'grey.300', height: 8, borderRadius: 1 }}>
                  <Box
                    sx={{
                      width: `${(optimization.currentBudget[category] / Math.max(...Object.values(optimization.currentBudget))) * 100}%`,
                      bgcolor: 'grey.600',
                      height: '100%',
                      borderRadius: 1,
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1, bgcolor: 'grey.300', height: 8, borderRadius: 1 }}>
                  <Box
                    sx={{
                      width: `${(optimization.optimizedBudget[category] / Math.max(...Object.values(optimization.currentBudget))) * 100}%`,
                      bgcolor: 'primary.main',
                      height: '100%',
                      borderRadius: 1,
                    }}
                  />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Recommendations */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
            🎯 Gợi ý tối ưu
          </Typography>
          {optimization.recommendations.map((rec, index) => (
            <Card key={index} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {rec.category}
                  </Typography>
                  <Chip
                    icon={<TrendingUp />}
                    label={`Tiết kiệm ${(rec.current - rec.suggested).toLocaleString('vi-VN')}đ`}
                    color="success"
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {rec.reason}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Apply Button */}
        <Button
          variant="contained"
          startIcon={<CheckCircle />}
          fullWidth
          sx={{ mt: 2 }}
        >
          Áp dụng ngân sách tối ưu
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIBudgetOptimizer;
