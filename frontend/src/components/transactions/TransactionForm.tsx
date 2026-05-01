import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Grid,
  InputAdornment,
  Chip,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Typography,
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Close,
  CameraAlt,
  AttachFile,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (transaction: any) => void;
  transaction?: any;
  categories: any[];
  wallets: any[];
  tags: any[];
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  open,
  onClose,
  onSubmit,
  transaction,
  categories,
  wallets,
  tags,
}) => {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    categoryId: '',
    walletId: '',
    date: new Date(),
    note: '',
    tags: [] as string[],
    attachments: [] as File[],
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type || 'expense',
        amount: transaction.amount?.toString() || '',
        categoryId: transaction.categoryId || '',
        walletId: transaction.walletId || '',
        date: transaction.date ? new Date(transaction.date) : new Date(),
        note: transaction.note || '',
        tags: transaction.tags || [],
        attachments: [],
      });
    } else {
      resetForm();
    }
  }, [transaction, open]);

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: '',
      categoryId: '',
      walletId: '',
      date: new Date(),
      note: '',
      tags: [],
      attachments: [],
    });
  };

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
    };
    onSubmit(submitData);
    resetForm();
    onClose();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setFormData({ ...formData, attachments: [...formData.attachments, ...files] });
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    setFormData({ ...formData, attachments: newAttachments });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {transaction ? 'Edit Transaction' : 'Add New Transaction'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Transaction Type */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <ToggleButtonGroup
                value={formData.type}
                exclusive
                onChange={(e, value) => value && setFormData({ ...formData, type: value })}
                sx={{ mb: 2 }}
              >
                <ToggleButton value="expense" sx={{ px: 4 }}>
                  <TrendingDown sx={{ mr: 1 }} />
                  Expense
                </ToggleButton>
                <ToggleButton value="income" sx={{ px: 4 }}>
                  <TrendingUp sx={{ mr: 1 }} />
                  Income
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Grid>

          {/* Amount */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney />
                  </InputAdornment>
                ),
              }}
              required
            />
          </Grid>

          {/* Date */}
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(date) => date && setFormData({ ...formData, date })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          {/* Category */}
          <Grid item xs={12} md={6}>
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

          {/* Wallet */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Wallet</InputLabel>
              <Select
                value={formData.walletId}
                onChange={(e) => setFormData({ ...formData, walletId: e.target.value })}
                label="Wallet"
              >
                {wallets.map((wallet) => (
                  <MenuItem key={wallet.id} value={wallet.id}>
                    {wallet.name} (${wallet.balance})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Tags */}
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={tags}
              value={formData.tags}
              onChange={(e, value) => setFormData({ ...formData, tags: value })}
              renderInput={(params) => (
                <TextField {...params} label="Tags" placeholder="Add tags" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} />
                ))
              }
            />
          </Grid>

          {/* Note */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Note"
              multiline
              rows={3}
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Add a note about this transaction..."
            />
          </Grid>

          {/* Attachments */}
          <Grid item xs={12}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Attachments
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachFile />}
                  size="small"
                >
                  Upload File
                  <input type="file" hidden multiple onChange={handleFileUpload} />
                </Button>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CameraAlt />}
                  size="small"
                >
                  Take Photo
                  <input type="file" hidden accept="image/*" capture="environment" onChange={handleFileUpload} />
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.attachments.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => removeAttachment(index)}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.amount || !formData.categoryId || !formData.walletId}
        >
          {transaction ? 'Update' : 'Add'} Transaction
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionForm;
