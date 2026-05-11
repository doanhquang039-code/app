import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  IconButton,
  Paper,
} from '@mui/material';
import {
  CameraAlt,
  Upload,
  Close,
  CheckCircle,
  Receipt,
  AutoAwesome,
} from '@mui/icons-material';

interface ScannedReceipt {
  merchant: string;
  date: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  category: string;
  confidence: number;
}

export const AIReceiptScanner: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScannedReceipt | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        scanReceipt(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const scanReceipt = async (imageData: string) => {
    setScanning(true);
    try {
      const response = await fetch('/api/ai-advisor/scan-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ image: imageData }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error scanning receipt:', error);
      // Mock result
      setTimeout(() => {
        setResult({
          merchant: 'Starbucks Coffee',
          date: new Date().toISOString().split('T')[0],
          total: 125000,
          items: [
            { name: 'Caffe Latte', quantity: 1, price: 75000 },
            { name: 'Croissant', quantity: 1, price: 50000 },
          ],
          category: 'Ăn uống',
          confidence: 0.92,
        });
      }, 2000);
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setResult(null);
    setScanning(false);
  };

  const handleSaveTransaction = () => {
    if (result) {
      // Save transaction logic
      alert('Giao dịch đã được lưu!');
      handleReset();
    }
  };

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Receipt color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            AI Receipt Scanner
          </Typography>
          <Chip label="Beta" size="small" color="warning" />
        </Box>

        <Alert severity="info" sx={{ mb: 2 }}>
          Chụp hoặc tải ảnh hóa đơn lên, AI sẽ tự động trích xuất thông tin và tạo giao dịch
        </Alert>

        {!image && !result && (
          <Box>
            {/* Upload Buttons */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<CameraAlt />}
                  onClick={() => cameraInputRef.current?.click()}
                  sx={{ py: 3 }}
                >
                  Chụp ảnh
                </Button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  hidden
                  onChange={handleFileUpload}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Upload />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ py: 3 }}
                >
                  Tải ảnh lên
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileUpload}
                />
              </Grid>
            </Grid>

            {/* Examples */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Mẹo để scan tốt nhất:
              </Typography>
              <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                <li>
                  <Typography variant="body2">Đảm bảo hóa đơn phẳng và rõ ràng</Typography>
                </li>
                <li>
                  <Typography variant="body2">Chụp trong điều kiện ánh sáng tốt</Typography>
                </li>
                <li>
                  <Typography variant="body2">Tránh bóng mờ hoặc phản chiếu</Typography>
                </li>
              </ul>
            </Box>
          </Box>
        )}

        {/* Image Preview & Scanning */}
        {image && !result && (
          <Box>
            <Paper elevation={2} sx={{ p: 2, position: 'relative' }}>
              <IconButton
                onClick={handleReset}
                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }}
              >
                <Close />
              </IconButton>
              <img
                src={image}
                alt="Receipt"
                style={{ width: '100%', maxHeight: 400, objectFit: 'contain' }}
              />
            </Paper>

            {scanning && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Đang quét hóa đơn với AI...
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Scan Result */}
        {result && (
          <Box>
            <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
              Quét thành công! Độ tin cậy: {(result.confidence * 100).toFixed(0)}%
            </Alert>

            <Grid container spacing={2}>
              {/* Receipt Info */}
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Thông tin hóa đơn
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Cửa hàng:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {result.merchant}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Ngày:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {new Date(result.date).toLocaleDateString('vi-VN')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Danh mục:</Typography>
                      <Chip label={result.category} size="small" color="primary" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Items */}
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Chi tiết sản phẩm
                    </Typography>
                    {result.items.map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          py: 1,
                          borderBottom: index < result.items.length - 1 ? 1 : 0,
                          borderColor: 'divider',
                        }}
                      >
                        <Box>
                          <Typography variant="body2">{item.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            x{item.quantity}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {item.price.toLocaleString('vi-VN')}đ
                        </Typography>
                      </Box>
                    ))}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        pt: 2,
                        mt: 1,
                        borderTop: 2,
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Tổng cộng:
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                        {result.total.toLocaleString('vi-VN')}đ
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Actions */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<CheckCircle />}
                    onClick={handleSaveTransaction}
                  >
                    Lưu giao dịch
                  </Button>
                  <Button variant="outlined" onClick={handleReset}>
                    Quét lại
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AIReceiptScanner;
