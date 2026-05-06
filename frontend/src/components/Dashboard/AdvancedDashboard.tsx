import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Grid,
} from '@mui/material';

import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  ShoppingCart,
  Restaurant,
  LocalGasStation,
  MoreVert,
  Notifications,
  Settings,
} from '@mui/icons-material';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardProps {
  userId: number;
}

export const AdvancedDashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [stats, setStats] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsRes = await fetch(`/api/dashboard/${userId}`);
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch ML predictions
      const predRes = await fetch(`/ml/predict/next-month/${userId}`);
      const predData = await predRes.json();
      setPredictions(predData);

      // Fetch recommendations
      const recRes = await fetch(`/ml/recommend/${userId}`);
      const recData = await recRes.json();
      setRecommendations(recData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Chart data
  const spendingTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Income',
        data: [5000, 5200, 4800, 5500, 5300, 5600],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: [3500, 3800, 3200, 4000, 3900, 4200],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const categoryData = {
    labels: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment'],
    datasets: [
      {
        data: [30, 20, 25, 15, 10],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const budgetData = {
    labels: ['Food', 'Transport', 'Shopping', 'Bills'],
    datasets: [
      {
        label: 'Spent',
        data: [750, 400, 625, 300],
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
      },
      {
        label: 'Budget',
        data: [1000, 500, 800, 400],
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
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
    <Box sx={{ flexGrow: 1, p: 3, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }} gutterBottom>
            Financial Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Here's your financial overview
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton>
            <Notifications />
          </IconButton>
          <IconButton onClick={handleMenuOpen}>
            <Settings />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
            <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Balance
                  </Typography>
                  <Typography variant="h4"  sx={{  mt: 1 , fontWeight: 'bold' }}>
                    $12,450
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUp fontSize="small" />
                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                      +12.5% from last month
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <AccountBalance />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Monthly Income
                  </Typography>
                  <Typography variant="h4"  sx={{  mt: 1 , fontWeight: 'bold' }}>
                    $5,600
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUp fontSize="small" />
                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                      +5.2% from last month
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Monthly Expenses
                  </Typography>
                  <Typography variant="h4"  sx={{  mt: 1 , fontWeight: 'bold' }}>
                    $4,200
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingDown fontSize="small" />
                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                      -3.1% from last month
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <ShoppingCart />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Savings Rate
                  </Typography>
                  <Typography variant="h4"  sx={{  mt: 1 , fontWeight: 'bold' }}>
                    25%
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUp fontSize="small" />
                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                      +2.3% from last month
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <AccountBalance />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Spending Trend
                </Typography>
                <Button size="small" variant="outlined">
                  Last 6 Months
                </Button>
              </Box>
              <Box sx={{ height: 300 }}>
                <Line data={spendingTrendData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>
                Spending by Category
              </Typography>
              <Box sx={{ height: 300 }}>
                <Doughnut data={categoryData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Budget Progress & Recommendations */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>
                Budget Overview
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar data={budgetData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>
                AI Recommendations
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {recommendations.slice(0, 5).map((rec, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      mb: 1,
                      bgcolor: '#f5f7fa',
                      borderRadius: 2,
                      borderLeft: '4px solid',
                      borderColor: rec.priority > 7 ? 'error.main' : 'primary.main',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {rec.title}
                      </Typography>
                      <Chip
                        label={`Priority: ${rec.priority}`}
                        size="small"
                        color={rec.priority > 7 ? 'error' : 'primary'}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {rec.message}
                    </Typography>
                    {rec.potentialSavings && (
                      <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                        Potential savings: ${rec.potentialSavings.toFixed(2)}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Transactions */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>
            Recent Transactions
          </Typography>
          <Box>
            {[
              { icon: <Restaurant />, name: 'Starbucks', category: 'Food', amount: -15.50, date: 'Today, 10:30 AM', color: '#ff6b6b' },
              { icon: <LocalGasStation />, name: 'Shell Gas Station', category: 'Transport', amount: -45.00, date: 'Yesterday, 5:20 PM', color: '#4ecdc4' },
              { icon: <ShoppingCart />, name: 'Amazon', category: 'Shopping', amount: -89.99, date: 'Yesterday, 2:15 PM', color: '#45b7d1' },
              { icon: <AccountBalance />, name: 'Salary Deposit', category: 'Income', amount: 5600.00, date: '2 days ago', color: '#96ceb4' },
            ].map((transaction, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  mb: 1,
                  bgcolor: '#f5f7fa',
                  borderRadius: 2,
                  '&:hover': { bgcolor: '#e8eaf0' },
                  cursor: 'pointer',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: transaction.color }}>
                    {transaction.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {transaction.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {transaction.category} • {transaction.date}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h6"
                  sx={{ fontWeight: 'bold' }}
                  color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                >
                  {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdvancedDashboard;
