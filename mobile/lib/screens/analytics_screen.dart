import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  final ApiService _api = ApiService();
  bool _isLoading = true;
  Map<String, dynamic> _insights = {};
  String _selectedPeriod = 'monthly';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final insights = await _api.getFinancialInsights();
      _insights = insights;
    } catch (_) {
      _insights = {};
    }
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2E),
        title: const Text('Phân tích tài chính', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
                          _periodTab('Tuần', 'weekly'),
                          _periodTab('Tháng', 'monthly'),
                          _periodTab('Năm', 'yearly'),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Key metrics
                    Row(
                      children: [
                        Expanded(child: _metricCard(
                          'Thu nhập',
                          formatter.format(_insights['totalIncome'] ?? 0),
                          Icons.trending_up,
                          const Color(0xFF11998E),
                          '+${_insights['incomeGrowth'] ?? 0}%',
                        )),
                        const SizedBox(width: 12),
                        Expanded(child: _metricCard(
                          'Chi tiêu',
                          formatter.format(_insights['totalExpense'] ?? 0),
                          Icons.trending_down,
                          const Color(0xFFEB5757),
                          '${_insights['expenseGrowth'] ?? 0}%',
                        )),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(child: _metricCard(
                          'Tiết kiệm',
                          formatter.format(_insights['savings'] ?? 0),
                          Icons.savings,
                          const Color(0xFF6C63FF),
                          '${_insights['savingsRate'] ?? 0}%',
                        )),
                        const SizedBox(width: 12),
                        Expanded(child: _metricCard(
                          'Giao dịch',
                          '${_insights['transactionCount'] ?? 0}',
                          Icons.receipt_long,
                          const Color(0xFFF97316),
                          '${_insights['avgPerDay'] ?? 0}/ngày',
                        )),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Spending insights
                    const Text('💡 Nhận xét', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    _insightCard(
                      Icons.lightbulb_outline,
                      'Chi tiêu trung bình',
                      'Trung bình bạn chi ${formatter.format(_insights['avgExpensePerDay'] ?? 0)}/ngày trong kỳ này.',
                      const Color(0xFF6C63FF),
                    ),
                    _insightCard(
                      Icons.category,
                      'Danh mục chi nhiều nhất',
                      _insights['topCategory'] ?? 'Chưa có dữ liệu phân tích',
                      const Color(0xFFF97316),
                    ),
                    _insightCard(
                      Icons.auto_graph,
                      'Xu hướng',
                      _insights['trend'] ?? 'Chi tiêu của bạn đang ổn định',
                      const Color(0xFF11998E),
                    ),
                    const SizedBox(height: 24),

                    // Top spending categories
                    const Text('📊 Top chi tiêu theo danh mục', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    if (_insights['categoryBreakdown'] != null)
                      ...(_insights['categoryBreakdown'] as List).take(5).map((cat) {
                        final total = _insights['totalExpense'] ?? 1;
                        final amount = double.tryParse(cat['total']?.toString() ?? '0') ?? 0;
                        final percent = total > 0 ? amount / total : 0.0;
                        return _categorySpendingBar(
                          cat['categoryName'] ?? 'Khác',
                          amount,
                          percent,
                          formatter,
                        );
                      })
                    else
                      ..._defaultCategoryBars(formatter),

                    const SizedBox(height: 24),

                    // Financial health score
                    _healthScoreCard(),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _periodTab(String label, String value) {
    final isSelected = _selectedPeriod == value;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() => _selectedPeriod = value);
          _loadData();
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF6C63FF) : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.grey,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                fontSize: 13,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _metricCard(String title, String value, IconData icon, Color color, String change) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, color: color, size: 22),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(change, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(title, style: const TextStyle(color: Colors.grey, fontSize: 12)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
            overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }

  Widget _insightCard(IconData icon, String title, String description, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3E),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
                const SizedBox(height: 2),
                Text(description, style: const TextStyle(color: Colors.grey, fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _defaultCategoryBars(NumberFormat formatter) {
    return [
      _categorySpendingBar('Ăn uống', 0, 0, formatter),
      _categorySpendingBar('Di chuyển', 0, 0, formatter),
      _categorySpendingBar('Mua sắm', 0, 0, formatter),
    ];
  }

  Widget _categorySpendingBar(String name, double amount, double percent, NumberFormat formatter) {
    final colors = [
      const Color(0xFF6C63FF),
      const Color(0xFF11998E),
      const Color(0xFFF97316),
      const Color(0xFFEB5757),
      const Color(0xFF8E2DE2),
    ];
    final color = colors[name.hashCode % colors.length];

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3E),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(name, style: const TextStyle(color: Colors.white, fontSize: 13)),
              Text(formatter.format(amount), style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13)),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: percent.clamp(0.0, 1.0),
              backgroundColor: Colors.white.withOpacity(0.1),
              valueColor: AlwaysStoppedAnimation<Color>(color),
              minHeight: 6,
            ),
          ),
          const SizedBox(height: 4),
          Align(
            alignment: Alignment.centerRight,
            child: Text('${(percent * 100).toStringAsFixed(1)}%', style: TextStyle(color: color, fontSize: 11)),
          ),
        ],
      ),
    );
  }

  Widget _healthScoreCard() {
    final score = _insights['healthScore'] ?? 70;
    Color scoreColor;
    String scoreLabel;
    if (score >= 80) {
      scoreColor = Colors.greenAccent;
      scoreLabel = 'Tốt';
    } else if (score >= 60) {
      scoreColor = Colors.orangeAccent;
      scoreLabel = 'Khá';
    } else {
      scoreColor = Colors.redAccent;
      scoreLabel = 'Cần cải thiện';
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [const Color(0xFF2A2A3E), scoreColor.withOpacity(0.15)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: scoreColor.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          const Text('Sức khỏe tài chính', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: 100,
                height: 100,
                child: CircularProgressIndicator(
                  value: score / 100,
                  strokeWidth: 8,
                  backgroundColor: Colors.white.withOpacity(0.1),
                  valueColor: AlwaysStoppedAnimation<Color>(scoreColor),
                ),
              ),
              Column(
                children: [
                  Text('$score', style: TextStyle(color: scoreColor, fontSize: 28, fontWeight: FontWeight.bold)),
                  Text(scoreLabel, style: TextStyle(color: scoreColor, fontSize: 12)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Dựa trên tỷ lệ tiết kiệm, mức chi tiêu và kiểm soát ngân sách của bạn.',
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.grey, fontSize: 12),
          ),
        ],
      ),
    );
  }
}
