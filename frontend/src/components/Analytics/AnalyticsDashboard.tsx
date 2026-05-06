import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  LinearProgress
,
  Grid,
} from '@mui/material';

import {
  TrendingUp,
  TrendingDown,
  ShowChart,
  PieChart,
  BarChart,
  Timeline,
} from '@mui/icons-material';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

export const AnalyticsDashboard: React.FC<{ userId: number }> = ({ userId }) => {
  const [timeRange, setTimeRange] = useState('6months');
  const [predictions, setPredictions] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [userId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      // Fetch ML predictions
      const predRes = await fetch(`/ml/predict/next-month/${userId}`);
      const predData = await predRes.json();
      setPredictions(predData);

      // Fetch anomalies
      const anomalyRes = await fetch(`/ml/anomaly/detect/${userId}`);
      const anomalyData = await anomalyRes.json();
      setAnomalies(anomalyData.anomalies || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  // Spending Pattern Chart
  const spendingPatternData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Average Spending',
        data: [120, 150, 180, 140, 200, 250, 220],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
    ],
  };

  // Category Distribution
  const categoryDistributionData = {
    labels: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health'],
    datasets: [
      {
        data: [30, 20, 25, 15, 7, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
      },
    ],
  };

  // Spending vs Income Comparison
  const comparisonData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Income',
        data: [5000, 5200, 4800, 5500, 5300, 5600],
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
      },
      {
        label: 'Expenses',
        data: [3500, 3800, 3200, 4000, 3900, 4200],
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
      },
      {
        label: 'Savings',
        data: [1500, 1400, 1600, 1500, 1400, 1400],
        backgroundColor: 'rgba(153, 102, 255, 0.8)',
      },
    ],
  };

  // Financial Health Radar
  const healthRadarData = {
    labels: ['Savings Rate', 'Budget Adherence', 'Debt Management', 'Investment', 'Emergency Fund', 'Spending Control'],
    datasets: [
      {
        label: 'Your Score',
        data: [75, 85, 90, 60, 70, 80],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgb(75, 192, 192)',
        pointBackgroundColor: 'rgb(75, 192, 192)',
      },
      {
        label: 'Average',
        data: [65, 70, 75, 55, 60, 70],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        pointBackgroundColor: 'rgb(255, 99, 132)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Advanced insights powered by Machine Learning
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value="1month">Last Month</MenuItem>
            <MenuItem value="3months">Last 3 Months</MenuItem>
            <MenuItem value="6months">Last 6 Months</MenuItem>
            <MenuItem value="1year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* ML Predictions */}
      {predictions && (
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>
              🤖 AI Predictions for Next Month
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Predicted Expenses
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  ${predictions.predictedExpenses?.toFixed(2) || '0.00'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUp fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    {predictions.confidence || 85}% confidence
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Budget Overrun Risk
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {predictions.overrunRisk || 'Low'}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={predictions.overrunProbability || 25}
                  sx={{
                    mt: 1,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': { bgcolor: 'white' },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Savings Potential
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  ${predictions.savingsPotential?.toFixed(2) || '0.00'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Goal Achievement
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {predictions.goalAchievement || 78}%
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Anomaly Detection */}
      {anomalies.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>
              🔍 Detected Anomalies
            </Typography>
            <Grid container spacing={2}>
              {anomalies.slice(0, 4).map((anomaly, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={index}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: '#fff3e0',
                      borderRadius: 2,
                      borderLeft: '4px solid #ff9800',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {anomaly.type}
                      </Typography>
                      <Chip
                        label={`${anomaly.confidence}% confidence`}
                        size="small"
                        color="warning"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {anomaly.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Amount: ${anomaly.amount?.toFixed(2)} • {anomaly.date}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* Spending Pattern */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <ShowChart />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Weekly Spending Pattern
                </Typography>
              </Box>
              <Box sx={{ height: 300 }}>
                <Line data={spendingPatternData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <PieChart />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Category Distribution
                </Typography>
              </Box>
              <Box sx={{ height: 300 }}>
                <Doughnut data={categoryDistributionData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Income vs Expenses */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <BarChart />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Income vs Expenses Comparison
                </Typography>
              </Box>
              <Box sx={{ height: 300 }}>
                <Bar data={comparisonData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Financial Health Radar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <Timeline />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Financial Health
                </Typography>
              </Box>
              <Box sx={{ height: 300 }}>
                <Radar data={healthRadarData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;
