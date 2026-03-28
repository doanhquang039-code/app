import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../models/transaction.dart' as model;

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
                    // Summary cards
                    Row(
                      children: [
                        _summaryCard('Tổng thu', _totalIncome, Colors.green, Icons.arrow_upward),
                        const SizedBox(width: 12),
                        _summaryCard('Tổng chi', _totalExpense, Colors.red, Icons.arrow_downward),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _balanceCard(formatter.format(_totalIncome - _totalExpense)),
                    const SizedBox(height: 20),
                    // Transaction list
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Giao dịch gần đây', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                        TextButton(
                          onPressed: () => Navigator.pushNamed(context, '/add-transaction').then((_) => _loadData()),
                          child: const Text('+ Thêm', style: TextStyle(color: Color(0xFF6C63FF))),
                        ),
                      ],
                    ),
                    ..._transactions.take(20).map((t) => _transactionItem(t, formatter)),
                  ],
                ),
              ),
            ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFF6C63FF),
        onPressed: () => Navigator.pushNamed(context, '/add-transaction').then((_) => _loadData()),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _summaryCard(String title, double amount, Color color, IconData icon) {
    final formatter = NumberFormat.compactCurrency(locale: 'vi_VN', symbol: 'đ');
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF2A2A3E),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(height: 8),
            Text(title, style: const TextStyle(color: Colors.grey, fontSize: 12)),
            Text(formatter.format(amount), style: TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _balanceCard(String balance) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF6C63FF), Color(0xFF9C63FF)]),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          const Text('Số dư', style: TextStyle(color: Colors.white70, fontSize: 14)),
          Text(balance, style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
        ],
      ),
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
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isIncome ? Colors.green.withOpacity(0.2) : Colors.red.withOpacity(0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(isIncome ? Icons.arrow_upward : Icons.arrow_downward, color: isIncome ? Colors.green : Colors.red, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(t.categoryName ?? 'Không rõ', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500)),
                Text(t.note ?? '', style: const TextStyle(color: Colors.grey, fontSize: 12)),
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