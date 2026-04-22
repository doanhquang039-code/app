import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../models/debt.dart';

class DebtScreen extends StatefulWidget {
  const DebtScreen({super.key});

  @override
  State<DebtScreen> createState() => _DebtScreenState();
}

class _DebtScreenState extends State<DebtScreen> with SingleTickerProviderStateMixin {
  final ApiService _api = ApiService();
  List<Debt> _debts = [];
  bool _isLoading = true;
  late TabController _tabController;
  Map<String, dynamic> _summary = {};

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final results = await Future.wait([
        _api.getDebts(),
        _api.getDebtsSummary(),
      ]);
      setState(() {
        _debts = (results[0] as List).map((e) => Debt.fromJson(e)).toList();
        _summary = results[1] as Map<String, dynamic>;
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  List<Debt> get _lendDebts => _debts.where((d) => d.type == 'lend').toList();
  List<Debt> get _borrowDebts => _debts.where((d) => d.type == 'borrow').toList();
  List<Debt> get _activeDebts => _debts.where((d) => d.status == 'active').toList();

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
    final totalLend = _lendDebts.fold(0.0, (s, d) => s + d.remainingAmount);
    final totalBorrow = _borrowDebts.fold(0.0, (s, d) => s + d.remainingAmount);

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2E),
        title: const Text('Quản lý nợ', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF6C63FF),
          labelColor: const Color(0xFF6C63FF),
          unselectedLabelColor: Colors.grey,
          tabs: [
            Tab(text: 'Tất cả (${_debts.length})'),
            Tab(text: 'Cho vay (${_lendDebts.length})'),
            Tab(text: 'Đi vay (${_borrowDebts.length})'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF)))
          : Column(
              children: [
                // Summary header
                Container(
                  margin: const EdgeInsets.all(16),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF2C5364), Color(0xFF203A43)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _summaryItem('Người ta nợ', formatter.format(totalLend), Colors.greenAccent, Icons.arrow_downward),
                      Container(width: 1, height: 50, color: Colors.white24),
                      _summaryItem('Mình nợ', formatter.format(totalBorrow), Colors.redAccent, Icons.arrow_upward),
                      Container(width: 1, height: 50, color: Colors.white24),
                      _summaryItem('Ròng', formatter.format(totalLend - totalBorrow),
                          totalLend >= totalBorrow ? Colors.greenAccent : Colors.redAccent,
                          Icons.balance),
                    ],
                  ),
                ),
                Expanded(
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      _buildDebtList(_debts, formatter),
                      _buildDebtList(_lendDebts, formatter),
                      _buildDebtList(_borrowDebts, formatter),
                    ],
                  ),
                ),
              ],
            ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFF6C63FF),
        onPressed: () => _showAddDebtSheet(),
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Thêm nợ', style: TextStyle(color: Colors.white)),
      ),
    );
  }

  Widget _summaryItem(String label, String value, Color color, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: color, size: 18),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: Colors.white54, fontSize: 11)),
        const SizedBox(height: 2),
        Text(value, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12),
            overflow: TextOverflow.ellipsis),
      ],
    );
  }

  Widget _buildDebtList(List<Debt> debts, NumberFormat formatter) {
    if (debts.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.handshake_outlined, size: 64, color: Colors.white.withOpacity(0.2)),
            const SizedBox(height: 16),
            const Text('Không có khoản nợ nào', style: TextStyle(color: Colors.grey)),
          ],
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: _loadData,
      color: const Color(0xFF6C63FF),
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: debts.length,
        itemBuilder: (_, i) => _debtCard(debts[i], formatter),
      ),
    );
  }

  Widget _debtCard(Debt debt, NumberFormat formatter) {
    final isLend = debt.type == 'lend';
    final color = isLend ? Colors.greenAccent : Colors.redAccent;
    final progress = debt.totalAmount > 0 ? debt.paidAmount / debt.totalAmount : 0.0;
    final isOverdue = debt.dueDate != null && debt.dueDate!.isBefore(DateTime.now()) && debt.status == 'active';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3E),
        borderRadius: BorderRadius.circular(16),
        border: isOverdue ? Border.all(color: Colors.redAccent.withOpacity(0.5)) : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(isLend ? Icons.arrow_downward : Icons.arrow_upward, color: color, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(debt.title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                    Text(debt.personName, style: const TextStyle(color: Colors.grey, fontSize: 13)),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(formatter.format(debt.remainingAmount),
                      style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 15)),
                  if (isOverdue)
                    const Text('Quá hạn!', style: TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.bold)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${formatter.format(debt.paidAmount)} / ${formatter.format(debt.totalAmount)}',
                  style: const TextStyle(color: Colors.grey, fontSize: 12)),
              Text('${(progress * 100).toInt()}%', style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress.clamp(0.0, 1.0),
              backgroundColor: Colors.white.withOpacity(0.1),
              valueColor: AlwaysStoppedAnimation<Color>(color),
              minHeight: 6,
            ),
          ),
          if (debt.dueDate != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.calendar_today, size: 12, color: isOverdue ? Colors.redAccent : Colors.grey),
                const SizedBox(width: 4),
                Text(
                  'Hạn: ${DateFormat('dd/MM/yyyy').format(debt.dueDate!)}',
                  style: TextStyle(color: isOverdue ? Colors.redAccent : Colors.grey, fontSize: 12),
                ),
              ],
            ),
          ],
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _showPaymentDialog(debt),
                  icon: const Icon(Icons.payment, size: 16),
                  label: const Text('Thanh toán', style: TextStyle(fontSize: 12)),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: color,
                    side: BorderSide(color: color.withOpacity(0.5)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 20),
                onPressed: () => _deleteDebt(debt.id!),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _deleteDebt(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF2A2A3E),
        title: const Text('Xóa khoản nợ?', style: TextStyle(color: Colors.white)),
        content: const Text('Hành động này không thể hoàn tác.', style: TextStyle(color: Colors.grey)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Hủy')),
          TextButton(onPressed: () => Navigator.pop(context, true),
              child: const Text('Xóa', style: TextStyle(color: Colors.redAccent))),
        ],
      ),
    );
    if (confirm == true) {
      await _api.deleteDebt(id);
      _loadData();
    }
  }

  void _showPaymentDialog(Debt debt) {
    final ctrl = TextEditingController();
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF2A2A3E),
        title: Text('Thanh toán "${debt.title}"', style: const TextStyle(color: Colors.white, fontSize: 16)),
        content: TextField(
          controller: ctrl,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            labelText: 'Số tiền thanh toán',
            labelStyle: const TextStyle(color: Colors.grey),
            hintText: 'Còn lại: ${NumberFormat.currency(locale: "vi_VN", symbol: "đ").format(debt.remainingAmount)}',
            hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
            filled: true,
            fillColor: const Color(0xFF1E1E2E),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Hủy')),
          TextButton(
            onPressed: () async {
              final amount = double.tryParse(ctrl.text) ?? 0;
              if (amount > 0) {
                await _api.addDebtPayment(debt.id!, {
                  'amount': amount,
                  'paymentDate': DateTime.now().toIso8601String(),
                });
                Navigator.pop(context);
                _loadData();
              }
            },
            child: const Text('Xác nhận', style: TextStyle(color: Color(0xFF6C63FF))),
          ),
        ],
      ),
    );
  }

  void _showAddDebtSheet() {
    final titleCtrl = TextEditingController();
    final personCtrl = TextEditingController();
    final amountCtrl = TextEditingController();
    String type = 'borrow';
    DateTime? dueDate;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF2A2A3E),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModal) => Padding(
          padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Thêm khoản nợ', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              // Type selector
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setModal(() => type = 'borrow'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: type == 'borrow' ? Colors.redAccent.withOpacity(0.2) : const Color(0xFF1E1E2E),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: type == 'borrow' ? Colors.redAccent : Colors.transparent),
                        ),
                        child: const Center(child: Text('Đi vay', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold))),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setModal(() => type = 'lend'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: type == 'lend' ? Colors.greenAccent.withOpacity(0.2) : const Color(0xFF1E1E2E),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: type == 'lend' ? Colors.greenAccent : Colors.transparent),
                        ),
                        child: const Center(child: Text('Cho vay', style: TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold))),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _field(titleCtrl, 'Tiêu đề', Icons.title),
              const SizedBox(height: 10),
              _field(personCtrl, 'Tên người liên quan', Icons.person),
              const SizedBox(height: 10),
              _field(amountCtrl, 'Số tiền', Icons.attach_money, isNumber: true),
              const SizedBox(height: 10),
              GestureDetector(
                onTap: () async {
                  final d = await showDatePicker(
                    context: ctx,
                    initialDate: DateTime.now().add(const Duration(days: 30)),
                    firstDate: DateTime.now(),
                    lastDate: DateTime(2030),
                  );
                  if (d != null) setModal(() => dueDate = d);
                },
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(color: const Color(0xFF1E1E2E), borderRadius: BorderRadius.circular(12)),
                  child: Row(
                    children: [
                      const Icon(Icons.calendar_today, color: Color(0xFF6C63FF)),
                      const SizedBox(width: 8),
                      Text(
                        dueDate != null ? 'Hạn: ${DateFormat('dd/MM/yyyy').format(dueDate!)}' : 'Chọn ngày hạn (tùy chọn)',
                        style: TextStyle(color: dueDate != null ? Colors.white : Colors.grey),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
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
                      await _api.createDebt({
                        'title': titleCtrl.text,
                        'personName': personCtrl.text,
                        'type': type,
                        'totalAmount': double.tryParse(amountCtrl.text) ?? 0,
                        'startDate': DateTime.now().toIso8601String(),
                        if (dueDate != null) 'dueDate': dueDate!.toIso8601String(),
                      });
                      Navigator.pop(ctx);
                      _loadData();
                    } catch (_) {}
                  },
                  child: const Text('Thêm khoản nợ', style: TextStyle(color: Colors.white, fontSize: 16)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _field(TextEditingController ctrl, String label, IconData icon, {bool isNumber = false}) {
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
