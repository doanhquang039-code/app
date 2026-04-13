import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../models/savings_goal.dart';
import 'dart:math' as math;

class SavingsScreen extends StatefulWidget {
  const SavingsScreen({super.key});

  @override
  State<SavingsScreen> createState() => _SavingsScreenState();
}

class _SavingsScreenState extends State<SavingsScreen> {
  final ApiService _api = ApiService();
  List<SavingsGoal> _goals = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final data = await _api.getSavingsGoals();
      setState(() {
        _goals = data.map((e) => SavingsGoal.fromJson(e)).toList();
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
    final totalTarget = _goals.fold(0.0, (s, g) => s + g.targetAmount);
    final totalSaved = _goals.fold(0.0, (s, g) => s + g.currentAmount);

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2E),
        title: const Text('Mục tiêu tiết kiệm', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: Color(0xFF6C63FF)),
            onPressed: () => _showAddGoalDialog(),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // Summary
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF8E2DE2), Color(0xFF4A00E0)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(color: const Color(0xFF8E2DE2).withOpacity(0.4), blurRadius: 20, offset: const Offset(0, 8)),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _summaryItem('Mục tiêu', formatter.format(totalTarget), Icons.flag),
                        Container(width: 1, height: 50, color: Colors.white30),
                        _summaryItem('Đã tiết kiệm', formatter.format(totalSaved), Icons.savings),
                        Container(width: 1, height: 50, color: Colors.white30),
                        _summaryItem('Còn thiếu', formatter.format(totalTarget - totalSaved), Icons.hourglass_bottom),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  if (_goals.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 80),
                      child: Column(
                        children: [
                          Icon(Icons.savings_outlined, size: 64, color: Colors.white.withOpacity(0.2)),
                          const SizedBox(height: 16),
                          const Text('Chưa có mục tiêu tiết kiệm', style: TextStyle(color: Colors.grey, fontSize: 16)),
                        ],
                      ),
                    )
                  else
                    ..._goals.map((g) => _goalCard(g, formatter)),
                ],
              ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFF8E2DE2),
        onPressed: () => _showAddGoalDialog(),
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Mục tiêu mới', style: TextStyle(color: Colors.white)),
      ),
    );
  }

  Widget _summaryItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.white70, size: 20),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: Colors.white54, fontSize: 11)),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
      ],
    );
  }

  Widget _goalCard(SavingsGoal goal, NumberFormat formatter) {
    final colors = [
      [const Color(0xFF6C63FF), const Color(0xFF9C88FF)],
      [const Color(0xFF11998E), const Color(0xFF38EF7D)],
      [const Color(0xFF8E2DE2), const Color(0xFF4A00E0)],
      [const Color(0xFFEB5757), const Color(0xFFF97316)],
    ];
    final colorPair = colors[goal.id % colors.length];

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3E),
        borderRadius: BorderRadius.circular(20),
        border: goal.isCompleted
            ? Border.all(color: const Color(0xFF38EF7D).withOpacity(0.5))
            : null,
      ),
      child: Row(
        children: [
          // Circular progress
          SizedBox(
            width: 70,
            height: 70,
            child: Stack(
              alignment: Alignment.center,
              children: [
                CustomPaint(
                  size: const Size(70, 70),
                  painter: _CircularProgressPainter(
                    progress: goal.progressPercent,
                    color: colorPair[0],
                  ),
                ),
                Text(
                  '${(goal.progressPercent * 100).toInt()}%',
                  style: TextStyle(
                    color: colorPair[0],
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        goal.name,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                    ),
                    if (goal.isCompleted)
                      const Icon(Icons.check_circle, color: Color(0xFF38EF7D), size: 20),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '${formatter.format(goal.currentAmount)} / ${formatter.format(goal.targetAmount)}',
                  style: const TextStyle(color: Colors.grey, fontSize: 13),
                ),
                if (goal.daysLeft != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    goal.daysLeft! > 0 ? 'Còn ${goal.daysLeft} ngày' : 'Đã hết hạn',
                    style: TextStyle(
                      color: goal.daysLeft! > 0 ? const Color(0xFF6C63FF) : const Color(0xFFEB5757),
                      fontSize: 12,
                    ),
                  ),
                ],
              ],
            ),
          ),
          Column(
            children: [
              IconButton(
                icon: const Icon(Icons.add_circle_outline, color: Color(0xFF6C63FF)),
                onPressed: () => _showContributeDialog(goal),
              ),
              IconButton(
                icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 20),
                onPressed: () => _deleteGoal(goal.id),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _deleteGoal(int id) async {
    try {
      await _api.deleteSavingsGoal(id);
      setState(() => _goals.removeWhere((g) => g.id == id));
    } catch (_) {}
  }

  void _showContributeDialog(SavingsGoal goal) {
    final ctrl = TextEditingController();
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF2A2A3E),
        title: Text('Đóng góp vào "${goal.name}"', style: const TextStyle(color: Colors.white, fontSize: 16)),
        content: TextField(
          controller: ctrl,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            labelText: 'Số tiền',
            labelStyle: const TextStyle(color: Colors.grey),
            filled: true,
            fillColor: const Color(0xFF1E1E2E),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Hủy')),
          TextButton(
            onPressed: () async {
              try {
                await _api.addContribution(goal.id, double.tryParse(ctrl.text) ?? 0);
                Navigator.pop(context);
                _loadData();
              } catch (_) {}
            },
            child: const Text('Xác nhận', style: TextStyle(color: Color(0xFF6C63FF))),
          ),
        ],
      ),
    );
  }

  void _showAddGoalDialog() {
    final nameCtrl = TextEditingController();
    final targetCtrl = TextEditingController();
    DateTime? deadline;

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
                const Text('Mục tiêu tiết kiệm mới', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 20),
                _buildTextField(nameCtrl, 'Tên mục tiêu', Icons.flag),
                const SizedBox(height: 12),
                _buildTextField(targetCtrl, 'Số tiền mục tiêu', Icons.attach_money, isNumber: true),
                const SizedBox(height: 12),
                GestureDetector(
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: ctx,
                      initialDate: DateTime.now().add(const Duration(days: 30)),
                      firstDate: DateTime.now(),
                      lastDate: DateTime(2030),
                    );
                    if (picked != null) setStateModal(() => deadline = picked);
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
                        Text(
                          deadline != null
                              ? DateFormat('dd/MM/yyyy').format(deadline!)
                              : 'Chọn thời hạn (tùy chọn)',
                          style: TextStyle(color: deadline != null ? Colors.white : Colors.grey),
                        ),
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
                      backgroundColor: const Color(0xFF8E2DE2),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    onPressed: () async {
                      try {
                        await _api.createSavingsGoal({
                          'name': nameCtrl.text,
                          'targetAmount': double.tryParse(targetCtrl.text) ?? 0,
                          'currentAmount': 0,
                          if (deadline != null) 'deadline': deadline!.toIso8601String(),
                        });
                        Navigator.pop(ctx);
                        _loadData();
                      } catch (_) {}
                    },
                    child: const Text('Tạo mục tiêu', style: TextStyle(color: Colors.white, fontSize: 16)),
                  ),
                ),
              ],
            ),
          );
        });
      },
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

class _CircularProgressPainter extends CustomPainter {
  final double progress;
  final Color color;

  _CircularProgressPainter({required this.progress, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width, size.height) / 2 - 4;

    // Background
    canvas.drawCircle(center, radius, Paint()
      ..color = color.withOpacity(0.15)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 6);

    // Progress
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2,
      2 * math.pi * progress,
      false,
      Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = 6
        ..strokeCap = StrokeCap.round,
    );
  }

  @override
  bool shouldRepaint(_) => true;
}
