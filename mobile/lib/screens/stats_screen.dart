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
  Map<String, dynamic> _dashboardData = {};
  bool _isLoading = true;
  String _selectedPeriod = 'month';
  int _touchedIndex = -1;

  static const _colors = [
    Color(0xFF6C63FF), Color(0xFFEB5757), Color(0xFF11998E), Color(0xFFF97316),
    Color(0xFF8E2DE2), Color(0xFF2C5364), Color(0xFF1A2980), Color(0xFFF9A825),
  ];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final results = await Future.wait([
        _api.getTransactions(),
        _api.getDashboard(),
      ]);
      setState(() {
        _transactions = (results[0] as List).map((e) => model.Transaction.fromJson(e)).toList();
        _dashboardData = results[1] as Map<String, dynamic>;
        _isLoading = false;
      });
    } catch (_) {
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
    final sorted = Map.fromEntries(map.entries.toList()..sort((a, b) => b.value.compareTo(a.value)));
    return sorted;
  }

  // Group transactions by day for line chart
  List<FlSpot> _getDailySpots(String type) {
    final now = DateTime.now();
    final days = _selectedPeriod == 'week' ? 7 : (_selectedPeriod == 'month' ? 30 : 12);
    final spots = <FlSpot>[];

    if (_selectedPeriod == 'year') {
      // Group by month
      for (int m = 1; m <= 12; m++) {
        final total = _transactions
            .where((t) => t.type == type && t.date.year == now.year && t.date.month == m)
            .fold(0.0, (s, t) => s + t.amount);
        spots.add(FlSpot(m.toDouble(), total));
      }
    } else {
      for (int i = days - 1; i >= 0; i--) {
        final day = now.subtract(Duration(days: i));
        final total = _transactions
            .where((t) => t.type == type &&
                t.date.day == day.day &&
                t.date.month == day.month &&
                t.date.year == day.year)
            .fold(0.0, (s, t) => s + t.amount);
        spots.add(FlSpot((days - 1 - i).toDouble(), total));
      }
    }
    return spots;
  }

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
    final compactFmt = NumberFormat.compactCurrency(locale: 'vi_VN', symbol: 'đ');
    final totalIncome = _filtered.where((t) => t.type == 'income').fold(0.0, (s, t) => s + t.amount);
    final totalExpense = _filtered.where((t) => t.type == 'expense').fold(0.0, (s, t) => s + t.amount);
    final savings = totalIncome - totalExpense;
    final savingsRate = totalIncome > 0 ? (savings / totalIncome * 100) : 0.0;

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2E),
        title: const Text('Thống kê', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
                    // Period selector
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF2A2A3E),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Row(
                        children: [
                          _periodTab('week', 'Tuần'),
                          _periodTab('month', 'Tháng'),
                          _periodTab('year', 'Năm'),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Summary cards
                    Row(
                      children: [
                        Expanded(child: _summaryCard('Thu nhập', totalIncome, Colors.greenAccent, Icons.arrow_upward, compactFmt)),
                        const SizedBox(width: 10),
                        Expanded(child: _summaryCard('Chi tiêu', totalExpense, Colors.redAccent, Icons.arrow_downward, compactFmt)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(child: _summaryCard('Tiết kiệm', savings,
                            savings >= 0 ? Colors.blueAccent : Colors.orangeAccent,
                            Icons.savings, compactFmt)),
                        const SizedBox(width: 10),
                        Expanded(child: _summaryCard('Tỷ lệ TK', savingsRate,
                            savingsRate >= 20 ? Colors.greenAccent : Colors.orangeAccent,
                            Icons.percent, null, isPercent: true)),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Line chart - trend
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: const Color(0xFF2A2A3E),
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Xu hướng thu - chi', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                          const SizedBox(height: 16),
                          SizedBox(
                            height: 180,
                            child: LineChart(
                              LineChartData(
                                gridData: FlGridData(
                                  show: true,
                                  drawVerticalLine: false,
                                  getDrawingHorizontalLine: (_) => FlLine(color: Colors.white.withOpacity(0.05), strokeWidth: 1),
                                ),
                                titlesData: FlTitlesData(
                                  leftTitles: AxisTitles(
                                    sideTitles: SideTitles(
                                      showTitles: true,
                                      reservedSize: 40,
                                      getTitlesWidget: (v, _) => Text(
                                        NumberFormat.compact(locale: 'vi').format(v),
                                        style: const TextStyle(color: Colors.grey, fontSize: 9),
                                      ),
                                    ),
                                  ),
                                  bottomTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                ),
                                borderData: FlBorderData(show: false),
                                lineBarsData: [
                                  LineChartBarData(
                                    spots: _getDailySpots('income'),
                                    isCurved: true,
                                    color: Colors.greenAccent,
                                    barWidth: 2.5,
                                    dotData: const FlDotData(show: false),
                                    belowBarData: BarAreaData(show: true, color: Colors.greenAccent.withOpacity(0.08)),
                                  ),
                                  LineChartBarData(
                                    spots: _getDailySpots('expense'),
                                    isCurved: true,
                                    color: Colors.redAccent,
                                    barWidth: 2.5,
                                    dotData: const FlDotData(show: false),
                                    belowBarData: BarAreaData(show: true, color: Colors.redAccent.withOpacity(0.08)),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 10),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              _legend('Thu nhập', Colors.greenAccent),
                              const SizedBox(width: 20),
                              _legend('Chi tiêu', Colors.redAccent),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Bar chart - income vs expense
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: const Color(0xFF2A2A3E),
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('So sánh thu - chi', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                          const SizedBox(height: 16),
                          SizedBox(
                            height: 160,
                            child: BarChart(
                              BarChartData(
                                alignment: BarChartAlignment.spaceAround,
                                maxY: [totalIncome, totalExpense, 1.0].reduce((a, b) => a > b ? a : b) * 1.2,
                                barGroups: [
                                  BarChartGroupData(x: 0, barRods: [
                                    BarChartRodData(toY: totalIncome, color: Colors.greenAccent, width: 50,
                                        borderRadius: const BorderRadius.vertical(top: Radius.circular(8))),
                                  ]),
                                  BarChartGroupData(x: 1, barRods: [
                                    BarChartRodData(toY: totalExpense, color: Colors.redAccent, width: 50,
                                        borderRadius: const BorderRadius.vertical(top: Radius.circular(8))),
                                  ]),
                                ],
                                titlesData: FlTitlesData(
                                  bottomTitles: AxisTitles(sideTitles: SideTitles(
                                    showTitles: true,
                                    getTitlesWidget: (v, _) => Padding(
                                      padding: const EdgeInsets.only(top: 8),
                                      child: Text(v == 0 ? 'Thu nhập' : 'Chi tiêu',
                                          style: const TextStyle(color: Colors.grey, fontSize: 12)),
                                    ),
                                  )),
                                  leftTitles: AxisTitles(sideTitles: SideTitles(
                                    showTitles: true,
                                    reservedSize: 40,
                                    getTitlesWidget: (v, _) => Text(
                                      NumberFormat.compact(locale: 'vi').format(v),
                                      style: const TextStyle(color: Colors.grey, fontSize: 9),
                                    ),
                                  )),
                                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                ),
                                gridData: const FlGridData(show: false),
                                borderData: FlBorderData(show: false),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Pie chart by category
                    if (_expenseByCategory.isNotEmpty) ...[
                      Container(
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          color: const Color(0xFF2A2A3E),
                          borderRadius: BorderRadius.circular(18),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Chi tiêu theo danh mục', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                            const SizedBox(height: 16),
                            Row(
                              children: [
                                SizedBox(
                                  height: 180,
                                  width: 180,
                                  child: PieChart(
                                    PieChartData(
                                      pieTouchData: PieTouchData(
                                        touchCallback: (event, response) {
                                          setState(() {
                                            _touchedIndex = response?.touchedSection?.touchedSectionIndex ?? -1;
                                          });
                                        },
                                      ),
                                      sections: _expenseByCategory.entries.toList().asMap().entries.map((e) {
                                        final idx = e.key;
                                        final entry = e.value;
                                        final total = _expenseByCategory.values.fold(0.0, (a, b) => a + b);
                                        final isTouched = idx == _touchedIndex;
                                        return PieChartSectionData(
                                          value: entry.value,
                                          title: isTouched ? '${(entry.value / total * 100).toStringAsFixed(1)}%' : '',
                                          color: _colors[idx % _colors.length],
                                          radius: isTouched ? 90 : 75,
                                          titleStyle: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                                        );
                                      }).toList(),
                                      sectionsSpace: 2,
                                      centerSpaceRadius: 30,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: _expenseByCategory.entries.toList().asMap().entries.take(6).map((e) {
                                      final total = _expenseByCategory.values.fold(0.0, (a, b) => a + b);
                                      final pct = total > 0 ? e.value.value / total * 100 : 0;
                                      return Padding(
                                        padding: const EdgeInsets.only(bottom: 8),
                                        child: Row(
                                          children: [
                                            Container(width: 10, height: 10, decoration: BoxDecoration(
                                              color: _colors[e.key % _colors.length],
                                              borderRadius: BorderRadius.circular(2),
                                            )),
                                            const SizedBox(width: 6),
                                            Expanded(child: Text(e.value.key,
                                                style: const TextStyle(color: Colors.white70, fontSize: 12),
                                                overflow: TextOverflow.ellipsis)),
                                            Text('${pct.toStringAsFixed(0)}%',
                                                style: TextStyle(color: _colors[e.key % _colors.length], fontSize: 11, fontWeight: FontWeight.bold)),
                                          ],
                                        ),
                                      );
                                    }).toList(),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            // Top categories list
                            ..._expenseByCategory.entries.take(5).toList().asMap().entries.map((e) {
                              final total = _expenseByCategory.values.fold(0.0, (a, b) => a + b);
                              final pct = total > 0 ? e.value.value / total : 0.0;
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 8),
                                child: Column(
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(e.value.key, style: const TextStyle(color: Colors.white, fontSize: 13)),
                                        Text(formatter.format(e.value.value),
                                            style: TextStyle(color: _colors[e.key % _colors.length], fontWeight: FontWeight.bold, fontSize: 13)),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(4),
                                      child: LinearProgressIndicator(
                                        value: pct.clamp(0.0, 1.0),
                                        backgroundColor: Colors.white.withOpacity(0.08),
                                        valueColor: AlwaysStoppedAnimation<Color>(_colors[e.key % _colors.length]),
                                        minHeight: 5,
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 80),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _periodTab(String value, String label) {
    final isSelected = _selectedPeriod == value;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedPeriod = value),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF6C63FF) : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Center(
            child: Text(label, style: TextStyle(
              color: isSelected ? Colors.white : Colors.grey,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              fontSize: 13,
            )),
          ),
        ),
      ),
    );
  }

  Widget _summaryCard(String label, double value, Color color, IconData icon, NumberFormat? fmt, {bool isPercent = false}) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3E),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(color: Colors.grey, fontSize: 11)),
                Text(
                  isPercent ? '${value.toStringAsFixed(1)}%' : (fmt?.format(value) ?? value.toString()),
                  style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _legend(String label, Color color) {
    return Row(
      children: [
        Container(width: 20, height: 3, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2))),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
      ],
    );
  }
}
