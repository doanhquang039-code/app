import 'package:flutter/material.dart';
import '../services/api_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final ApiService _api = ApiService();
  Map<String, dynamic> _settings = {
    'notificationsEnabled': true,
    'budgetAlertEnabled': true,
    'billReminderEnabled': true,
    'currency': 'VND',
    'language': 'vi',
  };
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    try {
      final profile = await _api.getUserProfile();
      setState(() {
        _settings = {
          'notificationsEnabled': profile['notificationsEnabled'] ?? true,
          'budgetAlertEnabled': profile['budgetAlertEnabled'] ?? true,
          'billReminderEnabled': profile['billReminderEnabled'] ?? true,
          'currency': profile['currency'] ?? 'VND',
          'language': profile['language'] ?? 'vi',
        };
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _updateSettings() async {
    try {
      await _api.updateUserSettings(_settings);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đã lưu cài đặt'), backgroundColor: Color(0xFF6C63FF)),
        );
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2E),
        title: const Text('Cài đặt', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF)))
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                const Text('Thông báo', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                _settingTile(
                  'Bật thông báo',
                  'Nhận thông báo từ ứng dụng',
                  Icons.notifications_outlined,
                  _settings['notificationsEnabled'],
                  (v) => _toggleSetting('notificationsEnabled', v),
                ),
                _settingTile(
                  'Cảnh báo ngân sách',
                  'Thông báo khi vượt ngân sách',
                  Icons.warning_amber_outlined,
                  _settings['budgetAlertEnabled'],
                  (v) => _toggleSetting('budgetAlertEnabled', v),
                ),
                _settingTile(
                  'Nhắc nhở hóa đơn',
                  'Nhắc trước khi đến hạn thanh toán',
                  Icons.receipt_long_outlined,
                  _settings['billReminderEnabled'],
                  (v) => _toggleSetting('billReminderEnabled', v),
                ),

                const SizedBox(height: 24),
                const Text('Hiển thị', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                _selectTile(
                  'Tiền tệ',
                  _settings['currency'],
                  Icons.attach_money,
                  ['VND', 'USD', 'EUR'],
                  (v) => _changeSetting('currency', v),
                ),
                _selectTile(
                  'Ngôn ngữ',
                  _settings['language'] == 'vi' ? 'Tiếng Việt' : 'English',
                  Icons.language,
                  ['vi', 'en'],
                  (v) => _changeSetting('language', v),
                  labels: {'vi': 'Tiếng Việt', 'en': 'English'},
                ),

                const SizedBox(height: 24),
                const Text('Dữ liệu', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                _actionTile('Xuất dữ liệu', 'Tải về file CSV/Excel', Icons.download, () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Tính năng đang phát triển')),
                  );
                }),
                _actionTile('Xóa tất cả dữ liệu', 'Không thể hoàn tác', Icons.delete_forever, () {
                  _confirmDeleteAll();
                }, isDestructive: true),

                const SizedBox(height: 24),
                const Text('Về ứng dụng', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                _infoTile('Phiên bản', '1.0.0'),
                _infoTile('Backend API', 'http://localhost:3000'),
                _infoTile('Database', 'SQL Server'),
              ],
            ),
    );
  }

  Widget _settingTile(String title, String subtitle, IconData icon, bool value, Function(bool) onChanged) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3E),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF6C63FF), size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Colors.white, fontSize: 14)),
                Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 12)),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: const Color(0xFF6C63FF),
          ),
        ],
      ),
    );
  }

  Widget _selectTile(String title, String value, IconData icon, List<String> options, Function(String) onChanged, {Map<String, String>? labels}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3E),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF6C63FF), size: 22),
          const SizedBox(width: 12),
          Expanded(child: Text(title, style: const TextStyle(color: Colors.white, fontSize: 14))),
          DropdownButton<String>(
            value: value,
            dropdownColor: const Color(0xFF1E1E2E),
            underline: const SizedBox(),
            style: const TextStyle(color: Colors.white),
            items: options.map((o) => DropdownMenuItem(
              value: o,
              child: Text(labels?[o] ?? o, style: const TextStyle(color: Colors.white)),
            )).toList(),
            onChanged: (v) { if (v != null) onChanged(v); },
          ),
        ],
      ),
    );
  }

  Widget _actionTile(String title, String subtitle, IconData icon, VoidCallback onTap, {bool isDestructive = false}) {
    final color = isDestructive ? const Color(0xFFEB5757) : const Color(0xFF6C63FF);
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: const Color(0xFF2A2A3E),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(color: isDestructive ? color : Colors.white, fontSize: 14)),
                  Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: Colors.grey, size: 20),
          ],
        ),
      ),
    );
  }

  Widget _infoTile(String label, String value) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3E),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 13)),
        ],
      ),
    );
  }

  void _toggleSetting(String key, bool value) {
    setState(() => _settings[key] = value);
    _updateSettings();
  }

  void _changeSetting(String key, String value) {
    setState(() => _settings[key] = value);
    _updateSettings();
  }

  void _confirmDeleteAll() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF2A2A3E),
        title: const Text('Xóa tất cả dữ liệu?', style: TextStyle(color: Colors.white)),
        content: const Text(
          'Hành động này sẽ xóa toàn bộ giao dịch, ngân sách, mục tiêu tiết kiệm. Không thể hoàn tác!',
          style: TextStyle(color: Colors.grey),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Hủy')),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Tính năng đang phát triển'), backgroundColor: Colors.orange),
              );
            },
            child: const Text('Xóa', style: TextStyle(color: Colors.redAccent)),
          ),
        ],
      ),
    );
  }
}
