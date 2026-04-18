import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';

class FinancialReportsScreen extends StatefulWidget {
  const FinancialReportsScreen({super.key});

  @override
  State<FinancialReportsScreen> createState() => _FinancialReportsScreenState();
}

class _FinancialReportsScreenState extends State<FinancialReportsScreen> {
  final ApiService _api = ApiService();
  List<dynamic> _reports = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadReports();
  }

  Future<void> _loadReports() async {
    setState(() => _isLoading = true);
    try {
      _reports = await _api.getFinancialReports();
    } catch (_) {}
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2E),
        title: const Text('Báo cáo tài chính', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF)))
          : RefreshIndicator(
              onRefresh: _loadReports,
              color: const Color(0xFF6C63FF),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Quick generate buttons
                    const Text('Tạo báo cáo nhanh', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(child: _quickReportButton('Tuần này', Icons.calendar_view_week, const Color(0xFF6C63FF), 'weekly')),
                        const SizedBox(width: 10),
                        Expanded(child: _quickReportButton('Tháng này', Icons.calendar_month, const Color(0xFF11998E), 'monthly')),
                        const SizedBox(width: 10),
                        Expanded(child: _quickReportButton('Năm nay', Icons.calendar_today, const Color(0xFFF97316), 'yearly')),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Report types
                    const Text('Loại báo cáo', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    _reportTypeCard(
                      'Tổng hợp thu chi',
                      'Báo cáo tổng quan thu nhập và chi tiêu',
                      Icons.assessment,
                      const Color(0xFF6C63FF),
                      'income_expense',
                    ),
                    _reportTypeCard(
                      'Phân tích chi tiêu theo danh mục',
                      'Chi tiết chi tiêu theo từng danh mục',
                      Icons.donut_large,
                      const Color(0xFF11998E),
                      'category_breakdown',
                    ),
                    _reportTypeCard(
                      'Xu hướng hàng tháng',
                      'Biến động thu chi qua các tháng',
                      Icons.show_chart,
                      const Color(0xFFF97316),
                      'monthly_trend',
                    ),
                    _reportTypeCard(
                      'So sánh ngân sách',
                      'So sánh chi tiêu thực tế với ngân sách',
                      Icons.compare_arrows,
                      const Color(0xFFEB5757),
                      'budget_comparison',
                    ),
                    _reportTypeCard(
                      'Tiến trình tiết kiệm',
                      'Tiến độ các mục tiêu tiết kiệm',
                      Icons.savings,
                      const Color(0xFF8E2DE2),
                      'savings_progress',
                    ),
                    const SizedBox(height: 24),

                    // Past reports
                    const Text('Báo cáo đã tạo', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    if (_reports.isEmpty)
                      _emptyState()
                    else
                      ..._reports.map((r) => _pastReportCard(r)),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _quickReportButton(String label, IconData icon, Color color, String period) {
    return GestureDetector(
      onTap: () => _generateReport(period),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 18),
        decoration: BoxDecoration(
          color: color.withOpacity(0.15),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 26),
            const SizedBox(height: 8),
            Text(label, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }

  Widget _reportTypeCard(String title, String subtitle, IconData icon, Color color, String type) {
    return GestureDetector(
      onTap: () => _generateReport(type),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF2A2A3E),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withOpacity(0.15)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: Colors.grey, size: 22),
          ],
        ),
      ),
    );
  }

  Widget _emptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 40),
        child: Column(
          children: [
            Icon(Icons.description_outlined, size: 48, color: Colors.white.withOpacity(0.2)),
            const SizedBox(height: 12),
            const Text('Chưa có báo cáo nào', style: TextStyle(color: Colors.grey, fontSize: 14)),
            const SizedBox(height: 6),
            const Text('Chọn loại báo cáo ở trên để tạo', style: TextStyle(color: Colors.grey, fontSize: 12)),
          ],
        ),
      ),
    );
  }

  Widget _pastReportCard(dynamic report) {
    final date = report['createdAt'] != null
        ? DateFormat('dd/MM/yyyy HH:mm').format(DateTime.parse(report['createdAt']))
        : '';
    final type = report['reportType'] ?? 'Báo cáo';

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3E),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFF6C63FF).withOpacity(0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.description, color: Color(0xFF6C63FF), size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(type, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                Text(date, style: const TextStyle(color: Colors.grey, fontSize: 12)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: Colors.greenAccent.withOpacity(0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text('Hoàn thành', style: TextStyle(color: Colors.greenAccent, fontSize: 11)),
          ),
        ],
      ),
    );
  }

  void _generateReport(String type) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const AlertDialog(
        backgroundColor: Color(0xFF2A2A3E),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(color: Color(0xFF6C63FF)),
            SizedBox(height: 16),
            Text('Đang tạo báo cáo...', style: TextStyle(color: Colors.white)),
          ],
        ),
      ),
    );

    try {
      final now = DateTime.now();
      if (type == 'monthly' || type == 'weekly' || type == 'income_expense' || type == 'category_breakdown') {
        await _api.generateMonthlyReport(month: now.month, year: now.year);
      } else if (type == 'quarterly' || type == 'budget_comparison') {
        final quarter = ((now.month - 1) ~/ 3) + 1;
        await _api.generateQuarterlyReport(quarter: quarter, year: now.year);
      } else {
        await _api.generateYearlyReport(year: now.year);
      }
      if (mounted) Navigator.pop(context);
      _loadReports();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Báo cáo đã được tạo thành công! ✅'),
            backgroundColor: Color(0xFF11998E),
          ),
        );
      }
    } catch (_) {
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Tạo báo cáo thất bại!'), backgroundColor: Colors.red),
        );
      }
    }
  }
}
