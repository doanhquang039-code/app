import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../models/transaction.dart' as model;
import 'stats_screen.dart';
import 'category_screen.dart';
import 'report_screen.dart';
import 'add_transaction_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ApiService _api = ApiService();
  List<model.Transaction> _transactions = [];
  double _totalIncome = 0;
  double _totalExpense = 0;
  bool _isLoading = true;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final txData = await _api.getTransactions();
      final summary = await _api.getSummary();
      setState(() {
        _transactions = txData.map((e) => model.Transaction.fromJson(e)).toList();
        _totalIncome = double.parse(summary['totalIncome']?.toString() ?? '0');
        _totalExpense = double.parse(summary['totalExpense']?.toString() ?? '0');
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      _buildHomeTab(),
      const StatsScreen(),
      const CategoryScreen(),
      const ReportScreen(),
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      body: screens[_currentIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF2A2A3E),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 10)],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (i) => setState(() => _currentIndex = i),
          backgroundColor: const Color(0xFF2A2A3E),
          selectedItemColor: const Color(0xFF6C63FF),
          unselectedItemColor: Colors.grey,
          type: BottomNavigationBarType.fixed,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Trang chủ'),
            BottomNavigationBarItem(icon: Icon(Icons.bar_chart), label: 'Thống kê'),
            BottomNavigationBarItem(icon: Icon(Icons.category), label: 'Danh mục'),
            BottomNavigationBarItem(icon: Icon(Icons.download), label: 'Báo cáo'),
          ],
        ),
      ),
      floatingActionButton: _currentIndex == 0
          ? FloatingActionButton(
              backgroundColor: const Color(0xFF6C63FF),
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const AddTransactionScreen()),
              ).then((_) => _loadData()),
              child: const Icon(Icons.add, color: Colors.white),
            )
          : null,
    );
  }

  Widget _buildHomeTab() {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2E),
        title: const Text('Chi tiêu của tôi', style: TextStyle(color: Colors.white)),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white),
            onPressed: () async {
              await context.read<AuthProvider>().logout();
              if (mounted) Navigator.pushReplacementNamed(context, '/login');
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    // Balance card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF6C63FF), Color(0xFF9C63FF)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(color: const Color(0xFF6C63FF).withOpacity(0.4), blurRadius: 15, offset: const Offset(0, 5)),
                        ],
                      ),
                      child: Column(
                        children: [
                          const Text('Số dư hiện tại', style: TextStyle(color: Colors.white70, fontSize: 14)),
                          const SizedBox(height: 8),
                          Text(
                            formatter.format(_totalIncome - _totalExpense),
                            style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              _balanceItem('Thu nhập', _totalIncome, Icons.arrow_upward, Colors.greenAccent),
                              Container(width: 1, height: 40, color: Colors.white30),
                              _balanceItem('Chi tiêu', _totalExpense, Icons.arrow_downward, Colors.redAccent),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Recent transactions
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Giao dịch gần đây', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                        TextButton(
                          onPressed: () => Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const AddTransactionScreen()),
                          ).then((_) => _loadData()),
                          child: const Text('+ Thêm', style: TextStyle(color: Color(0xFF6C63FF))),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ..._transactions.take(20).map((t) => _transactionItem(t, formatter)),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _balanceItem(String label, double amount, IconData icon, Color color) {
    final formatter = NumberFormat.compactCurrency(locale: 'vi_VN', symbol: 'đ');
    return Column(
      children: [
        Row(
          children: [
            Icon(icon, color: color, size: 16),
            const SizedBox(width: 4),
            Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12)),
          ],
        ),
        const SizedBox(height: 4),
        Text(formatter.format(amount), style: TextStyle(color: color, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _transactionItem(model.Transaction t, NumberFormat formatter) {
    final isIncome = t.type == 'income';
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3E),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: isIncome ? Colors.green.withOpacity(0.2) : Colors.red.withOpacity(0.2),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              isIncome ? Icons.arrow_upward : Icons.arrow_downward,
              color: isIncome ? Colors.green : Colors.red,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(t.categoryName ?? 'Không rõ', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500)),
                if (t.note != null && t.note!.isNotEmpty)
                  Text(t.note!, style: const TextStyle(color: Colors.grey, fontSize: 12)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${isIncome ? '+' : '-'}${formatter.format(t.amount)}',
                style: TextStyle(color: isIncome ? Colors.green : Colors.red, fontWeight: FontWeight.bold),
              ),
              Text(DateFormat('dd/MM').format(t.date), style: const TextStyle(color: Colors.grey, fontSize: 12)),
            ],
          ),
        ],
      ),
    );
  }
}