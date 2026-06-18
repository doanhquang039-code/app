import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../providers/app_settings_provider.dart';
import '../providers/language_learning_provider.dart';
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
  bool _isDeleting = false;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    try {
      final profile = await _api.getUserProfile();
      if (!mounted) return;
      setState(() {
        _settings = {
          'notificationsEnabled': profile['notificationsEnabled'] ?? true,
          'budgetAlertEnabled': profile['budgetAlertEnabled'] ?? true,
          'billReminderEnabled': profile['billReminderEnabled'] ?? true,
          'currency': profile['currency'] ?? 'VND',
          'language': profile['language'] ?? context.read<AppSettingsProvider>().language,
        };
        _isLoading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _updateSettings() async {
    try {
      await _api.updateUserSettings(_settings);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đã lưu cài đặt'), backgroundColor: Color(0xFF6C63FF)),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đã lưu cục bộ. Backend chưa cập nhật được.'), backgroundColor: Colors.orange),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final appSettings = context.watch<AppSettingsProvider>();

    return Scaffold(
      backgroundColor: appSettings.backgroundColor,
      appBar: AppBar(
        backgroundColor: appSettings.backgroundColor,
        title: Text(appSettings.text('settings'), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF)))
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _sectionTitle(appSettings.text('notifications')),
                _settingTile(
                  'Bật thông báo',
                  'Nhận thông báo từ ứng dụng',
                  Icons.notifications_outlined,
                  _settings['notificationsEnabled'] == true,
                  (value) => _toggleSetting('notificationsEnabled', value),
                ),
                _settingTile(
                  'Cảnh báo ngân sách',
                  'Thông báo khi vượt ngân sách',
                  Icons.warning_amber_outlined,
                  _settings['budgetAlertEnabled'] == true,
                  (value) => _toggleSetting('budgetAlertEnabled', value),
                ),
                _settingTile(
                  'Nhắc nhở hóa đơn',
                  'Nhắc trước khi đến hạn thanh toán',
                  Icons.receipt_long_outlined,
                  _settings['billReminderEnabled'] == true,
                  (value) => _toggleSetting('billReminderEnabled', value),
                ),
                const SizedBox(height: 24),
                _sectionTitle(appSettings.text('display')),
                _selectTile(
                  appSettings.text('currency'),
                  _settings['currency']?.toString() ?? 'VND',
                  Icons.attach_money,
                  ['VND', 'USD', 'EUR'],
                  (value) => _changeSetting('currency', value),
                ),
                _selectTile(
                  appSettings.text('language'),
                  _settings['language']?.toString() ?? appSettings.language,
                  Icons.language,
                  ['vi', 'en'],
                  (value) {
                    _changeSetting('language', value);
                    context.read<AppSettingsProvider>().setLanguage(value);
                  },
                  labels: const {'vi': 'Tiếng Việt', 'en': 'English'},
                ),
                const SizedBox(height: 24),
                _sectionTitle(appSettings.text('interface')),
                _themeTile(appSettings),
                const SizedBox(height: 24),
                _sectionTitle(appSettings.text('personalData')),
                _actionTile(
                  'Hồ sơ & toàn bộ dữ liệu',
                  'Xem thông tin tài khoản, thống kê, ví, ngân sách và dữ liệu cá nhân',
                  Icons.person_search_rounded,
                  () => Navigator.pushNamed(context, '/profile'),
                ),
                _actionTile(
                  'Xuất dữ liệu',
                  'Copy toàn bộ dữ liệu cá nhân dạng JSON',
                  Icons.download,
                  _exportPersonalData,
                ),
                _actionTile(
                  _isDeleting ? 'Đang xóa dữ liệu...' : 'Xóa tất cả dữ liệu',
                  'Xóa giao dịch, ví, ngân sách, mục tiêu, lịch học và dữ liệu tài chính',
                  Icons.delete_forever,
                  _isDeleting ? () {} : _confirmDeleteAll,
                  isDestructive: true,
                ),
                const SizedBox(height: 24),
                _sectionTitle(appSettings.text('aboutApp')),
                _infoTile('Phiên bản', '1.0.0'),
                _infoTile('Backend API', ApiService.baseUrl),
                _infoTile('Database', 'SQL Server'),
              ],
            ),
    );
  }

  Widget _sectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
    );
  }

  Widget _settingTile(String title, String subtitle, IconData icon, bool value, ValueChanged<bool> onChanged) {
    return _card(
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
          Switch(value: value, onChanged: onChanged, activeThumbColor: const Color(0xFF6C63FF)),
        ],
      ),
    );
  }

  Widget _selectTile(
    String title,
    String value,
    IconData icon,
    List<String> options,
    ValueChanged<String> onChanged, {
    Map<String, String>? labels,
  }) {
    final normalizedValue = options.contains(value) ? value : options.first;
    return _card(
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF6C63FF), size: 22),
          const SizedBox(width: 12),
          Expanded(child: Text(title, style: const TextStyle(color: Colors.white, fontSize: 14))),
          DropdownButton<String>(
            value: normalizedValue,
            dropdownColor: const Color(0xFF1E1E2E),
            underline: const SizedBox(),
            style: const TextStyle(color: Colors.white),
            items: options
                .map((option) => DropdownMenuItem(
                      value: option,
                      child: Text(labels?[option] ?? option, style: const TextStyle(color: Colors.white)),
                    ))
                .toList(),
            onChanged: (value) {
              if (value != null) onChanged(value);
            },
          ),
        ],
      ),
    );
  }

  Widget _themeTile(AppSettingsProvider appSettings) {
    const themes = {
      'midnight': {'label': 'Đêm tím', 'color': Color(0xFF6C63FF)},
      'ocean': {'label': 'Biển xanh', 'color': Color(0xFF38BDF8)},
      'forest': {'label': 'Rừng xanh', 'color': Color(0xFF34D399)},
      'rose': {'label': 'Hồng ấm', 'color': Color(0xFFF97316)},
    };

    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.palette_outlined, color: Color(0xFF6C63FF), size: 22),
              const SizedBox(width: 12),
              Text(appSettings.text('appBackground'), style: const TextStyle(color: Colors.white, fontSize: 14)),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: themes.entries.map((entry) {
              final selected = appSettings.theme == entry.key;
              final color = entry.value['color'] as Color;
              return ChoiceChip(
                label: Text(entry.value['label'] as String),
                selected: selected,
                onSelected: (_) => context.read<AppSettingsProvider>().setTheme(entry.key),
                selectedColor: color.withValues(alpha: 0.35),
                backgroundColor: const Color(0xFF1E1E2E),
                labelStyle: TextStyle(color: selected ? Colors.white : Colors.grey),
                avatar: CircleAvatar(backgroundColor: color, radius: 7),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _actionTile(String title, String subtitle, IconData icon, VoidCallback onTap, {bool isDestructive = false}) {
    final color = isDestructive ? const Color(0xFFEB5757) : const Color(0xFF6C63FF);
    return GestureDetector(
      onTap: onTap,
      child: _card(
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
            const Icon(Icons.chevron_right, color: Colors.grey, size: 20),
          ],
        ),
      ),
    );
  }

  Widget _infoTile(String label, String value) {
    return _card(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
          Flexible(child: Text(value, style: const TextStyle(color: Colors.white, fontSize: 13), overflow: TextOverflow.ellipsis)),
        ],
      ),
    );
  }

  Widget _card({required Widget child}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(color: const Color(0xFF2A2A3E), borderRadius: BorderRadius.circular(14)),
      child: child,
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
          'Hành động này sẽ xóa toàn bộ dữ liệu tài chính và lịch học ngoại ngữ đã lưu. Không thể hoàn tác.',
          style: TextStyle(color: Colors.grey),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Hủy')),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              await _deleteAllPersonalData();
            },
            child: const Text('Xóa', style: TextStyle(color: Colors.redAccent)),
          ),
        ],
      ),
    );
  }

  Future<void> _exportPersonalData() async {
    try {
      final results = await Future.wait<dynamic>([
        _api.getProfile().catchError((_) => <String, dynamic>{}),
        _api.getUserProfile().catchError((_) => <String, dynamic>{}),
        _api.getWallets().catchError((_) => <dynamic>[]),
        _api.getTransactions(limit: 1000).catchError((_) => <dynamic>[]),
        _api.getBudgets().catchError((_) => <dynamic>[]),
        _api.getSavingsGoals().catchError((_) => <dynamic>[]),
        _api.getCategories().catchError((_) => <dynamic>[]),
        _api.getBillReminders().catchError((_) => <dynamic>[]),
        _api.getRecurringTransactions().catchError((_) => <dynamic>[]),
        _api.getBankAccounts().catchError((_) => <dynamic>[]),
        _api.getCreditCards().catchError((_) => <dynamic>[]),
        _api.getSharedExpenseGroups().catchError((_) => <dynamic>[]),
        _api.getFinancialReports().catchError((_) => <dynamic>[]),
        _api.getDebts().catchError((_) => <dynamic>[]),
        _api.getInvestments().catchError((_) => <dynamic>[]),
        _api.getAuditLogs().catchError((_) => <dynamic>[]),
      ]);

      final export = {
        'exportedAt': DateTime.now().toIso8601String(),
        'app': 'Expense Tracker Mobile',
        'profile': results[0],
        'settings': results[1],
        'wallets': results[2],
        'transactions': results[3],
        'budgets': results[4],
        'savingsGoals': results[5],
        'categories': results[6],
        'billReminders': results[7],
        'recurringTransactions': results[8],
        'bankAccounts': results[9],
        'creditCards': results[10],
        'sharedExpenseGroups': results[11],
        'financialReports': results[12],
        'debts': results[13],
        'investments': results[14],
        'auditLogs': results[15],
        'languageLessons': context.read<LanguageLearningProvider>().lessons.map((lesson) => lesson.toJson()).toList(),
      };

      const encoder = JsonEncoder.withIndent('  ');
      await Clipboard.setData(ClipboardData(text: encoder.convert(export)));

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đã copy toàn bộ dữ liệu cá nhân dạng JSON'), backgroundColor: Color(0xFF6C63FF)),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Không xuất được dữ liệu lúc này'), backgroundColor: Color(0xFFEB5757)),
      );
    }
  }

  Future<void> _deleteAllPersonalData() async {
    setState(() => _isDeleting = true);

    var deleted = 0;
    final failed = <String>[];

    Future<void> deleteCollection(
      String label,
      Future<List<dynamic>> Function() load,
      Future<void> Function(int id) remove,
    ) async {
      try {
        final items = await load();
        for (final item in items) {
          final id = _readId(item);
          if (id == null) continue;
          try {
            await remove(id);
            deleted++;
          } catch (_) {
            failed.add('$label #$id');
          }
        }
      } catch (_) {
        failed.add(label);
      }
    }

    await deleteCollection('Giao dịch', () => _api.getTransactions(limit: 1000), _api.deleteTransaction);
    await deleteCollection('Giao dịch định kỳ', _api.getRecurringTransactions, _api.deleteRecurringTransaction);
    await deleteCollection('Nhắc hóa đơn', _api.getBillReminders, _api.deleteBillReminder);
    await deleteCollection('Ngân sách', _api.getBudgets, _api.deleteBudget);
    await deleteCollection('Mục tiêu tiết kiệm', _api.getSavingsGoals, _api.deleteSavingsGoal);
    await deleteCollection('Báo cáo tài chính', _api.getFinancialReports, _api.deleteFinancialReport);
    await deleteCollection('Nhóm chia tiền', _api.getSharedExpenseGroups, _api.deleteSharedExpenseGroup);
    await deleteCollection('Thẻ tín dụng', _api.getCreditCards, _api.deleteCreditCard);
    await deleteCollection('Tài khoản ngân hàng', _api.getBankAccounts, _api.deleteBankAccount);
    await deleteCollection('Nợ', _api.getDebts, _api.deleteDebt);
    await deleteCollection('Đầu tư', _api.getInvestments, _api.deleteInvestment);
    await deleteCollection('Danh mục', _api.getCategories, _api.deleteCategory);
    await deleteCollection('Ví', _api.getWallets, _api.deleteWallet);

    if (mounted) {
      await context.read<LanguageLearningProvider>().clearAll();
    }

    if (!mounted) return;
    setState(() => _isDeleting = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          failed.isEmpty
              ? 'Đã xóa $deleted mục dữ liệu cá nhân.'
              : 'Đã xóa $deleted mục. Một số mục chưa xóa được: ${failed.take(3).join(', ')}',
        ),
        backgroundColor: failed.isEmpty ? const Color(0xFF6C63FF) : Colors.orange,
      ),
    );
  }

  int? _readId(dynamic item) {
    if (item is Map) {
      final raw = item['id'] ?? item['groupId'] ?? item['walletId'];
      if (raw is int) return raw;
      return int.tryParse(raw?.toString() ?? '');
    }

    try {
      final dynamic value = item;
      final id = value.id;
      if (id is int) return id;
      return int.tryParse(id?.toString() ?? '');
    } catch (_) {
      return null;
    }
  }
}
