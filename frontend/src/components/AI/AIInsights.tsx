import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Alert,
  AlertTitle,
  Button,
  Skeleton,
  Grid,
} from '@mui/material';
import {
  Warning,
  Lightbulb,
  EmojiEvents,
  TrendingUp,
  Refresh,
  ArrowForward,
} from '@mui/icons-material';

interface AIInsight {
  type: 'warning' | 'tip' | 'achievement' | 'prediction';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionable?: boolean;
  action?: string;
}

export const AIInsights: React.FC = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai-advisor/insights', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <Warning />;
      case 'tip':
        return <Lightbulb />;
      case 'achievement':
        return <EmojiEvents />;
      case 'prediction':
        return <TrendingUp />;
      default:
        return <Lightbulb />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'error';
      case 'tip':
        return 'info';
      case 'achievement':
        return 'success';
      case 'prediction':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            🤖 AI Insights
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {[1, 2, 3].map((i) => (
            <Grid size={{ xs: 12 }} key={i}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          🤖 AI Insights
        </Typography>
        <IconButton onClick={fetchInsights} size="small">
          <Refresh />
        </IconButton>
      </Box>

      {insights.length === 0 ? (
        <Alert severity="success" icon={<EmojiEvents />}>
          <AlertTitle>Tuyệt vời!</AlertTitle>
          Tài chính của bạn đang ổn định. Không có cảnh báo nào từ AI.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {insights.map((insight, index) => (
            <Grid size={{ xs: 12 }} key={index}>
              <Alert
                severity={getInsightColor(insight.type) as any}
                icon={getInsightIcon(insight.type)}
                action={
                  insight.actionable && (
                    <Button
                      color="inherit"
                      size="small"
                      endIcon={<ArrowForward />}
                    >
                      {insight.action}
                    </Button>
                  )
                }
                sx={{
                  '& .MuiAlert-message': {
                    width: '100%',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <AlertTitle sx={{ mb: 0 }}>{insight.title}</AlertTitle>
                  <Chip
                    label={insight.priority.toUpperCase()}
                    size="small"
                    color={getPriorityColor(insight.priority) as any}
                    sx={{ ml: 1 }}
                  />
                </Box>
                <Typography variant="body2">{insight.message}</Typography>
              </Alert>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AIInsights;
