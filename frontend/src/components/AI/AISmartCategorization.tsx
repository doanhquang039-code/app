import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AutoAwesome,
  Category,
  Check,
  Close,
  Info,
} from '@mui/icons-material';

interface CategorySuggestion {
  category: string;
  confidence: number;
  reason: string;
}

export const AISmartCategorization: React.FC = () => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const analyzeCategorization = async () => {
    if (!description.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai-advisor/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          description,
          amount: parseFloat(amount) || 0,
        }),
      });

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error analyzing categorization:', error);
      // Fallback suggestions
      setSuggestions([
        { category: 'Ăn uống', confidence: 0.85, reason: 'Từ khóa liên quan đến thực phẩm' },
        { category: 'Giải trí', confidence: 0.65, reason: 'Có thể là hoạt động giải trí' },
        { category: 'Khác', confidence: 0.45, reason: 'Không rõ ràng' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AutoAwesome color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            AI Smart Categorization
          </Typography>
          <Tooltip title="AI sẽ tự động phân loại giao dịch dựa trên mô tả và số tiền">
            <IconButton size="small">
              <Info fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Alert severity="info" sx={{ mb: 2 }}>
          Nhập mô tả giao dịch và AI sẽ gợi ý danh mục phù hợp nhất
        </Alert>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              label="Mô tả giao dịch"
              placeholder="VD: Mua cà phê tại Starbucks"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Số tiền (optional)"
              type="number"
              placeholder="50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
              onClick={analyzeCategorization}
              disabled={!description.trim() || loading}
              fullWidth
            >
              {loading ? 'Đang phân tích...' : 'Phân tích với AI'}
            </Button>
          </Grid>
        </Grid>

        {suggestions.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
              Gợi ý danh mục:
            </Typography>
            <Grid container spacing={2}>
              {suggestions.map((suggestion, index) => (
                <Grid size={{ xs: 12 }} key={index}>
                  <Card
                    variant="outlined"
                    sx={{
                      cursor: 'pointer',
                      border: selectedCategory === suggestion.category ? 2 : 1,
                      borderColor: selectedCategory === suggestion.category ? 'primary.main' : 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => handleSelectCategory(suggestion.category)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Category color="primary" />
                          <Typography variant="h6">{suggestion.category}</Typography>
                          {selectedCategory === suggestion.category && (
                            <Check color="success" />
                          )}
                        </Box>
                        <Chip
                          label={`${(suggestion.confidence * 100).toFixed(0)}% tin cậy`}
                          color={getConfidenceColor(suggestion.confidence) as any}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {suggestion.reason}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {selectedCategory && (
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<Check />}
                  fullWidth
                >
                  Áp dụng danh mục: {selectedCategory}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Close />}
                  onClick={() => setSelectedCategory(null)}
                >
                  Hủy
                </Button>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AISmartCategorization;
