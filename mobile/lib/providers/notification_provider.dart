import 'package:flutter/material.dart';
import '../services/api_service.dart';

class NotificationProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  List<dynamic> _notifications = [];
  int _unreadCount = 0;
  bool _isLoading = false;

  List<dynamic> get notifications => _notifications;
  int get unreadCount => _unreadCount;
  bool get isLoading => _isLoading;

  Future<void> loadNotifications() async {
    _isLoading = true;
    notifyListeners();
    try {
      final results = await Future.wait([
        _api.getNotifications(),
        _api.getUnreadCount(),
      ]);
      _notifications = results[0] as List;
      _unreadCount = (results[1] as Map)['count'] ?? 0;
    } catch (_) {}
    _isLoading = false;
    notifyListeners();
  }

  Future<void> markRead(int id) async {
    try {
      await _api.markNotificationRead(id);
      _unreadCount = (_unreadCount - 1).clamp(0, 999);
      notifyListeners();
    } catch (_) {}
  }

  Future<void> markAllRead() async {
    try {
      await _api.markAllNotificationsRead();
      _unreadCount = 0;
      notifyListeners();
    } catch (_) {}
  }
}
