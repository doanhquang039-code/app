import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/bank_account.dart';
import '../services/api_service.dart';

class BankAccountsScreen extends StatefulWidget {
  const BankAccountsScreen({super.key});

  @override
  State<BankAccountsScreen> createState() => _BankAccountsScreenState();
}

class _BankAccountsScreenState extends State<BankAccountsScreen> {
  final ApiService _api = ApiService();
  List<BankAccount> _accounts = [];
  bool _isLoading = true;
  double _totalBalance = 0;

  @override
  void initState() {
    super.initState();
    _loadAccounts();
  }

  Future<void> _loadAccounts() async {
    setState(() => _isLoading = true);
    try {
      final data = await _api.getBankAccounts();
      _accounts = data.map((e) => BankAccount.fromJson(e)).toList();
      _totalBalance = _accounts.fold(0, (sum, a) => sum + a.balance);
    } catch (_) {}
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2E),
        title: const Text('Tài khoản ngân hàng', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF)))
          : RefreshIndicator(
              onRefresh: _loadAccounts,
              color: const Color(0xFF6C63FF),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Total balance card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF0F2027), Color(0xFF203A43), Color(0xFF2C5364)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF2C5364).withOpacity(0.4),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Icon(Icons.account_balance, color: Colors.white, size: 22),
                              ),
                              const SizedBox(width: 10),
                              const Text('Tổng số dư ngân hàng', style: TextStyle(color: Colors.white70, fontSize: 14)),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            formatter.format(_totalBalance),
                            style: const TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${_accounts.length} tài khoản',
                            style: const TextStyle(color: Colors.white54, fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Account type chips
                    SizedBox(
                      height: 40,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        children: [
                          _typeChip('Tất cả', _accounts.length, const Color(0xFF6C63FF)),
                          _typeChip('Tiết kiệm', _accounts.where((a) => a.accountType == 'Savings').length, const Color(0xFF11998E)),
                          _typeChip('Thanh toán', _accounts.where((a) => a.accountType == 'Checking').length, const Color(0xFFF97316)),
                          _typeChip('Doanh nghiệp', _accounts.where((a) => a.accountType == 'Business').length, const Color(0xFF8E2DE2)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    const Text('Danh sách tài khoản',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),

                    if (_accounts.isEmpty)
                      _emptyState()
                    else
                      ..._accounts.map((account) => _accountCard(account, formatter)),
                  ],
                ),
              ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFF6C63FF),
        onPressed: () => _showAddDialog(),
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Thêm TK', style: TextStyle(color: Colors.white)),
      ),
    );
  }

  Widget _typeChip(String label, int count, Color color) {
    return Container(
      margin: const EdgeInsets.only(right: 10),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.4)),
      ),
      child: Row(
        children: [
          Text(label, style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.w600)),
          const SizedBox(width: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(color: color.withOpacity(0.25), borderRadius: BorderRadius.circular(10)),
            child: Text('$count', style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _emptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 60),
        child: Column(
          children: [
            Icon(Icons.account_balance_outlined, size: 64, color: Colors.white.withOpacity(0.2)),
            const SizedBox(height: 16),
            const Text('Chưa có tài khoản ngân hàng', style: TextStyle(color: Colors.grey, fontSize: 16)),
            const SizedBox(height: 8),
            const Text('Nhấn + để thêm tài khoản mới', style: TextStyle(color: Colors.grey, fontSize: 13)),
          ],
        ),
      ),
    );
  }

  Widget _accountCard(BankAccount account, NumberFormat formatter) {
    final colors = [
      [const Color(0xFF0F2027), const Color(0xFF2C5364)],
      [const Color(0xFF1A2980), const Color(0xFF26D0CE)],
      [const Color(0xFF134E5E), const Color(0xFF71B280)],
      [const Color(0xFF2C3E50), const Color(0xFF3498DB)],
    ];
    final colorPair = colors[account.id % colors.length];
    
    IconData typeIcon;
    switch (account.accountType) {
      case 'Savings': typeIcon = Icons.savings; break;
      case 'Checking': typeIcon = Icons.payment; break;
      case 'Business': typeIcon = Icons.business; break;
      default: typeIcon = Icons.account_balance; break;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: colorPair, begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: colorPair[0].withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(typeIcon, color: Colors.white, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(account.bankName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                      Text(account.accountHolder, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                    ],
                  ),
                ],
              ),
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_vert, color: Colors.white70, size: 20),
                color: const Color(0xFF2A2A3E),
                onSelected: (val) {
                  if (val == 'delete') _confirmDelete(account);
                },
                itemBuilder: (_) => [
                  const PopupMenuItem(value: 'delete', child: Text('Xóa', style: TextStyle(color: Colors.redAccent))),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Số tài khoản', style: TextStyle(color: Colors.white54, fontSize: 11)),
                  Text(account.accountNumber, style: const TextStyle(color: Colors.white, fontSize: 14, letterSpacing: 1)),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text('Số dư', style: TextStyle(color: Colors.white54, fontSize: 11)),
                  Text(formatter.format(account.balance),
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(account.accountType ?? 'Chung', style: const TextStyle(color: Colors.white70, fontSize: 11)),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: account.isActive
                      ? Colors.green.withOpacity(0.2)
                      : Colors.red.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  account.isActive ? 'Hoạt động' : 'Đã khóa',
                  style: TextStyle(color: account.isActive ? Colors.greenAccent : Colors.redAccent, fontSize: 11),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showAddDialog() {
    final bankNameCtrl = TextEditingController();
    final accountNumCtrl = TextEditingController();
    final holderCtrl = TextEditingController();
    final balanceCtrl = TextEditingController(text: '0');
    String selectedType = 'Savings';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF2A2A3E),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) {
        return StatefulBuilder(builder: (ctx, setStateModal) {
          return Padding(
            padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Thêm tài khoản ngân hàng',
                      style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 20),
                  _buildTextField(bankNameCtrl, 'Tên ngân hàng', Icons.account_balance),
                  const SizedBox(height: 12),
                  _buildTextField(accountNumCtrl, 'Số tài khoản', Icons.numbers),
                  const SizedBox(height: 12),
                  _buildTextField(holderCtrl, 'Chủ tài khoản', Icons.person),
                  const SizedBox(height: 12),
                  _buildTextField(balanceCtrl, 'Số dư', Icons.attach_money, isNumber: true),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: selectedType,
                    dropdownColor: const Color(0xFF1E1E2E),
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      labelText: 'Loại tài khoản',
                      labelStyle: const TextStyle(color: Colors.grey),
                      prefixIcon: const Icon(Icons.category, color: Color(0xFF6C63FF)),
                      filled: true,
                      fillColor: const Color(0xFF1E1E2E),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    ),
                    items: ['Savings', 'Checking', 'Business'].map((t) =>
                        DropdownMenuItem(value: t, child: Text(t, style: const TextStyle(color: Colors.white)))).toList(),
                    onChanged: (v) => setStateModal(() => selectedType = v!),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6C63FF),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () async {
                        try {
                          await _api.createBankAccount({
                            'bankName': bankNameCtrl.text,
                            'accountNumber': accountNumCtrl.text,
                            'accountHolder': holderCtrl.text,
                            'balance': double.tryParse(balanceCtrl.text) ?? 0,
                            'accountType': selectedType,
                          });
                          if (ctx.mounted) Navigator.pop(ctx);
                          _loadAccounts();
                        } catch (_) {
                          if (ctx.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Thêm thất bại!'), backgroundColor: Colors.red),
                            );
                          }
                        }
                      },
                      child: const Text('Thêm tài khoản', style: TextStyle(color: Colors.white, fontSize: 16)),
                    ),
                  ),
                ],
              ),
            ),
          );
        });
      },
    );
  }

  void _confirmDelete(BankAccount account) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF2A2A3E),
        title: const Text('Xóa tài khoản', style: TextStyle(color: Colors.white)),
        content: Text('Bạn có chắc muốn xóa "${account.bankName}"?', style: const TextStyle(color: Colors.grey)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Hủy')),
          TextButton(
            onPressed: () async {
              await _api.deleteBankAccount(account.id);
              if (context.mounted) Navigator.pop(context);
              _loadAccounts();
            },
            child: const Text('Xóa', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField(TextEditingController ctrl, String label, IconData icon, {bool isNumber = false}) {
    return TextField(
      controller: ctrl,
      keyboardType: isNumber ? const TextInputType.numberWithOptions(decimal: true) : TextInputType.text,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.grey),
        prefixIcon: Icon(icon, color: const Color(0xFF6C63FF)),
        filled: true,
        fillColor: const Color(0xFF1E1E2E),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
      ),
    );
  }
}
