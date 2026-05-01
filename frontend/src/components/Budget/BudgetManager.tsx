import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  LinearProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Warning,
  CheckCircle,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';

interface Budget {
  id: number;
  categoryId: number;
  categoryName: string;
  amount: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'good' | 'warning' | 'exceeded';
  month: string;
}

interface BudgetManagerProps {
  userId: number;
  categories: any[];
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({ userId, categories }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    month: new Date().toISOString().slice(0, 7),
  });

  useEffect(() => {
    fetchBudgets();
  }, [userId]);

  const fetchBudgets = async () => {
    try {
      const response = await fetch(`/api/budgets/${userId}`);
      const data = await response.json();
      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const handleOpenDialog = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        categoryId: budget.categoryId.toString(),
        amount: budget.amount.toString(),
        month: budget.month,
      });
    } else {
      setEditingBudget(null);
      setFormData({
        categoryId: '',
        amount: '',
        month: new Date().toISOString().slice(0, 7),
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBudget(null);
  };

  const handleSubmit = async () => {
    try {
      const url = editingBudget
        ? `/api/budgets/${editingBudget.id}`
        : `/api/budgets`;
      
      const method = editingBudget ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          categoryId: parseInt(formData.categoryId),
          amount: parseFloat(formData.amount),
          month: formData.month,
        }),
      });

      fetchBudgets();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const handleDelete = async (budgetId: number) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await fetch(`/api/budgets/${budgetId}`, { method: 'DELETE' });
        fetchBudgets();
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'success';
      case 'warning':
        return 'warning';
      case 'exceeded':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle color="success" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'exceeded':
        return <Warning color="error" />;
      default:
        return null;
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <Box>
      {/* Summary Card */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight="bold">
              Budget Overview
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
            >
              Add Budget
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Budget
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                ${totalBudget.toFixed(2)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Spent
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                ${totalSpent.toFixed(2)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Remaining
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                ${totalRemaining.toFixed(2)}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Overall Progress</Typography>
              <Typography variant="body2">{overallPercentage.toFixed(1)}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(overallPercentage, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: overallPercentage >= 100 ? '#ff4444' : overallPercentage >= 80 ? '#ffaa00' : '#44ff44',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Budget List */}
      <Grid container spacing={3}>
        {budgets.map((budget) => (
          <Grid item xs={12} md={6} key={budget.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(budget.status)}
                    <Typography variant="h6" fontWeight="bold">
                      {budget.categoryName}
                    </Typography>
                  </Box>
                  <Box>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenDialog(budget)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDelete(budget.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      ${budget.spent.toFixed(2)} of ${budget.amount.toFixed(2)}
                    </Typography>
                    <Chip
                      label={`${budget.percentage.toFixed(0)}%`}
                      size="small"
                      color={getStatusColor(budget.status)}
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(budget.percentage, 100)}
                    color={getStatusColor(budget.status)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Remaining
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color={budget.remaining < 0 ? 'error' : 'success.main'}>
                      ${Math.abs(budget.remaining).toFixed(2)}
                      {budget.remaining < 0 && ' over'}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">
                      {budget.month}
                    </Typography>
                  </Box>
                </Box>

                {budget.status === 'exceeded' && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    Budget exceeded! You've spent ${(budget.spent - budget.amount).toFixed(2)} over budget.
                  </Alert>
                )}
                {budget.status === 'warning' && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Warning! You've used {budget.percentage.toFixed(0)}% of your budget.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBudget ? 'Edit Budget' : 'Add New Budget'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  label="Category"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Budget Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Month"
                type="month"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.categoryId || !formData.amount || !formData.month}
          >
            {editingBudget ? 'Update' : 'Create'} Budget
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BudgetManager;
