import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../providers/budget_provider.dart';
import '../models/budget.dart';
import '../services/api_service.dart';
import '../models/category.dart';

class BudgetScreen extends StatefulWidget {
  const BudgetScreen({super.key});

  @override
  State<BudgetScreen> createState() => _BudgetScreenState();
}

class _BudgetScreenState extends State<BudgetScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<BudgetProvider>().loadBudgets();
    });
  }

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2E),
        title: const Text('Ngân sách', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: Color(0xFF6C63FF)),
            onPressed: () => _showBudgetDialog(context),
          ),
        ],
      ),
      body: Consumer<BudgetProvider>(builder: (ctx, provider, _) {
        if (provider.isLoading) {
          return const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF)));
        }

        final budgets = provider.budgets;
        final totalBudget = budgets.fold(0.0, (s, b) => s + b.amount);
        final totalSpent = budgets.fold(0.0, (s, b) => s + b.spent);

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Summary card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: totalSpent > totalBudget
                        ? [const Color(0xFFEB5757), const Color(0xFFF97316)]
                        : [const Color(0xFF11998E), const Color(0xFF38EF7D)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: (totalSpent > totalBudget
                          ? const Color(0xFFEB5757)
                          : const Color(0xFF11998E)).withOpacity(0.35),
                      blurRadius: 18,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Tổng ngân sách', style: TextStyle(color: Colors.white70, fontSize: 13)),
                            Text(formatter.format(totalBudget),
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20)),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            const Text('Đã chi', style: TextStyle(color: Colors.white70, fontSize: 13)),
                            Text(formatter.format(totalSpent),
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20)),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: LinearProgressIndicator(
                        value: totalBudget > 0 ? (totalSpent / totalBudget).clamp(0.0, 1.0) : 0,
                        backgroundColor: Colors.white.withOpacity(0.3),
                        valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                        minHeight: 8,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Còn lại: ${formatter.format((totalBudget - totalSpent).abs())}',
                          style: const TextStyle(color: Colors.white, fontSize: 13),
                        ),
                        Text(
                          totalBudget > 0
                              ? '${(totalSpent / totalBudget * 100).toStringAsFixed(0)}%'
                              : '0%',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              if (provider.overBudget.isNotEmpty || provider.nearLimit.isNotEmpty) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEB5757).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFEB5757).withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.warning_amber_rounded, color: Color(0xFFEB5757)),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          '${provider.overBudget.length} ngân sách vượt mức | ${provider.nearLimit.length} gần đến giới hạn',
                          style: const TextStyle(color: Color(0xFFEB5757), fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 20),
              const Text('Chi tiết ngân sách',
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),

              if (budgets.isEmpty)
                _emptyState()
              else
                ...budgets.map((b) => _budgetCard(b, formatter, provider)),
            ],
          ),
        );
      }),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFF6C63FF),
        onPressed: () => _showBudgetDialog(context),
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Thêm ngân sách', style: TextStyle(color: Colors.white)),
      ),
    );
  }

  Widget _emptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 60),
        child: Column(
          children: [
            Icon(Icons.pie_chart_outline, size: 64, color: Colors.white.withOpacity(0.2)),
            const SizedBox(height: 16),
            const Text('Chưa có ngân sách nào', style: TextStyle(color: Colors.grey, fontSize: 16)),
          ],
        ),
      ),
    );
  }

  Widget _budgetCard(Budget budget, NumberFormat formatter, BudgetProvider provider) {
    Color progressColor;
    if (budget.isOverBudget) {
      progressColor = const Color(0xFFEB5757);
    } else if (budget.isNearLimit) {
      progressColor = const Color(0xFFF97316);
    } else {
      progressColor = const Color(0xFF6C63FF);
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3E),
        borderRadius: BorderRadius.circular(16),
        border: budget.isOverBudget
            ? Border.all(color: const Color(0xFFEB5757).withOpacity(0.5))
            : null,
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
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: progressColor.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(Icons.category, color: progressColor, size: 18),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    budget.categoryName ?? 'Tất cả',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  if (budget.isOverBudget) ...[
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEB5757).withOpacity(0.2),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text('Vượt mức!', style: TextStyle(color: Color(0xFFEB5757), fontSize: 11)),
                    ),
                  ],
                ],
              ),
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_vert, color: Colors.grey, size: 20),
                color: const Color(0xFF1E1E2E),
                onSelected: (v) {
                  if (v == 'delete') {
                    provider.deleteBudget(budget.id);
                  }
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
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                formatter.format(budget.spent),
                style: TextStyle(color: progressColor, fontWeight: FontWeight.bold, fontSize: 16),
              ),
              Text(
                formatter.format(budget.amount),
                style: const TextStyle(color: Colors.grey, fontSize: 14),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: budget.progressPercent,
              backgroundColor: Colors.white.withOpacity(0.1),
              valueColor: AlwaysStoppedAnimation<Color>(progressColor),
              minHeight: 6,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            budget.isOverBudget
                ? 'Đã vượt ${formatter.format(budget.spent - budget.amount)}'
                : 'Còn lại ${formatter.format(budget.remaining)}',
            style: TextStyle(color: budget.isOverBudget ? const Color(0xFFEB5757) : Colors.grey, fontSize: 12),
          ),
        ],
      ),
    );
  }

  void _showBudgetDialog(BuildContext context) async {
    final amountCtrl = TextEditingController();
    int? selectedCategoryId;
    List<Category> categories = [];

    try {
      final api = ApiService();
      final data = await api.getCategories();
      categories = data.map((e) => Category.fromJson(e)).toList();
    } catch (_) {}

    if (!context.mounted) return;

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
                const Text('Thêm ngân sách', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 20),
                DropdownButtonFormField<int>(
                  value: selectedCategoryId,
                  dropdownColor: const Color(0xFF1E1E2E),
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: 'Danh mục',
                    labelStyle: const TextStyle(color: Colors.grey),
                    prefixIcon: const Icon(Icons.category, color: Color(0xFF6C63FF)),
                    filled: true,
                    fillColor: const Color(0xFF1E1E2E),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                  items: [
                    const DropdownMenuItem(value: null, child: Text('Tất cả', style: TextStyle(color: Colors.white))),
                    ...categories.map((c) => DropdownMenuItem(value: c.id, child: Text(c.name, style: const TextStyle(color: Colors.white)))),
                  ],
                  onChanged: (v) => setStateModal(() => selectedCategoryId = v),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: amountCtrl,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: 'Số tiền ngân sách',
                    labelStyle: const TextStyle(color: Colors.grey),
                    prefixIcon: const Icon(Icons.attach_money, color: Color(0xFF6C63FF)),
                    filled: true,
                    fillColor: const Color(0xFF1E1E2E),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
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
                      final now = DateTime.now();
                      final data = {
                        'amount': double.tryParse(amountCtrl.text) ?? 0,
                        'period': 'monthly',
                        'startDate': DateTime(now.year, now.month, 1).toIso8601String(),
                        'endDate': DateTime(now.year, now.month + 1, 0).toIso8601String(),
                        if (selectedCategoryId != null) 'categoryId': selectedCategoryId,
                      };
                      await context.read<BudgetProvider>().createBudget(data);
                      if (ctx.mounted) Navigator.pop(ctx);
                    },
                    child: const Text('Tạo ngân sách', style: TextStyle(color: Colors.white, fontSize: 16)),
                  ),
                ),
              ],
            ),
          );
        });
      },
    );
  }
}
