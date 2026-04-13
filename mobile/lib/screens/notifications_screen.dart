import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../models/notification_model.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final ApiService _api = ApiService();
  List<NotificationModel> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final data = await _api.getNotifications();
      setState(() {
        _notifications = data.map((e) => NotificationModel.fromJson(e)).toList();
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final unread = _notifications.where((n) => !n.isRead).length;

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2E),
        title: Row(
          children: [
            const Text('Thông báo', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            if (unread > 0) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFFEB5757),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text('$unread', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ],
          ],
        ),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          if (unread > 0)
            TextButton(
              onPressed: _markAllRead,
              child: const Text('Đọc tất cả', style: TextStyle(color: Color(0xFF6C63FF), fontSize: 13)),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF)))
          : _notifications.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.notifications_none, size: 64, color: Colors.white.withOpacity(0.2)),
                      const SizedBox(height: 16),
                      const Text('Không có thông báo nào', style: TextStyle(color: Colors.grey, fontSize: 16)),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _notifications.length,
                  itemBuilder: (_, i) => _notifCard(_notifications[i]),
                ),
    );
  }

  Widget _notifCard(NotificationModel n) {
    Color color;
    IconData icon;

    switch (n.severity) {
      case 'DANGER':
        color = const Color(0xFFEB5757);
        icon = Icons.error;
        break;
      case 'WARNING':
        color = const Color(0xFFF97316);
        icon = Icons.warning_amber_rounded;
        break;
      default:
        color = const Color(0xFF6C63FF);
        icon = Icons.info_outline;
    }

    return GestureDetector(
      onTap: () async {
        if (!n.isRead) {
          await _api.markNotificationRead(n.id);
          setState(() {
            final idx = _notifications.indexWhere((x) => x.id == n.id);
            if (idx != -1) {
              _notifications[idx] = NotificationModel(
                id: n.id,
                title: n.title,
                message: n.message,
                type: n.type,
                severity: n.severity,
                isRead: true,
                createdAt: n.createdAt,
                actionUrl: n.actionUrl,
              );
            }
          });
        }
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: n.isRead ? const Color(0xFF2A2A3E) : const Color(0xFF2A2A3E),
          borderRadius: BorderRadius.circular(14),
          border: !n.isRead
              ? Border.all(color: color.withOpacity(0.3))
              : null,
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          n.title,
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: n.isRead ? FontWeight.normal : FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                      ),
                      if (!n.isRead)
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4)),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(n.message, style: const TextStyle(color: Colors.grey, fontSize: 13)),
                  const SizedBox(height: 6),
                  Text(
                    _formatTime(n.createdAt),
                    style: const TextStyle(color: Colors.grey, fontSize: 11),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes} phút trước';
    if (diff.inHours < 24) return '${diff.inHours} giờ trước';
    return DateFormat('dd/MM/yyyy').format(dt);
  }

  Future<void> _markAllRead() async {
    try {
      await _api.markAllNotificationsRead();
      setState(() {
        _notifications = _notifications.map((n) => NotificationModel(
          id: n.id, title: n.title, message: n.message,
          type: n.type, severity: n.severity, isRead: true,
          createdAt: n.createdAt, actionUrl: n.actionUrl,
        )).toList();
      });
    } catch (_) {}
  }
}
