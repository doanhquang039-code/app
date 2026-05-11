import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Mic,
  MicOff,
  VolumeUp,
  Stop,
} from '@mui/icons-material';

export const AIVoiceAssistant: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false);
    }
  }, []);

  const startListening = () => {
    if (!supported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('Đang nghe...');
    };

    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setIsListening(false);

      // Send to AI
      try {
        const res = await fetch('/api/ai-advisor/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ message: text }),
        });

        const data = await res.json();
        setResponse(data.response);
        speak(data.response);
      } catch (error) {
        console.error('Error:', error);
        setResponse('Xin lỗi, đã có lỗi xảy ra.');
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setTranscript('Lỗi: ' + event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  if (!supported) {
    return (
      <Card>
        <CardContent>
          <Alert severity="warning">
            Trình duyệt của bạn không hỗ trợ Voice Assistant. Vui lòng sử dụng Chrome hoặc Edge.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <VolumeUp color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            AI Voice Assistant
          </Typography>
          <Chip
            label="Beta"
            size="small"
            color="warning"
          />
        </Box>

        <Alert severity="info" sx={{ mb: 2 }}>
          Nhấn vào microphone và nói câu hỏi của bạn. AI sẽ trả lời bằng giọng nói.
        </Alert>

        {/* Voice Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <IconButton
            onClick={isListening ? stopListening : startListening}
            disabled={isSpeaking}
            sx={{
              width: 120,
              height: 120,
              bgcolor: isListening ? 'error.main' : 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: isListening ? 'error.dark' : 'primary.dark',
              },
              '&:disabled': {
                bgcolor: 'grey.400',
              },
            }}
          >
            {isListening ? (
              <MicOff sx={{ fontSize: 60 }} />
            ) : (
              <Mic sx={{ fontSize: 60 }} />
            )}
          </IconButton>
        </Box>

        {/* Status */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          {isListening && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="error">
                Đang nghe...
              </Typography>
            </Box>
          )}
          {isSpeaking && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <VolumeUp color="primary" />
              <Typography variant="body2" color="primary">
                Đang nói...
              </Typography>
              <IconButton size="small" onClick={stopSpeaking}>
                <Stop />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Transcript */}
        {transcript && (
          <Card variant="outlined" sx={{ mb: 2, bgcolor: 'background.default' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Bạn nói:
              </Typography>
              <Typography variant="body1">
                {transcript}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Response */}
        {response && (
          <Card variant="outlined" sx={{ bgcolor: 'primary.light' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                AI trả lời:
              </Typography>
              <Typography variant="body1">
                {response}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Examples */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Ví dụ câu hỏi:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            <Chip label="Chi tiêu tháng này" size="small" variant="outlined" />
            <Chip label="Tôi nên tiết kiệm bao nhiêu" size="small" variant="outlined" />
            <Chip label="Phân tích ngân sách" size="small" variant="outlined" />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AIVoiceAssistant;
