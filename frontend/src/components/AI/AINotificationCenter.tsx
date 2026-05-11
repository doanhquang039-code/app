import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  Divider,
  Alert,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  Warning,
  Info,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Event,
  Close,
  MoreVert,
  Refresh,
  Settings,
} from '@mui/icons-material';

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  actionLabel?: string;
  actionUrl?: string;
  category: 'budget' | 'spending' | 'savings' | 'goal' | 'system';
}

export const AINotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai-advisor/notifications', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Mock data
      setNotifications([
        {
          id: '1',
          type: 'warning',
          title: 'Cảnh báo ngân sách',
          message: 'Bạn đã chi 85% ngân sách "Ăn uống" trong tháng này',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          read: false,
          priority: 'high',
          actionable: true,
          actionLabel: 'Xem chi tiết',
          actionUrl: '/budget',
          category: 'budget',
        },
        {
          id: '2',
          type: 'success',
          title: 'Mục tiêu đạt được!',
          message: 'Chúc mừng! Bạn đã đạt mục tiêu tiết kiệm 5 triệu đồng',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          read: false,
          priority: 'medium',
          actionable: true,
          actionLabel: 'Xem mục tiêu',
          actionUrl: '/goals',
          category: 'goal',
        },
        {
          id: '3',
          type: 'info',
          title: 'Chi tiêu tăng đột biến',
          message: 'Chi tiêu tuần này tăng 35% so với tuần trước',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          read: true,
          priority: 'medium',
          actionable: true,
          actionLabel: 'Phân tích',
          actionUrl: '/analytics',
          category: 'spending',
        },
        {
          id: '4',
          type: 'alert',
          title: 'Giao dịch lớn',
          message: 'Phát hiện giao dịch 2,500,000đ - Mua sắm tại Shopee',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          read: true,
          priority: 'high',
          actionable: false,
          category: 'spending',
        },
        {
          id: '5',
          type: 'info',
          title: 'Nhắc nhở tiết kiệm',
          message: 'Đã đến ngày chuyển tiền tiết kiệm hàng tháng',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          read: true,
          priority: 'low',
          actionable: true,
          actionLabel: 'Chuyển tiền',
          actionUrl: '/savings',
          category: 'savings',
        },
        {
          id: '6',
          type: 'success',
          title: 'Streak mới!',
          message: 'Bạn đã ghi chép chi tiêu 7 ngày liên tiếp',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          read: true,
          priority: 'low',
          actionable: false,
          category: 'system',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <Warning color="warning" />;
      case 'info':
        return <Info color="info" />;
      case 'success':
        return <CheckCircle color="success" />;
      case 'alert':
        return <Warning color="error" />;
      default:
        return <Info />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
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

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsActive color="primary" sx={{ fontSize: 32 }} />
            </Badge>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Trung tâm thông báo
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {unreadCount} thông báo chưa đọc
              </Typography>
            </Box>
          </Box>
          <Box>
            <IconButton onClick={fetchNotifications} size="small">
              <Refresh />
            </IconButton>
            <IconButton onClick={handleMenuOpen} size="small">
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        {/* Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => { handleMarkAllAsRead(); handleMenuClose(); }}>
            Đánh dấu tất cả đã đọc
          </MenuItem>
          <MenuItem onClick={() => { setFilter('all'); handleMenuClose(); }}>
            Hiện tất cả
          </MenuItem>
          <MenuItem onClick={() => { setFilter('unread'); handleMenuClose(); }}>
            Chỉ chưa đọc
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleMenuClose}>
            <Settings fontSize="small" sx={{ mr: 1 }} />
            Cài đặt thông báo
          </MenuItem>
        </Menu>

        {/* Filter Chips */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip
            label="Tất cả"
            onClick={() => setFilter('all')}
            color={filter === 'all' ? 'primary' : 'default'}
            size="small"
          />
          <Chip
            label={`Chưa đọc (${unreadCount})`}
            onClick={() => setFilter('unread')}
            color={filter === 'unread' ? 'primary' : 'default'}
            size="small"
          />
        </Box>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Alert severity="info">
            {filter === 'unread' 
              ? 'Không có thông báo chưa đọc' 
              : 'Không có thông báo nào'}
          </Alert>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  }}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleDelete(notification.id)} size="small">
                      <Close fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'transparent' }}>
                      {getIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                            }}
                          />
                        )}
                        {notification.priority === 'high' && (
                          <Chip
                            label="Quan trọng"
                            size="small"
                            color="error"
                            sx={{ height: 20, fontSize: 10 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {notification.message}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {getTimeAgo(notification.timestamp)}
                          </Typography>
                          {notification.actionable && (
                            <>
                              <Typography variant="caption" color="text.secondary">•</Typography>
                              <Button
                                size="small"
                                variant="text"
                                sx={{ minWidth: 'auto', p: 0, fontSize: 12 }}
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                {notification.actionLabel}
                              </Button>
                            </>
                          )}
                          {!notification.read && (
                            <>
                              <Typography variant="caption" color="text.secondary">•</Typography>
                              <Button
                                size="small"
                                variant="text"
                                sx={{ minWidth: 'auto', p: 0, fontSize: 12 }}
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                Đánh dấu đã đọc
                              </Button>
                            </>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < filteredNotifications.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}

        {/* Smart Insights */}
        {unreadCount > 0 && (
          <Alert severity="info" icon={<TrendingUp />} sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>AI Insight:</strong> Bạn có {unreadCount} thông báo quan trọng cần xem. 
              Hãy kiểm tra để quản lý tài chính tốt hơn!
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default AINotificationCenter;
