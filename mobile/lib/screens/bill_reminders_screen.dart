import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../models/bill_reminder.dart';

class BillRemindersScreen extends StatefulWidget {
  const BillRemindersScreen({super.key});

  @override
  State<BillRemindersScreen> createState() => _BillRemindersScreenState();
}

class _BillRemindersScreenState extends State<BillRemindersScreen> {
  final ApiService _api = ApiService();
  List<BillReminder> _bills = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final data = await _api.getBillReminders();
      setState(() {
        _bills = data.map((e) => BillReminder.fromJson(e)).toList()
          ..sort((a, b) => a.dueDate.compareTo(b.dueDate));
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
    final unpaid = _bills.where((b) => !b.isPaid).toList();
    final overdue = _bills.where((b) => b.isOverdue).length;
    final dueSoon = _bills.where((b) => b.isDueSoon).length;
    final totalUnpaid = unpaid.fold(0.0, (s, b) => s + b.amount);

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2E),
        title: const Text('Nhắc nhở hóa đơn', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(icon: const Icon(Icons.add, color: Color(0xFF6C63FF)), onPressed: () => _showAddDialog()),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Alert summary
                  if (overdue > 0 || dueSoon > 0)
                    Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: overdue > 0
                            ? const Color(0xFFEB5757).withOpacity(0.15)
                            : const Color(0xFFF97316).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: overdue > 0
                              ? const Color(0xFFEB5757).withOpacity(0.4)
                              : const Color(0xFFF97316).withOpacity(0.4),
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.warning_rounded,
                            color: overdue > 0 ? const Color(0xFFEB5757) : const Color(0xFFF97316),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              overdue > 0
                                  ? '$overdue hóa đơn quá hạn${dueSoon > 0 ? ' | $dueSoon sắp đến hạn' : ''}'
                                  : '$dueSoon hóa đơn sắp đến hạn trong 3 ngày',
                              style: TextStyle(
                                color: overdue > 0 ? const Color(0xFFEB5757) : const Color(0xFFF97316),
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Unpaid total
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF2980B9), Color(0xFF6DD5FA)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Tổng cần thanh toán', style: TextStyle(color: Colors.white70, fontSize: 13)),
                            Text(formatter.format(totalUnpaid),
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 22)),
                          ],
                        ),
                        Text(
                          '${unpaid.length} hóa đơn',
                          style: const TextStyle(color: Colors.white70, fontSize: 14),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),
                  const Text('Hóa đơn', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),

                  if (_bills.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 60),
                      child: Center(
                        child: Column(
                          children: [
                            Icon(Icons.receipt_long_outlined, size: 64, color: Colors.white.withOpacity(0.2)),
                            const SizedBox(height: 12),
                            const Text('Chưa có hóa đơn nào', style: TextStyle(color: Colors.grey)),
                          ],
                        ),
                      ),
                    )
                  else
                    ..._bills.map((b) => _billCard(b, formatter)),
                ],
              ),
            ),
    );
  }

  Widget _billCard(BillReminder bill, NumberFormat formatter) {
    Color statusColor;
    IconData statusIcon;

    if (bill.isPaid) {
      statusColor = const Color(0xFF38EF7D);
      statusIcon = Icons.check_circle;
    } else if (bill.isOverdue) {
      statusColor = const Color(0xFFEB5757);
      statusIcon = Icons.error;
    } else if (bill.isDueSoon) {
      statusColor = const Color(0xFFF97316);
      statusIcon = Icons.access_time;
    } else {
      statusColor = Colors.grey;
      statusIcon = Icons.pending;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3E),
        borderRadius: BorderRadius.circular(14),
        border: (bill.isOverdue && !bill.isPaid)
            ? Border.all(color: const Color(0xFFEB5757).withOpacity(0.4))
            : null,
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(statusIcon, color: statusColor, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(bill.name,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                const SizedBox(height: 2),
                Text(
                  DateFormat('dd/MM/yyyy').format(bill.dueDate),
                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                ),
                if (bill.frequency != null)
                  Text('🔄 ${bill.frequency}', style: const TextStyle(color: Colors.grey, fontSize: 11)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                formatter.format(bill.amount),
                style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 14),
              ),
              const SizedBox(height: 4),
              if (!bill.isPaid)
                GestureDetector(
                  onTap: () => _markPaid(bill.id),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF6C63FF).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text('Trả ngay', style: TextStyle(color: Color(0xFF6C63FF), fontSize: 12)),
                  ),
                ),
            ],
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert, color: Colors.grey, size: 18),
            color: const Color(0xFF1E1E2E),
            onSelected: (v) {
              if (v == 'delete') _deleteBill(bill.id);
            },
            itemBuilder: (_) => [
              const PopupMenuItem(
                value: 'delete',
                child: Text('Xóa', style: TextStyle(color: Colors.redAccent)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _markPaid(int id) async {
    try {
      await _api.markBillPaid(id);
      _loadData();
    } catch (_) {}
  }

  Future<void> _deleteBill(int id) async {
    try {
      await _api.deleteBillReminder(id);
      setState(() => _bills.removeWhere((b) => b.id == id));
    } catch (_) {}
  }

  void _showAddDialog() {
    final nameCtrl = TextEditingController();
    final amountCtrl = TextEditingController();
    DateTime dueDate = DateTime.now().add(const Duration(days: 7));
    String frequency = 'monthly';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF2A2A3E),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) {
        return StatefulBuilder(builder: (ctx, setStateModal) {
          return Padding(
            padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Thêm hóa đơn', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                TextField(
                  controller: nameCtrl,
                  style: const TextStyle(color: Colors.white),
                  decoration: _inputDecor('Tên hóa đơn', Icons.receipt),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: amountCtrl,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  style: const TextStyle(color: Colors.white),
                  decoration: _inputDecor('Số tiền', Icons.attach_money),
                ),
                const SizedBox(height: 12),
                GestureDetector(
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: ctx,
                      initialDate: dueDate,
                      firstDate: DateTime.now().subtract(const Duration(days: 1)),
                      lastDate: DateTime(2030),
                    );
                    if (picked != null) setStateModal(() => dueDate = picked);
                  },
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E1E2E),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today, color: Color(0xFF6C63FF)),
                        const SizedBox(width: 8),
                        Text(DateFormat('dd/MM/yyyy').format(dueDate), style: const TextStyle(color: Colors.white)),
                      ],
                    ),
                  ),
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
                        await _api.createBillReminder({
                          'name': nameCtrl.text,
                          'amount': double.tryParse(amountCtrl.text) ?? 0,
                          'dueDate': dueDate.toIso8601String(),
                          'frequency': frequency,
                          'isPaid': false,
                        });
                        Navigator.pop(ctx);
                        _loadData();
                      } catch (_) {}
                    },
                    child: const Text('Thêm hóa đơn', style: TextStyle(color: Colors.white, fontSize: 16)),
                  ),
                ),
              ],
            ),
          );
        });
      },
    );
  }

  InputDecoration _inputDecor(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(color: Colors.grey),
      prefixIcon: Icon(icon, color: const Color(0xFF6C63FF)),
      filled: true,
      fillColor: const Color(0xFF1E1E2E),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
    );
  }
}
