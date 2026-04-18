import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/shared_expense.dart';
import '../services/api_service.dart';

class SharedExpensesScreen extends StatefulWidget {
  const SharedExpensesScreen({super.key});

  @override
  State<SharedExpensesScreen> createState() => _SharedExpensesScreenState();
}

class _SharedExpensesScreenState extends State<SharedExpensesScreen> {
  final ApiService _api = ApiService();
  List<SharedExpenseGroup> _groups = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadGroups();
  }

  Future<void> _loadGroups() async {
    setState(() => _isLoading = true);
    try {
      final data = await _api.getSharedExpenseGroups();
      _groups = data.map((e) => SharedExpenseGroup.fromJson(e)).toList();
    } catch (_) {}
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
    final totalShared = _groups.fold(0.0, (s, g) => s + g.totalAmount);

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2E),
        title: const Text('Chi tiêu chung', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF)))
          : RefreshIndicator(
              onRefresh: _loadGroups,
              color: const Color(0xFF6C63FF),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Summary header
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(22),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF8E2DE2), Color(0xFF4A00E0)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF8E2DE2).withOpacity(0.35),
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
                                child: const Icon(Icons.group, color: Colors.white, size: 22),
                              ),
                              const SizedBox(width: 10),
                              const Text('Tổng chi tiêu chung', style: TextStyle(color: Colors.white70, fontSize: 14)),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            formatter.format(totalShared),
                            style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${_groups.length} nhóm',
                            style: const TextStyle(color: Colors.white54, fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    const Text('Nhóm chi tiêu', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),

                    if (_groups.isEmpty)
                      _emptyState()
                    else
                      ..._groups.map((group) => _groupCard(group, formatter)),
                  ],
                ),
              ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFF6C63FF),
        onPressed: () => _showCreateGroupDialog(),
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Tạo nhóm', style: TextStyle(color: Colors.white)),
      ),
    );
  }

  Widget _emptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 60),
        child: Column(
          children: [
            Icon(Icons.group_outlined, size: 64, color: Colors.white.withOpacity(0.2)),
            const SizedBox(height: 16),
            const Text('Chưa có nhóm chi tiêu nào', style: TextStyle(color: Colors.grey, fontSize: 16)),
            const SizedBox(height: 8),
            const Text('Tạo nhóm để chia sẻ chi phí', style: TextStyle(color: Colors.grey, fontSize: 13)),
          ],
        ),
      ),
    );
  }

  Widget _groupCard(SharedExpenseGroup group, NumberFormat formatter) {
    final icons = [Icons.restaurant, Icons.flight, Icons.home, Icons.shopping_bag, Icons.celebration];
    final colors = [
      [const Color(0xFF6C63FF), const Color(0xFF9C88FF)],
      [const Color(0xFF11998E), const Color(0xFF38EF7D)],
      [const Color(0xFFF97316), const Color(0xFFFBBF24)],
      [const Color(0xFFEB5757), const Color(0xFFF9A825)],
      [const Color(0xFF8E2DE2), const Color(0xFF4A00E0)],
    ];
    final colorPair = colors[group.id % colors.length];
    final iconData = icons[group.id % icons.length];

    return GestureDetector(
      onTap: () => _showGroupDetails(group, formatter),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: const Color(0xFF2A2A3E),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: colorPair[0].withOpacity(0.3)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: colorPair),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(iconData, color: Colors.white, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(group.groupName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(height: 4),
                  if (group.description != null)
                    Text(group.description!, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.people, color: Colors.grey[600], size: 14),
                      const SizedBox(width: 4),
                      Text('${group.memberCount} thành viên', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                      const SizedBox(width: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: group.isActive
                              ? Colors.green.withOpacity(0.15)
                              : Colors.red.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          group.isActive ? 'Đang hoạt động' : 'Đã đóng',
                          style: TextStyle(
                            color: group.isActive ? Colors.greenAccent : Colors.redAccent,
                            fontSize: 11,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  formatter.format(group.totalAmount),
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                ),
                const SizedBox(height: 4),
                PopupMenuButton<String>(
                  icon: const Icon(Icons.more_vert, color: Colors.grey, size: 20),
                  color: const Color(0xFF2A2A3E),
                  onSelected: (val) {
                    if (val == 'delete') _confirmDelete(group);
                  },
                  itemBuilder: (_) => [
                    const PopupMenuItem(value: 'delete', child: Text('Xóa nhóm', style: TextStyle(color: Colors.redAccent))),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showGroupDetails(SharedExpenseGroup group, NumberFormat formatter) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF2A2A3E),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) {
        return Container(
          constraints: BoxConstraints(maxHeight: MediaQuery.of(ctx).size.height * 0.7),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(group.groupName, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.grey),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const Divider(color: Colors.white12),
              const SizedBox(height: 8),
              Text('Tổng: ${formatter.format(group.totalAmount)}',
                  style: const TextStyle(color: Color(0xFF6C63FF), fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              const Text('Chi tiêu trong nhóm', style: TextStyle(color: Colors.white70, fontSize: 14)),
              const SizedBox(height: 8),
              Expanded(
                child: group.expenses.isEmpty
                    ? const Center(child: Text('Chưa có chi tiêu nào', style: TextStyle(color: Colors.grey)))
                    : ListView.builder(
                        itemCount: group.expenses.length,
                        itemBuilder: (_, i) {
                          final exp = group.expenses[i];
                          return Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E1E2E),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(exp.description, style: const TextStyle(color: Colors.white, fontSize: 14)),
                                      if (exp.paidByName != null)
                                        Text('Trả bởi: ${exp.paidByName}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                                    ],
                                  ),
                                ),
                                Text(formatter.format(exp.amount),
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          );
                        },
                      ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.add, color: Colors.white),
                  label: const Text('Thêm chi tiêu', style: TextStyle(color: Colors.white)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6C63FF),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: () {
                    Navigator.pop(ctx);
                    _showAddExpenseDialog(group);
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showCreateGroupDialog() {
    final nameCtrl = TextEditingController();
    final descCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF2A2A3E),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Tạo nhóm mới', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 20),
              _buildTextField(nameCtrl, 'Tên nhóm', Icons.group),
              const SizedBox(height: 12),
              _buildTextField(descCtrl, 'Mô tả', Icons.description),
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
                      await _api.createSharedExpenseGroup({
                        'groupName': nameCtrl.text,
                        'description': descCtrl.text,
                      });
                      if (ctx.mounted) Navigator.pop(ctx);
                      _loadGroups();
                    } catch (_) {
                      if (ctx.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Tạo thất bại!'), backgroundColor: Colors.red),
                        );
                      }
                    }
                  },
                  child: const Text('Tạo nhóm', style: TextStyle(color: Colors.white, fontSize: 16)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showAddExpenseDialog(SharedExpenseGroup group) {
    final descCtrl = TextEditingController();
    final amountCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF2A2A3E),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Thêm chi tiêu - ${group.groupName}',
                  style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 20),
              _buildTextField(descCtrl, 'Mô tả', Icons.edit),
              const SizedBox(height: 12),
              _buildTextField(amountCtrl, 'Số tiền', Icons.attach_money, isNumber: true),
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
                      await _api.addSharedExpense(group.id, {
                        'description': descCtrl.text,
                        'amount': double.tryParse(amountCtrl.text) ?? 0,
                      });
                      if (ctx.mounted) Navigator.pop(ctx);
                      _loadGroups();
                    } catch (_) {}
                  },
                  child: const Text('Thêm', style: TextStyle(color: Colors.white, fontSize: 16)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _confirmDelete(SharedExpenseGroup group) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF2A2A3E),
        title: const Text('Xóa nhóm', style: TextStyle(color: Colors.white)),
        content: Text('Bạn có chắc muốn xóa "${group.groupName}"?', style: const TextStyle(color: Colors.grey)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Hủy')),
          TextButton(
            onPressed: () async {
              await _api.deleteSharedExpenseGroup(group.id);
              if (context.mounted) Navigator.pop(context);
              _loadGroups();
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
