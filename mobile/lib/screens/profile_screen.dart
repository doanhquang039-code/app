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
  bool _isLoading = true;
  bool _isEditing = false;
  final _nameCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final data = await _api.getProfile();
      setState(() {
        _profile = data;
        _nameCtrl.text = data['name'] ?? '';
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
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  // Avatar
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const LinearGradient(
                        colors: [Color(0xFF6C63FF), Color(0xFF9C88FF)],
                      ),
                    ),
                    child: CircleAvatar(
                      radius: 50,
                      backgroundColor: const Color(0xFF2A2A3E),
                      child: Text(
                        (_profile?['name'] ?? _profile?['email'] ?? 'U')[0].toUpperCase(),
                        style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  if (!_isEditing) ...[
                    Text(
                      _profile?['name'] ?? 'Người dùng',
                      style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _profile?['email'] ?? '',
                      style: const TextStyle(color: Colors.grey, fontSize: 14),
                    ),
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

                  const SizedBox(height: 32),

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

                  // Menu items
                  _menuItem(Icons.account_balance_wallet_outlined, 'Quản lý ví', () {
                    Navigator.pushNamed(context, '/wallets');
                  }),
                  _menuItem(Icons.pie_chart_outline, 'Ngân sách', () {
                    Navigator.pushNamed(context, '/budgets');
                  }),
                  _menuItem(Icons.savings_outlined, 'Mục tiêu tiết kiệm', () {
                    Navigator.pushNamed(context, '/savings');
                  }),
                  _menuItem(Icons.receipt_long_outlined, 'Nhắc nhở hóa đơn', () {
                    Navigator.pushNamed(context, '/bills');
                  }),

                  const SizedBox(height: 12),
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
    );
  }

  Widget _statCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3E),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: color, size: 22),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value,
                  style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 18)),
              Text(label, style: const TextStyle(color: Colors.grey, fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _menuItem(IconData icon, String label, VoidCallback onTap) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: const Color(0xFF6C63FF).withOpacity(0.15),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: const Color(0xFF6C63FF), size: 20),
      ),
      title: Text(label, style: const TextStyle(color: Colors.white, fontSize: 15)),
      trailing: const Icon(Icons.chevron_right, color: Colors.grey),
      onTap: onTap,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      tileColor: const Color(0xFF2A2A3E),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
    );
  }

  String _formatDate(dynamic date) {
    if (date == null) return 'N/A';
    try {
      return DateFormat('MM/yyyy').format(DateTime.parse(date.toString()));
    } catch (_) {
      return 'N/A';
    }
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
