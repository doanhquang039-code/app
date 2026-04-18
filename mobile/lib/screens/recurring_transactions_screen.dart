import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/recurring_transaction.dart';
import '../services/api_service.dart';
import '../models/category.dart';
import '../models/wallet.dart';

class RecurringTransactionsScreen extends StatefulWidget {
  const RecurringTransactionsScreen({super.key});

  @override
  State<RecurringTransactionsScreen> createState() => _RecurringTransactionsScreenState();
}

class _RecurringTransactionsScreenState extends State<RecurringTransactionsScreen> {
  final ApiService _api = ApiService();
  List<RecurringTransaction> _transactions = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final data = await _api.getRecurringTransactions();
      _transactions = data.map((e) => RecurringTransaction.fromJson(e)).toList();
    } catch (_) {}
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
    final activeCount = _transactions.where((t) => t.isActive).length;
    final totalMonthly = _transactions
        .where((t) => t.isActive && t.frequency == 'monthly')
        .fold(0.0, (s, t) => s + t.amount);

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2E),
        title: const Text('Giao dịch định kỳ', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF)))
          : RefreshIndicator(
              onRefresh: _loadData,
              color: const Color(0xFF6C63FF),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Summary
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(18),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(colors: [Color(0xFF6C63FF), Color(0xFF9C88FF)]),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Column(
                              children: [
                                const Icon(Icons.repeat, color: Colors.white, size: 28),
                                const SizedBox(height: 8),
                                Text('$activeCount', style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                                const Text('Đang hoạt động', style: TextStyle(color: Colors.white70, fontSize: 12)),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(18),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(colors: [Color(0xFFF97316), Color(0xFFFBBF24)]),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Column(
                              children: [
                                const Icon(Icons.calendar_month, color: Colors.white, size: 28),
                                const SizedBox(height: 8),
                                Text(
                                  NumberFormat.compactCurrency(locale: 'vi_VN', symbol: 'đ').format(totalMonthly),
                                  style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                                ),
                                const Text('Chi phí/tháng', style: TextStyle(color: Colors.white70, fontSize: 12)),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    const Text('Danh sách', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),

                    if (_transactions.isEmpty)
                      _emptyState()
                    else
                      ..._transactions.map((t) => _recurringCard(t, formatter)),
                  ],
                ),
              ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFF6C63FF),
        onPressed: () => _showAddDialog(),
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Thêm', style: TextStyle(color: Colors.white)),
      ),
    );
  }

  Widget _emptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 60),
        child: Column(
          children: [
            Icon(Icons.repeat_outlined, size: 64, color: Colors.white.withOpacity(0.2)),
            const SizedBox(height: 16),
            const Text('Chưa có giao dịch định kỳ', style: TextStyle(color: Colors.grey, fontSize: 16)),
          ],
        ),
      ),
    );
  }

  Widget _recurringCard(RecurringTransaction t, NumberFormat formatter) {
    final isIncome = t.type == 'income';
    final statusColor = t.isActive ? Colors.greenAccent : Colors.grey;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: t.isActive ? const Color(0xFF6C63FF).withOpacity(0.3) : Colors.transparent,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: (isIncome ? Colors.green : Colors.red).withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              isIncome ? Icons.arrow_upward_rounded : Icons.arrow_downward_rounded,
              color: isIncome ? Colors.greenAccent : Colors.redAccent,
              size: 22,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  t.categoryName ?? t.note ?? 'Giao dịch',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF6C63FF).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(t.frequencyLabel, style: const TextStyle(color: Color(0xFF6C63FF), fontSize: 11)),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        t.isActive ? 'Hoạt động' : 'Tạm dừng',
                        style: TextStyle(color: statusColor, fontSize: 11),
                      ),
                    ),
                  ],
                ),
                if (t.nextExecutionDate != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    'Tiếp theo: ${DateFormat('dd/MM/yyyy').format(t.nextExecutionDate!)}',
                    style: const TextStyle(color: Colors.grey, fontSize: 12),
                  ),
                ],
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${isIncome ? '+' : '-'}${formatter.format(t.amount)}',
                style: TextStyle(
                  color: isIncome ? Colors.greenAccent : Colors.redAccent,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 4),
              GestureDetector(
                onTap: () => _confirmDelete(t),
                child: const Icon(Icons.delete_outline, color: Colors.grey, size: 20),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showAddDialog() async {
    final amountCtrl = TextEditingController();
    final noteCtrl = TextEditingController();
    String type = 'expense';
    String frequency = 'monthly';
    int? selectedCategoryId;
    int? selectedWalletId;
    List<Category> categories = [];
    List<Wallet> wallets = [];

    try {
      final catData = await _api.getCategories();
      categories = catData.map((e) => Category.fromJson(e)).toList();
      final walletData = await _api.getWallets();
      wallets = walletData.map((e) => Wallet.fromJson(e)).toList();
      if (wallets.isNotEmpty) selectedWalletId = wallets.first.id;
    } catch (_) {}

    if (!mounted) return;

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
                  const Text('Thêm giao dịch định kỳ',
                      style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 20),
                  // Type toggle
                  Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setStateModal(() => type = 'expense'),
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: type == 'expense' ? Colors.redAccent.withOpacity(0.2) : const Color(0xFF1E1E2E),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: type == 'expense' ? Colors.redAccent : Colors.transparent),
                            ),
                            child: Center(
                              child: Text('Chi tiêu', style: TextStyle(
                                  color: type == 'expense' ? Colors.redAccent : Colors.grey, fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setStateModal(() => type = 'income'),
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: type == 'income' ? Colors.greenAccent.withOpacity(0.2) : const Color(0xFF1E1E2E),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: type == 'income' ? Colors.greenAccent : Colors.transparent),
                            ),
                            child: Center(
                              child: Text('Thu nhập', style: TextStyle(
                                  color: type == 'income' ? Colors.greenAccent : Colors.grey, fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _buildTextField(amountCtrl, 'Số tiền', Icons.attach_money, isNumber: true),
                  const SizedBox(height: 12),
                  _buildTextField(noteCtrl, 'Ghi chú', Icons.note),
                  const SizedBox(height: 12),
                  if (wallets.isNotEmpty)
                    DropdownButtonFormField<int>(
                      value: selectedWalletId,
                      dropdownColor: const Color(0xFF1E1E2E),
                      style: const TextStyle(color: Colors.white),
                      decoration: _dropdownDecoration('Ví', Icons.account_balance_wallet),
                      items: wallets.map((w) =>
                          DropdownMenuItem(value: w.id, child: Text(w.name, style: const TextStyle(color: Colors.white)))).toList(),
                      onChanged: (v) => setStateModal(() => selectedWalletId = v),
                    ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<int>(
                    value: selectedCategoryId,
                    dropdownColor: const Color(0xFF1E1E2E),
                    style: const TextStyle(color: Colors.white),
                    decoration: _dropdownDecoration('Danh mục', Icons.category),
                    items: categories.map((c) =>
                        DropdownMenuItem(value: c.id, child: Text(c.name, style: const TextStyle(color: Colors.white)))).toList(),
                    onChanged: (v) => setStateModal(() => selectedCategoryId = v),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: frequency,
                    dropdownColor: const Color(0xFF1E1E2E),
                    style: const TextStyle(color: Colors.white),
                    decoration: _dropdownDecoration('Tần suất', Icons.repeat),
                    items: [
                      {'value': 'daily', 'label': 'Hàng ngày'},
                      {'value': 'weekly', 'label': 'Hàng tuần'},
                      {'value': 'monthly', 'label': 'Hàng tháng'},
                      {'value': 'quarterly', 'label': 'Hàng quý'},
                      {'value': 'yearly', 'label': 'Hàng năm'},
                    ].map((f) => DropdownMenuItem(
                        value: f['value'],
                        child: Text(f['label']!, style: const TextStyle(color: Colors.white)))).toList(),
                    onChanged: (v) => setStateModal(() => frequency = v!),
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
                        if (selectedCategoryId == null || selectedWalletId == null) return;
                        try {
                          await _api.createRecurringTransaction({
                            'amount': double.tryParse(amountCtrl.text) ?? 0,
                            'type': type,
                            'note': noteCtrl.text,
                            'frequency': frequency,
                            'walletId': selectedWalletId,
                            'categoryId': selectedCategoryId,
                            'startDate': DateTime.now().toIso8601String(),
                          });
                          if (ctx.mounted) Navigator.pop(ctx);
                          _loadData();
                        } catch (_) {
                          if (ctx.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Thêm thất bại!'), backgroundColor: Colors.red),
                            );
                          }
                        }
                      },
                      child: const Text('Tạo giao dịch', style: TextStyle(color: Colors.white, fontSize: 16)),
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

  InputDecoration _dropdownDecoration(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(color: Colors.grey),
      prefixIcon: Icon(icon, color: const Color(0xFF6C63FF)),
      filled: true,
      fillColor: const Color(0xFF1E1E2E),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
    );
  }

  void _confirmDelete(RecurringTransaction t) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF2A2A3E),
        title: const Text('Xóa giao dịch định kỳ', style: TextStyle(color: Colors.white)),
        content: const Text('Bạn có chắc muốn xóa?', style: TextStyle(color: Colors.grey)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Hủy')),
          TextButton(
            onPressed: () async {
              await _api.deleteRecurringTransaction(t.id);
              if (context.mounted) Navigator.pop(context);
              _loadData();
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
