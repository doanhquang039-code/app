import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Alert,
} from '@mui/material';
import {
  Add,
  TrendingDown,
  TrendingUp,
  Savings,
  Receipt,
  Category,
  AttachMoney,
  CalendarToday,
  Close,
  CheckCircle,
  Speed,
} from '@mui/icons-material';

interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

export const AIQuickActions: React.FC = () => {
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [success, setSuccess] = useState(false);

  const categories = [
    'Ăn uống',
    'Giải trí',
    'Mua sắm',
    'Di chuyển',
    'Nhà cửa',
    'Sức khỏe',
    'Giáo dục',
    'Khác',
  ];

  const handleOpenDialog = (dialogType: string) => {
    setOpenDialog(dialogType);
    setSuccess(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(null);
    setFormData({
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleSubmit = async () => {
    try {
      // API call would go here
      console.log('Submitting:', openDialog, formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSuccess(true);
      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    } catch (error) {
      console.error('Error submitting:', error);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'add-expense',
      title: 'Thêm chi tiêu',
      icon: <TrendingDown />,
      color: '#f44336',
      action: () => handleOpenDialog('expense'),
    },
    {
      id: 'add-income',
      title: 'Thêm thu nhập',
      icon: <TrendingUp />,
      color: '#4caf50',
      action: () => handleOpenDialog('income'),
    },
    {
      id: 'add-savings',
      title: 'Tiết kiệm',
      icon: <Savings />,
      color: '#2196f3',
      action: () => handleOpenDialog('savings'),
    },
    {
      id: 'scan-receipt',
      title: 'Quét hóa đơn',
      icon: <Receipt />,
      color: '#ff9800',
      action: () => handleOpenDialog('scan'),
    },
  ];

  const recentTransactions = [
    { description: 'Cà phê Starbucks', amount: 75000, category: 'Ăn uống' },
    { description: 'Grab đi làm', amount: 45000, category: 'Di chuyển' },
    { description: 'Mua sách', amount: 150000, category: 'Giáo dục' },
  ];

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Speed color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Quick Actions
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Thao tác nhanh
            </Typography>
          </Box>
        </Box>

        {/* Quick Action Buttons */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {quickActions.map((action) => (
            <Grid size={{ xs: 6, sm: 3 }} key={action.id}>
              <Button
                variant="outlined"
                fullWidth
                onClick={action.action}
                sx={{
                  py: 3,
                  flexDirection: 'column',
                  gap: 1,
                  borderColor: action.color,
                  color: action.color,
                  '&:hover': {
                    borderColor: action.color,
                    bgcolor: `${action.color}10`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: `${action.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: action.color,
                  }}
                >
                  {action.icon}
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                  {action.title}
                </Typography>
              </Button>
            </Grid>
          ))}
        </Grid>

        {/* Recent Transactions */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            📝 Giao dịch gần đây
          </Typography>
          {recentTransactions.map((transaction, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 1.5,
                borderBottom: index < recentTransactions.length - 1 ? 1 : 0,
                borderColor: 'divider',
              }}
            >
              <Box>
                <Typography variant="body2">{transaction.description}</Typography>
                <Chip label={transaction.category} size="small" sx={{ mt: 0.5, height: 20 }} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                -{transaction.amount.toLocaleString('vi-VN')}đ
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Dialog for Adding Transaction */}
        <Dialog open={openDialog !== null} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {openDialog === 'expense' && 'Thêm chi tiêu'}
                {openDialog === 'income' && 'Thêm thu nhập'}
                {openDialog === 'savings' && 'Thêm tiết kiệm'}
                {openDialog === 'scan' && 'Quét hóa đơn'}
              </Typography>
              <IconButton onClick={handleCloseDialog} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {success ? (
              <Alert severity="success" icon={<CheckCircle />}>
                <Typography variant="body2">
                  {openDialog === 'expense' && 'Chi tiêu đã được thêm thành công!'}
                  {openDialog === 'income' && 'Thu nhập đã được thêm thành công!'}
                  {openDialog === 'savings' && 'Tiết kiệm đã được thêm thành công!'}
                </Typography>
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField
                  label="Số tiền"
                  type="number"
                  fullWidth
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  slotProps={{
                    input: {
                      startAdornment: <AttachMoney />,
                    },
                  }}
                />
                <TextField
                  label="Danh mục"
                  select
                  fullWidth
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  slotProps={{
                    input: {
                      startAdornment: <Category />,
                    },
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Mô tả"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <TextField
                  label="Ngày"
                  type="date"
                  fullWidth
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  slotProps={{
                    input: {
                      startAdornment: <CalendarToday />,
                    },
                  }}
                />
              </Box>
            )}
          </DialogContent>
          {!success && (
            <DialogActions>
              <Button onClick={handleCloseDialog}>Hủy</Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!formData.amount || !formData.category}
              >
                Thêm
              </Button>
            </DialogActions>
          )}
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AIQuickActions;
