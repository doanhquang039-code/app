import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Button,
  Menu,
  MenuItem,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Notifications,
  Warning,
  Info,
  CheckCircle,
  Error,
  MoreVert,
  Delete,
  DoneAll,
  Refresh,
} from '@mui/icons-material';
import api from '../../lib/api';

type NotificationType = 'info' | 'warning' | 'error' | 'success';

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: number;
}

const normalizeType = (type?: string, severity?: string): NotificationType => {
  const raw = `${type || ''} ${severity || ''}`.toLowerCase();
  if (raw.includes('danger') || raw.includes('error')) return 'error';
  if (raw.includes('warning') || raw.includes('alert')) return 'warning';
  if (raw.includes('success') || raw.includes('goal')) return 'success';
  return 'info';
};

const priorityFromSeverity = (severity?: string) => {
  const value = (severity || '').toUpperCase();
  if (value === 'DANGER' || value === 'ERROR') return 9;
  if (value === 'WARNING') return 7;
  return 4;
};

const mapNotification = (item: any): Notification => ({
  id: Number(item.id),
  type: normalizeType(item.type, item.severity),
  title: item.title || 'Thông báo',
  message: item.message || '',
  timestamp: new Date(item.createdAt || item.updatedAt || Date.now()),
  read: Boolean(item.isRead ?? item.read),
  priority: Number(item.priority ?? priorityFromSeverity(item.severity)),
});

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotification, setSelectedNotification] = useState<number | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/smart-notifications');
      setNotifications(Array.isArray(data) ? data.map(mapNotification) : []);
    } catch {
      setError('Không tải được thông báo. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'warning':
        return <Warning />;
      case 'error':
        return <Error />;
      case 'success':
        return <CheckCircle />;
      default:
        return <Info />;
    }
  };

  const getColor = (type: NotificationType) => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'success':
        return 'success';
      default:
        return 'info';
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, notificationId: number) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notificationId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const markAsRead = async (id: number) => {
    const previous = notifications;
    setNotifications((current) => current.map((n) => (n.id === id ? { ...n, read: true } : n)));
    handleMenuClose();
    try {
      await api.put(`/smart-notifications/${id}/read`);
    } catch {
      setNotifications(previous);
      setError('Không cập nhật được trạng thái thông báo.');
    }
  };

  const deleteNotification = async (id: number) => {
    const previous = notifications;
    setNotifications((current) => current.filter((n) => n.id !== id));
    handleMenuClose();
    try {
      await api.delete(`/smart-notifications/${id}`);
    } catch {
      setNotifications(previous);
      setError('Không xóa được thông báo.');
    }
  };

  const markAllAsRead = async () => {
    const previous = notifications;
    setNotifications((current) => current.map((n) => ({ ...n, read: true })));
    try {
      await api.put('/smart-notifications/all/read');
    } catch {
      setNotifications(previous);
      setError('Không đánh dấu tất cả là đã đọc được.');
    }
  };

  const clearReadNotifications = async () => {
    const readIds = notifications.filter((n) => n.read).map((n) => n.id);
    if (readIds.length === 0) return;
    const previous = notifications;
    setNotifications((current) => current.filter((n) => !n.read));
    try {
      await Promise.all(readIds.map((id) => api.delete(`/smart-notifications/${id}`)));
    } catch {
      setNotifications(previous);
      setError('Không xóa được các thông báo đã đọc.');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = useMemo(() => {
    switch (tabValue) {
      case 1:
        return notifications.filter((n) => !n.read);
      case 2:
        return notifications.filter((n) => n.read);
      default:
        return notifications;
    }
  }, [notifications, tabValue]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Badge badgeContent={unreadCount} color="error">
            <Notifications fontSize="large" />
          </Badge>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Thông báo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {unreadCount} thông báo chưa đọc
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={fetchNotifications}>
            Tải lại
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DoneAll />}
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Đánh dấu đã đọc
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Delete />}
            onClick={clearReadNotifications}
            disabled={notifications.every((n) => !n.read)}
          >
            Xóa đã đọc
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)}>
            <Tab label={`Tất cả (${notifications.length})`} />
            <Tab label={`Chưa đọc (${unreadCount})`} />
            <Tab label={`Đã đọc (${notifications.length - unreadCount})`} />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 5, textAlign: 'center' }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Đang tải thông báo...
              </Typography>
            </Box>
          ) : filteredNotifications.length === 0 ? (
            <Box sx={{ p: 5, textAlign: 'center' }}>
              <Notifications sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Chưa có thông báo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Các cảnh báo ngân sách, mục tiêu và nhắc nhở sẽ xuất hiện ở đây.
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      bgcolor: notification.read ? 'transparent' : 'action.hover',
                      '&:hover': { bgcolor: 'action.selected' },
                      cursor: 'pointer',
                    }}
                    secondaryAction={
                      <IconButton edge="end" onClick={(e) => handleMenuOpen(e, notification.id)}>
                        <MoreVert />
                      </IconButton>
                    }
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: `${getColor(notification.type)}.main` }}>
                        {getIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: notification.read ? 500 : 700 }}>
                            {notification.title}
                          </Typography>
                          {!notification.read && <Chip label="Mới" size="small" color="primary" />}
                          {notification.priority >= 8 && <Chip label="Ưu tiên cao" size="small" color="error" />}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(notification.timestamp)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < filteredNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => selectedNotification && markAsRead(selectedNotification)}>
          <DoneAll sx={{ mr: 1 }} /> Đánh dấu đã đọc
        </MenuItem>
        <MenuItem onClick={() => selectedNotification && deleteNotification(selectedNotification)}>
          <Delete sx={{ mr: 1 }} /> Xóa
        </MenuItem>
      </Menu>
    </Box>
  );
};

const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

export default NotificationCenter;
