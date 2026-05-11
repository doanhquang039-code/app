import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Avatar,
} from '@mui/material';
import {
  Flag,
  Add,
  Edit,
  Delete,
  CheckCircle,
  TrendingUp,
  CalendarToday,
  AttachMoney,
  Refresh,
  Close,
} from '@mui/icons-material';

interface Goal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
}

export const AIGoalTracker: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    deadline: '',
    category: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    'Tiết kiệm khẩn cấp',
    'Mua nhà',
    'Mua xe',
    'Du lịch',
    'Giáo dục',
    'Đầu tư',
    'Nghỉ hưu',
    'Khác',
  ];

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/goals', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
      // Mock data
      setGoals([
        {
          id: '1',
          title: 'Quỹ khẩn cấp',
          description: 'Tiết kiệm 6 tháng chi tiêu',
          targetAmount: 30000000,
          currentAmount: 15000000,
          deadline: '2026-12-31',
          category: 'Tiết kiệm khẩn cấp',
          priority: 'high',
          status: 'active',
          createdAt: '2026-01-01',
        },
        {
          id: '2',
          title: 'Du lịch Nhật Bản',
          description: 'Chuyến du lịch gia đình',
          targetAmount: 50000000,
          currentAmount: 35000000,
          deadline: '2026-08-15',
          category: 'Du lịch',
          priority: 'medium',
          status: 'active',
          createdAt: '2026-02-01',
        },
        {
          id: '3',
          title: 'Mua laptop mới',
          description: 'MacBook Pro M3',
          targetAmount: 40000000,
          currentAmount: 40000000,
          deadline: '2026-05-01',
          category: 'Khác',
          priority: 'low',
          status: 'completed',
          createdAt: '2026-03-01',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        title: goal.title,
        description: goal.description,
        targetAmount: goal.targetAmount.toString(),
        deadline: goal.deadline,
        category: goal.category,
        priority: goal.priority,
      });
    } else {
      setEditingGoal(null);
      setFormData({
        title: '',
        description: '',
        targetAmount: '',
        deadline: '',
        category: '',
        priority: 'medium',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGoal(null);
  };

  const handleSubmit = async () => {
    try {
      // API call would go here
      console.log('Submitting goal:', formData);
      handleCloseDialog();
      fetchGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa mục tiêu này?')) {
      try {
        // API call would go here
        setGoals(goals.filter((g) => g.id !== id));
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const getProgress = (goal: Goal) => {
    return (goal.currentAmount / goal.targetAmount) * 100;
  };

  const getDaysRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Cao';
      case 'medium':
        return 'Trung bình';
      case 'low':
        return 'Thấp';
      default:
        return priority;
    }
  };

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Flag color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Goal Tracker
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Theo dõi mục tiêu tài chính
              </Typography>
            </Box>
          </Box>
          <Box>
            <IconButton onClick={fetchGoals} size="small">
              <Refresh />
            </IconButton>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
              Thêm mục tiêu
            </Button>
          </Box>
        </Box>

        {/* Summary */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Đang theo dõi
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {activeGoals.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Đã hoàn thành
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {completedGoals.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Tổng mục tiêu
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {goals.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
              🎯 Mục tiêu đang theo dõi
            </Typography>
            <Grid container spacing={2}>
              {activeGoals.map((goal) => {
                const progress = getProgress(goal);
                const daysRemaining = getDaysRemaining(goal.deadline);

                return (
                  <Grid size={{ xs: 12 }} key={goal.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {goal.title}
                              </Typography>
                              <Chip
                                label={getPriorityLabel(goal.priority)}
                                size="small"
                                color={getPriorityColor(goal.priority) as any}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {goal.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip label={goal.category} size="small" variant="outlined" />
                              <Chip
                                icon={<CalendarToday />}
                                label={`${daysRemaining} ngày còn lại`}
                                size="small"
                                color={daysRemaining < 30 ? 'warning' : 'default'}
                              />
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton size="small" onClick={() => handleOpenDialog(goal)}>
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteGoal(goal.id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">
                              {goal.currentAmount.toLocaleString('vi-VN')}đ / {goal.targetAmount.toLocaleString('vi-VN')}đ
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                              {progress.toFixed(0)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              bgcolor: 'action.hover',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: progress >= 100 ? 'success.main' : 'primary.main',
                              },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            Còn thiếu: {(goal.targetAmount - goal.currentAmount).toLocaleString('vi-VN')}đ
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
              ✅ Mục tiêu đã hoàn thành
            </Typography>
            <Grid container spacing={2}>
              {completedGoals.map((goal) => (
                <Grid size={{ xs: 12, md: 6 }} key={goal.id}>
                  <Card variant="outlined" sx={{ bgcolor: 'success.light', opacity: 0.8 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CheckCircle color="success" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {goal.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {goal.targetAmount.toLocaleString('vi-VN')}đ
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Hoàn thành: {new Date(goal.deadline).toLocaleDateString('vi-VN')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Empty State */}
        {goals.length === 0 && !loading && (
          <Alert severity="info">
            Bạn chưa có mục tiêu nào. Hãy thêm mục tiêu đầu tiên của bạn!
          </Alert>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">{editingGoal ? 'Chỉnh sửa mục tiêu' : 'Thêm mục tiêu mới'}</Typography>
              <IconButton onClick={handleCloseDialog} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Tên mục tiêu"
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <TextField
                label="Mô tả"
                fullWidth
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <TextField
                label="Số tiền mục tiêu"
                type="number"
                fullWidth
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                slotProps={{
                  input: {
                    startAdornment: <AttachMoney />,
                  },
                }}
              />
              <TextField
                label="Hạn chót"
                type="date"
                fullWidth
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                slotProps={{
                  input: {
                    startAdornment: <CalendarToday />,
                  },
                }}
              />
              <TextField
                label="Danh mục"
                select
                fullWidth
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Độ ưu tiên"
                select
                fullWidth
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              >
                <MenuItem value="high">Cao</MenuItem>
                <MenuItem value="medium">Trung bình</MenuItem>
                <MenuItem value="low">Thấp</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!formData.title || !formData.targetAmount || !formData.deadline || !formData.category}
            >
              {editingGoal ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Motivational Message */}
        <Alert severity="success" icon={<TrendingUp />} sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Mẹo:</strong> Chia nhỏ mục tiêu lớn thành các mục tiêu nhỏ hơn để dễ đạt được hơn!
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default AIGoalTracker;
