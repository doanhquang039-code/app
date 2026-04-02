import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../models/transaction.dart' as model;

class StatsScreen extends StatefulWidget {
  const StatsScreen({super.key});

  @override
  State<StatsScreen> createState() => _StatsScreenState();
}

class _StatsScreenState extends State<StatsScreen> {
  final ApiService _api = ApiService();
  List<model.Transaction> _transactions = [];
  bool _isLoading = true;
  String _selectedPeriod = 'month';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final data = await _api.getTransactions();
      setState(() {
        _transactions = data.map((e) => model.Transaction.fromJson(e)).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  List<model.Transaction> get _filtered {
    final now = DateTime.now();
    return _transactions.where((t) {
      if (_selectedPeriod == 'week') return t.date.isAfter(now.subtract(const Duration(days: 7)));
      if (_selectedPeriod == 'month') return t.date.month == now.month && t.date.year == now.year;
      return t.date.year == now.year;
    }).toList();
  }

  Map<String, double> get _expenseByCategory {
    final map = <String, double>{};
    for (final t in _filtered.where((t) => t.type == 'expense')) {
      final cat = t.categoryName ?? 'Khác';
      map[cat] = (map[cat] ?? 0) + t.amount;
    }
    return map;
  }

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
    final totalIncome = _filtered.where((t) => t.type == 'income').fold(0.0, (s, t) => s + t.amount);
    final totalExpense = _filtered.where((t) => t.type == 'expense').fold(0.0, (s, t) => s + t.amount);
    final colors = [
      Colors.blue, Colors.red, Colors.green, Colors.orange,
      Colors.purple, Colors.teal, Colors.pink, Colors.amber,
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2E),
        title: const Text('Thống kê', style: TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Period selector
                  Row(
                    children: [
                      _periodButton('week', 'Tuần'),
                      const SizedBox(width: 8),
                      _periodButton('month', 'Tháng'),
                      const SizedBox(width: 8),
                      _periodButton('year', 'Năm'),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Income vs Expense bar
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF2A2A3E),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Thu - Chi', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 16),
                        SizedBox(
                          height: 200,
                          child: BarChart(
                            BarChartData(
                              alignment: BarChartAlignment.spaceAround,
                              maxY: [totalIncome, totalExpense].reduce((a, b) => a > b ? a : b) * 1.2,
                              barGroups: [
                                BarChartGroupData(x: 0, barRods: [
                                  BarChartRodData(toY: totalIncome, color: Colors.green, width: 40, borderRadius: BorderRadius.circular(6)),
                                ]),
                                BarChartGroupData(x: 1, barRods: [
                                  BarChartRodData(toY: totalExpense, color: Colors.red, width: 40, borderRadius: BorderRadius.circular(6)),
                                ]),
                              ],
                              titlesData: FlTitlesData(
                                bottomTitles: AxisTitles(sideTitles: SideTitles(
                                  showTitles: true,
                                  getTitlesWidget: (val, _) => Text(
                                    val == 0 ? 'Thu' : 'Chi',
                                    style: const TextStyle(color: Colors.grey),
                                  ),
                                )),
                                leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                              ),
                              gridData: const FlGridData(show: false),
                              borderData: FlBorderData(show: false),
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _statChip('Thu', formatter.format(totalIncome), Colors.green),
                            _statChip('Chi', formatter.format(totalExpense), Colors.red),
                            _statChip('Dư', formatter.format(totalIncome - totalExpense),
                                totalIncome >= totalExpense ? Colors.blue : Colors.orange),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Pie chart by category
                  if (_expenseByCategory.isNotEmpty) ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF2A2A3E),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Chi tiêu theo danh mục', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 16),
                          SizedBox(
                            height: 200,
                            child: PieChart(
                              PieChartData(
                                sections: _expenseByCategory.entries.toList().asMap().entries.map((e) {
                                  final idx = e.key;
                                  final entry = e.value;
                                  final total = _expenseByCategory.values.fold(0.0, (a, b) => a + b);
                                  return PieChartSectionData(
                                    value: entry.value,
                                    title: '${(entry.value / total * 100).toStringAsFixed(0)}%',
                                    color: colors[idx % colors.length],
                                    radius: 80,
                                    titleStyle: const TextStyle(color: Colors.white, fontSize: 12),
                                  );
                                }).toList(),
                                sectionsSpace: 2,
                              ),
                            ),
                          ),
                          const SizedBox(height: 12),
                          // Legend
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: _expenseByCategory.entries.toList().asMap().entries.map((e) {
                              return Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(width: 12, height: 12, color: colors[e.key % colors.length]),
                                  const SizedBox(width: 4),
                                  Text(e.value.key, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                                ],
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
    );
  }

  Widget _periodButton(String period, String label) {
    final isSelected = _selectedPeriod == period;
    return GestureDetector(
      onTap: () => setState(() => _selectedPeriod = period),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF6C63FF) : const Color(0xFF2A2A3E),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(label, style: TextStyle(color: isSelected ? Colors.white : Colors.grey)),
      ),
    );
  }

  Widget _statChip(String label, String value, Color color) {
    return Column(
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
        Text(value, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13)),
      ],
    );
  }
}