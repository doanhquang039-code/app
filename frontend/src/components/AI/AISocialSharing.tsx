import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Share,
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  ContentCopy,
  CheckCircle,
  TrendingUp,
  EmojiEvents,
  Close,
  People,
} from '@mui/icons-material';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  date: string;
}

interface ShareableContent {
  type: 'achievement' | 'goal' | 'streak' | 'savings';
  title: string;
  description: string;
  stats: string;
  image?: string;
}

export const AISocialSharing: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ShareableContent | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState('');

  const shareableAchievements: Achievement[] = [
    {
      id: '1',
      title: 'Tiết kiệm 10 triệu',
      description: 'Đã tiết kiệm được 10 triệu đồng',
      icon: '💰',
      date: '2026-05-01',
    },
    {
      id: '2',
      title: 'Streak 30 ngày',
      description: 'Ghi chép chi tiêu 30 ngày liên tiếp',
      icon: '🔥',
      date: '2026-05-05',
    },
    {
      id: '3',
      title: 'Ngân sách hoàn hảo',
      description: 'Không vượt ngân sách trong 3 tháng',
      icon: '🎯',
      date: '2026-05-08',
    },
  ];

  const handleShare = (content: ShareableContent) => {
    setSelectedContent(content);
    const link = `https://expense-tracker.app/share/${content.type}/${Date.now()}`;
    setShareLink(link);
    setOpenDialog(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSocialShare = (platform: string) => {
    const text = `${selectedContent?.title} - ${selectedContent?.description}`;
    const url = shareLink;

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCopied(false);
  };

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Share color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Social Sharing
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Chia sẻ thành tựu của bạn
            </Typography>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Chia sẻ thành tựu tài chính của bạn để truyền cảm hứng cho người khác!
        </Alert>

        {/* Shareable Achievements */}
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
          🏆 Thành tựu có thể chia sẻ
        </Typography>

        <List sx={{ p: 0 }}>
          {shareableAchievements.map((achievement, index) => (
            <React.Fragment key={achievement.id}>
              <ListItem
                sx={{
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  mb: 1,
                }}
                secondaryAction={
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Share />}
                    onClick={() =>
                      handleShare({
                        type: 'achievement',
                        title: achievement.title,
                        description: achievement.description,
                        stats: `Đạt được vào ${new Date(achievement.date).toLocaleDateString('vi-VN')}`,
                      })
                    }
                  >
                    Chia sẻ
                  </Button>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main', fontSize: 24 }}>
                    {achievement.icon}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {achievement.title}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {achievement.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(achievement.date).toLocaleDateString('vi-VN')}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < shareableAchievements.length - 1 && <Divider sx={{ my: 1 }} />}
            </React.Fragment>
          ))}
        </List>

        {/* Quick Share Stats */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
            📊 Chia sẻ nhanh
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TrendingUp color="success" />
                    <Typography variant="subtitle2">Tiến độ tiết kiệm</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    75%
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    startIcon={<Share />}
                    onClick={() =>
                      handleShare({
                        type: 'savings',
                        title: 'Tiến độ tiết kiệm',
                        description: 'Đã đạt 75% mục tiêu tiết kiệm',
                        stats: '15 triệu / 20 triệu',
                      })
                    }
                  >
                    Chia sẻ
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <EmojiEvents color="warning" />
                    <Typography variant="subtitle2">Streak hiện tại</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    7 ngày 🔥
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    startIcon={<Share />}
                    onClick={() =>
                      handleShare({
                        type: 'streak',
                        title: 'Streak 7 ngày',
                        description: 'Ghi chép chi tiêu 7 ngày liên tiếp',
                        stats: 'Tiếp tục phát huy!',
                      })
                    }
                  >
                    Chia sẻ
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Share Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Chia sẻ thành tựu</Typography>
              <IconButton onClick={handleCloseDialog} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedContent && (
              <Box>
                {/* Preview */}
                <Card variant="outlined" sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {selectedContent.title}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {selectedContent.description}
                    </Typography>
                    <Typography variant="caption">{selectedContent.stats}</Typography>
                  </CardContent>
                </Card>

                {/* Social Buttons */}
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Chia sẻ lên:
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 6 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Facebook />}
                      onClick={() => handleSocialShare('facebook')}
                      sx={{ color: '#1877F2', borderColor: '#1877F2' }}
                    >
                      Facebook
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Twitter />}
                      onClick={() => handleSocialShare('twitter')}
                      sx={{ color: '#1DA1F2', borderColor: '#1DA1F2' }}
                    >
                      Twitter
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<LinkedIn />}
                      onClick={() => handleSocialShare('linkedin')}
                      sx={{ color: '#0A66C2', borderColor: '#0A66C2' }}
                    >
                      LinkedIn
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Instagram />}
                      disabled
                      sx={{ color: '#E4405F', borderColor: '#E4405F' }}
                    >
                      Instagram
                    </Button>
                  </Grid>
                </Grid>

                {/* Copy Link */}
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Hoặc sao chép link:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    value={shareLink}
                    size="small"
                    slotProps={{
                      input: {
                        readOnly: true,
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleCopyLink}
                    startIcon={copied ? <CheckCircle /> : <ContentCopy />}
                  >
                    {copied ? 'Đã sao' : 'Sao chép'}
                  </Button>
                </Box>

                {copied && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Đã sao chép link vào clipboard!
                  </Alert>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Đóng</Button>
          </DialogActions>
        </Dialog>

        {/* Stats */}
        <Alert severity="info" icon={<People />} sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Mẹo:</strong> Chia sẻ thành tựu của bạn để truyền cảm hứng và nhận động lực từ cộng đồng!
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default AISocialSharing;
