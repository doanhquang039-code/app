import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final ApiService _api = ApiService();
  Map<String, dynamic>? _profile;
  Map<String, dynamic>? _healthScore;
  bool _isLoading = true;
  bool _isEditing = false;
  final _nameCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    try {
      final results = await Future.wait([
        _api.getProfile(),
        _api.getHealthScore().catchError((_) => <String, dynamic>{}),
      ]);
      setState(() {
        _profile = results[0] as Map<String, dynamic>;
        _healthScore = results[1] as Map<String, dynamic>;
        _nameCtrl.text = _profile?['name'] ?? '';
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2E),
        title: const Text('Hồ sơ', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.search, color: Colors.white),
            onPressed: () => Navigator.pushNamed(context, '/search'),
          ),
          if (!_isEditing)
            IconButton(
              icon: const Icon(Icons.edit, color: Color(0xFF6C63FF)),
              onPressed: () => setState(() => _isEditing = true),
            )
          else
            TextButton(
              onPressed: _saveProfile,
              child: const Text('Lưu', style: TextStyle(color: Color(0xFF6C63FF), fontWeight: FontWeight.bold)),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF)))
          : RefreshIndicator(
              onRefresh: _loadData,
              color: const Color(0xFF6C63FF),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    // Avatar + name
                    Container(
                      padding: const EdgeInsets.all(3),
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(colors: [Color(0xFF6C63FF), Color(0xFF9C88FF)]),
                      ),
                      child: CircleAvatar(
                        radius: 48,
                        backgroundColor: const Color(0xFF2A2A3E),
                        child: Text(
                          (_profile?['name'] ?? _profile?['email'] ?? 'U')[0].toUpperCase(),
                          style: const TextStyle(color: Colors.white, fontSize: 34, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    if (!_isEditing) ...[
                      Text(_profile?['name'] ?? 'Người dùng',
                          style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text(_profile?['email'] ?? '', style: const TextStyle(color: Colors.grey, fontSize: 14)),
                    ] else ...[
                      TextField(
                        controller: _nameCtrl,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                        decoration: InputDecoration(
                          hintText: 'Tên của bạn',
                          hintStyle: const TextStyle(color: Colors.grey),
                          filled: true,
                          fillColor: const Color(0xFF2A2A3E),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                        ),
                      ),
                    ],
                    const SizedBox(height: 24),

                    // Health Score Card
                    if (_healthScore != null && _healthScore!.isNotEmpty)
                      _buildHealthScoreCard(),

                    const SizedBox(height: 20),

                    // Stats grid
                    GridView.count(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisCount: 2,
                      mainAxisSpacing: 12,
                      crossAxisSpacing: 12,
                      childAspectRatio: 1.6,
                      children: [
                        _statCard('Thành viên từ', _formatDate(_profile?['createdAt']), Icons.person_outline, const Color(0xFF6C63FF)),
                        _statCard('Giao dịch', '${_profile?['transactionCount'] ?? 0}', Icons.swap_horiz, const Color(0xFF11998E)),
                        _statCard('Danh mục', '${_profile?['categoryCount'] ?? 0}', Icons.category, const Color(0xFF8E2DE2)),
                        _statCard('Ngân sách', '${_profile?['budgetCount'] ?? 0}', Icons.pie_chart, const Color(0xFFF97316)),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Menu sections
                    _sectionTitle('Tài chính'),
                    _menuItem(Icons.account_balance_wallet_outlined, 'Quản lý ví', '/wallets', const Color(0xFF6C63FF)),
                    _menuItem(Icons.pie_chart_outline, 'Ngân sách', '/budgets', const Color(0xFF11998E)),
                    _menuItem(Icons.savings_outlined, 'Mục tiêu tiết kiệm', '/savings', const Color(0xFF8E2DE2)),
                    _menuItem(Icons.receipt_long_outlined, 'Nhắc nhở hóa đơn', '/bills', const Color(0xFFF97316)),
                    _menuItem(Icons.handshake_outlined, 'Quản lý nợ', '/debts', const Color(0xFF2C5364)),
                    _menuItem(Icons.show_chart, 'Đầu tư', '/investments', const Color(0xFF11998E)),
                    _menuItem(Icons.trending_up, 'Tài sản ròng', '/net-worth', const Color(0xFF38EF7D)),

                    const SizedBox(height: 16),
                    _sectionTitle('Công cụ'),
                    _menuItem(Icons.search, 'Tìm kiếm giao dịch', '/search', const Color(0xFF6C63FF)),
                    _menuItem(Icons.upload_file_outlined, 'Nhập nhiều giao dịch', '/bulk-import', const Color(0xFF1A2980)),
                    _menuItem(Icons.assessment_outlined, 'Báo cáo tài chính', '/financial-reports', const Color(0xFFEB5757)),
                    _menuItem(Icons.analytics_outlined, 'Phân tích', '/analytics', const Color(0xFF11998E)),

                    const SizedBox(height: 16),
                    _sectionTitle('Cài đặt'),
                    _menuItem(Icons.settings_outlined, 'Cài đặt ứng dụng', '/settings', const Color(0xFF6C63FF)),
                    _menuItem(Icons.security_outlined, 'Bảo mật', null, const Color(0xFF8E2DE2), onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Tính năng đang phát triển')),
                      );
                    }),

                    const SizedBox(height: 16),
                    const Divider(color: Colors.white12),
                    const SizedBox(height: 12),

                    // Logout
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: OutlinedButton.icon(
                        icon: const Icon(Icons.logout, color: Color(0xFFEB5757)),
                        label: const Text('Đăng xuất', style: TextStyle(color: Color(0xFFEB5757), fontSize: 16)),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Color(0xFFEB5757)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        onPressed: () async {
                          await context.read<AuthProvider>().logout();
                          if (mounted) Navigator.pushReplacementNamed(context, '/login');
                        },
                      ),
                    ),
                    const SizedBox(height: 30),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildHealthScoreCard() {
    final score = _healthScore!['score'] ?? 0;
    final label = _healthScore!['label'] ?? '';
    final tips = (_healthScore!['tips'] as List?)?.cast<String>() ?? [];

    Color scoreColor;
    List<Color> gradientColors;
    if (score >= 80) {
      scoreColor = Colors.greenAccent;
      gradientColors = [const Color(0xFF11998E), const Color(0xFF38EF7D)];
    } else if (score >= 65) {
      scoreColor = const Color(0xFF6C63FF);
      gradientColors = [const Color(0xFF6C63FF), const Color(0xFF9C88FF)];
    } else if (score >= 50) {
      scoreColor = Colors.orangeAccent;
      gradientColors = [const Color(0xFFF97316), const Color(0xFFF9A825)];
    } else {
      scoreColor = Colors.redAccent;
      gradientColors = [const Color(0xFFEB5757), const Color(0xFFF97316)];
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: gradientColors, begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: gradientColors.first.withOpacity(0.35), blurRadius: 18, offset: const Offset(0, 6))],
      ),
      child: Row(
        children: [
          // Score circle
          SizedBox(
            width: 80,
            height: 80,
            child: Stack(
              alignment: Alignment.center,
              children: [
                CircularProgressIndicator(
                  value: score / 100,
                  strokeWidth: 7,
                  backgroundColor: Colors.white.withOpacity(0.2),
                  valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                ),
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('$score', style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                    Text(label, style: const TextStyle(color: Colors.white70, fontSize: 10)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Sức khỏe tài chính', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                const SizedBox(height: 6),
                if (tips.isNotEmpty)
                  ...tips.take(2).map((tip) => Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('• ', style: TextStyle(color: Colors.white70, fontSize: 12)),
                        Expanded(child: Text(tip, style: const TextStyle(color: Colors.white70, fontSize: 12))),
                      ],
                    ),
                  ))
                else
                  const Text('Tài chính của bạn đang ổn định', style: TextStyle(color: Colors.white70, fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Text(title, style: const TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.w600, letterSpacing: 0.5)),
    );
  }

  Widget _statCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: const Color(0xFF2A2A3E), borderRadius: BorderRadius.circular(14)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: color, size: 22),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 18)),
              Text(label, style: const TextStyle(color: Colors.grey, fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _menuItem(IconData icon, String label, String? route, Color color, {VoidCallback? onTap}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, color: color, size: 20),
        ),
        title: Text(label, style: const TextStyle(color: Colors.white, fontSize: 14)),
        trailing: const Icon(Icons.chevron_right, color: Colors.grey, size: 18),
        onTap: onTap ?? (route != null ? () => Navigator.pushNamed(context, route) : null),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        tileColor: const Color(0xFF2A2A3E),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
        dense: true,
      ),
    );
  }

  String _formatDate(dynamic date) {
    if (date == null) return 'N/A';
    try { return DateFormat('MM/yyyy').format(DateTime.parse(date.toString())); }
    catch (_) { return 'N/A'; }
  }

  Future<void> _saveProfile() async {
    try {
      await _api.updateProfile({'name': _nameCtrl.text});
      setState(() {
        _profile = {...?_profile, 'name': _nameCtrl.text};
        _isEditing = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Cập nhật thành công!'), backgroundColor: Color(0xFF6C63FF)),
        );
      }
    } catch (_) {}
  }
}
