import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Fab,
  Collapse,
  CircularProgress,
  Chip,
  Grid,
  Alert,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Close,
  TrendingUp,
  AccountBalance,
  Savings,
  Assessment,
} from '@mui/icons-material';
import api from '../../lib/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIChatbotProps {
  onClose?: () => void;
}

const quickQuestions = [
  { text: 'Chi tiêu tháng này của tôi thế nào?', icon: <TrendingUp /> },
  { text: 'Tôi nên tiết kiệm bao nhiêu?', icon: <Savings /> },
  { text: 'Phân tích ngân sách của tôi', icon: <AccountBalance /> },
  { text: 'Dự đoán chi tiêu tương lai', icon: <Assessment /> },
];

export const AIChatbot: React.FC<AIChatbotProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! Tôi là trợ lý tài chính AI. Tôi có thể phân tích chi tiêu, nhắc ngân sách và gợi ý cách tiết kiệm dựa trên dữ liệu của bạn.',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: trimmed,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/ai-advisor/chat', { message: trimmed });
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        text: data?.response || 'Tôi chưa có đủ dữ liệu để trả lời câu hỏi này.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setError('Không kết nối được trợ lý AI. Vui lòng thử lại sau.');
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          text: 'Tôi đang gặp lỗi kết nối nên chưa thể xử lý yêu cầu. Bạn thử lại sau nhé.',
          sender: 'ai',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ height: '600px', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
      <Box
        sx={{
          p: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'white', color: '#667eea' }}>
            <SmartToy />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              AI Financial Advisor
            </Typography>
            <Typography variant="caption">Trợ lý tài chính thông minh</Typography>
          </Box>
        </Box>
        {onClose && (
          <IconButton onClick={onClose} sx={{ color: 'white' }} aria-label="Đóng trợ lý AI">
            <Close />
          </IconButton>
        )}
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#f5f5f5' }}>
        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              mb: 2,
            }}
          >
            <Box
              sx={{
                maxWidth: '78%',
                display: 'flex',
                gap: 1,
                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <Avatar
                sx={{
                  bgcolor: message.sender === 'user' ? '#1976d2' : '#667eea',
                  width: 32,
                  height: 32,
                  fontSize: 16,
                }}
              >
                {message.sender === 'user' ? 'U' : <SmartToy fontSize="small" />}
              </Avatar>
              <Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: message.sender === 'user' ? '#1976d2' : 'white',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.text}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.5,
                    color: 'text.secondary',
                    textAlign: message.sender === 'user' ? 'right' : 'left',
                  }}
                >
                  {message.timestamp.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar sx={{ bgcolor: '#667eea', width: 32, height: 32 }}>
              <SmartToy fontSize="small" />
            </Avatar>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'white', boxShadow: 1 }}>
              <CircularProgress size={20} />
            </Box>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {messages.length === 1 && (
        <Box sx={{ p: 2, bgcolor: 'white', borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
            Câu hỏi gợi ý:
          </Typography>
          <Grid container spacing={1}>
            {quickQuestions.map((q) => (
              <Grid size={{ xs: 6 }} key={q.text}>
                <Chip
                  icon={q.icon}
                  label={q.text}
                  onClick={() => sendMessage(q.text)}
                  sx={{ width: '100%', justifyContent: 'flex-start' }}
                  size="small"
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Box sx={{ p: 2, bgcolor: 'white', borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Nhập câu hỏi của bạn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            disabled={loading}
            size="small"
            multiline
            maxRows={3}
          />
          <IconButton
            color="primary"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              '&:disabled': { bgcolor: 'grey.300' },
            }}
            aria-label="Gửi câu hỏi"
          >
            <Send />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
};

export const FloatingAIButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Fab
        color="secondary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
          },
        }}
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Đóng trợ lý AI' : 'Mở trợ lý AI'}
      >
        {open ? <Close /> : <SmartToy />}
      </Fab>

      <Collapse in={open}>
        <Box
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 24,
            width: 400,
            maxWidth: 'calc(100vw - 48px)',
            zIndex: 1300,
          }}
        >
          <AIChatbot onClose={() => setOpen(false)} />
        </Box>
      </Collapse>
    </>
  );
};

export default AIChatbot;
