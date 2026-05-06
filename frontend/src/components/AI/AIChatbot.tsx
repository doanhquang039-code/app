import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Fab,
  Collapse,
  CircularProgress,
  Chip,
  Grid,
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
  { text: 'Chi tiêu tháng này như thế nào?', icon: <TrendingUp /> },
  { text: 'Tôi nên tiết kiệm bao nhiêu?', icon: <Savings /> },
  { text: 'Phân tích ngân sách của tôi', icon: <AccountBalance /> },
  { text: 'Dự đoán chi tiêu tương lai', icon: <Assessment /> },
];

export const AIChatbot: React.FC<AIChatbotProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 Xin chào! Tôi là trợ lý tài chính AI của bạn. Tôi có thể giúp bạn phân tích chi tiêu, đưa ra lời khuyên tiết kiệm và quản lý ngân sách. Bạn muốn biết gì?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/ai-advisor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.',
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '❌ Đã xảy ra lỗi khi kết nối với AI. Vui lòng thử lại sau.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <Card
      sx={{
        height: '600px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 3,
      }}
    >
      {/* Header */}
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
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        )}
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          bgcolor: '#f5f5f5',
        }}
      >
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
                maxWidth: '70%',
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
                }}
              >
                {message.sender === 'user' ? '👤' : <SmartToy fontSize="small" />}
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
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'white',
                boxShadow: 1,
              }}
            >
              <CircularProgress size={20} />
            </Box>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <Box sx={{ p: 2, bgcolor: 'white', borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
            Câu hỏi gợi ý:
          </Typography>
          <Grid container spacing={1}>
            {quickQuestions.map((q, index) => (
              <Grid size={{ xs: 6 }} key={index}>
                <Chip
                  icon={q.icon}
                  label={q.text}
                  onClick={() => handleQuickQuestion(q.text)}
                  sx={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    '&:hover': { bgcolor: '#f0f0f0' },
                  }}
                  size="small"
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Input */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'white',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Nhập câu hỏi của bạn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
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
          >
            <Send />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
};

// Floating AI Button Component
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
