import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../providers/transaction_provider.dart';
import '../providers/wallet_provider.dart';
import '../models/transaction.dart' as model;
import 'stats_screen.dart';
import 'wallet_screen.dart';
import 'budget_screen.dart';
import 'profile_screen.dart';
import 'add_transaction_screen.dart';
import 'notifications_screen.dart';
import 'savings_screen.dart';
import 'bill_reminders_screen.dart';
import 'bank_accounts_screen.dart';
import 'credit_cards_screen.dart';
import 'recurring_transactions_screen.dart';
import 'analytics_screen.dart';
import 'shared_expenses_screen.dart';
import 'multi_currency_screen.dart';
import 'financial_reports_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  int _unreadNotifCount = 0; // ignore: prefer_final_fields

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TransactionProvider>().loadTransactions();
      context.read<WalletProvider>().loadWallets();
      _loadUnreadCount();
    });
  }

  Future<void> _loadUnreadCount() async {
    try {
      // Could call API here for unread count badge
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      _buildHomeTab(),
      const WalletScreen(),
      const BudgetScreen(),
      const StatsScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      body: screens[_currentIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF2A2A3E),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 15)],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (i) => setState(() => _currentIndex = i),
          backgroundColor: const Color(0xFF2A2A3E),
          selectedItemColor: const Color(0xFF6C63FF),
          unselectedItemColor: Colors.grey,
          type: BottomNavigationBarType.fixed,
          selectedFontSize: 11,
          unselectedFontSize: 11,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: 'Trang chủ'),
            BottomNavigationBarItem(icon: Icon(Icons.account_balance_wallet_rounded), label: 'Ví'),
            BottomNavigationBarItem(icon: Icon(Icons.pie_chart_rounded), label: 'Ngân sách'),
            BottomNavigationBarItem(icon: Icon(Icons.bar_chart_rounded), label: 'Thống kê'),
            BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: 'Hồ sơ'),
          ],
        ),
      ),
      floatingActionButton: _currentIndex == 0
          ? FloatingActionButton(
              backgroundColor: const Color(0xFF6C63FF),
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const AddTransactionScreen()),
              ).then((_) => context.read<TransactionProvider>().loadTransactions()),
              child: const Icon(Icons.add, color: Colors.white),
            )
          : null,
    );
  }

  Widget _buildHomeTab() {
    return Consumer2<TransactionProvider, WalletProvider>(
      builder: (context, txProvider, walletProvider, _) {
        final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
        final compactFormatter = NumberFormat.compactCurrency(locale: 'vi_VN', symbol: 'đ');

        return Scaffold(
          backgroundColor: const Color(0xFF1E1E2E),
          appBar: AppBar(
            backgroundColor: const Color(0xFF1E1E2E),
            elevation: 0,
            title: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('Xin chào! 👋', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                Text('Quản lý chi tiêu', style: TextStyle(color: Colors.grey, fontSize: 12)),
              ],
            ),
            actions: [
              Stack(
                children: [
                  IconButton(
                    icon: const Icon(Icons.notifications_outlined, color: Colors.white),
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const NotificationsScreen()),
                    ),
                  ),
                  if (_unreadNotifCount > 0)
                    Positioned(
                      right: 8,
                      top: 8,
                      child: Container(
                        width: 16,
                        height: 16,
                        decoration: const BoxDecoration(
                          color: Color(0xFFEB5757),
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text(
                            '$_unreadNotifCount',
                            style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ),
          body: txProvider.isLoading
              ? const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF)))
              : RefreshIndicator(
                  onRefresh: () async {
                    await txProvider.loadTransactions();
                    await walletProvider.loadWallets();
                  },
                  color: const Color(0xFF6C63FF),
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Main balance card
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF6C63FF), Color(0xFF9C63FF)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(24),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF6C63FF).withOpacity(0.4),
                                blurRadius: 20,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: Column(
                            children: [
                              const Text('Số dư tổng', style: TextStyle(color: Colors.white70, fontSize: 13)),
                              const SizedBox(height: 8),
                              Text(
                                formatter.format(txProvider.balance),
                                style: const TextStyle(color: Colors.white, fontSize: 34, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 20),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceAround,
                                children: [
                                  _balanceItem('Thu nhập', txProvider.totalIncome, Icons.arrow_upward, Colors.greenAccent, compactFormatter),
                                  Container(width: 1, height: 40, color: Colors.white30),
                                  _balanceItem('Chi tiêu', txProvider.totalExpense, Icons.arrow_downward, Colors.redAccent, compactFormatter),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Quick actions - Row 1
                        const Text('Tính năng', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _quickAction('Ví', Icons.account_balance_wallet_rounded, const Color(0xFF6C63FF), () {
                              setState(() => _currentIndex = 1);
                            }),
                            _quickAction('Ngân sách', Icons.pie_chart_rounded, const Color(0xFF11998E), () {
                              setState(() => _currentIndex = 2);
                            }),
                            _quickAction('Tiết kiệm', Icons.savings_rounded, const Color(0xFF8E2DE2), () {
                              Navigator.push(context, MaterialPageRoute(builder: (_) => const SavingsScreen()));
                            }),
                            _quickAction('Hóa đơn', Icons.receipt_long_rounded, const Color(0xFFF97316), () {
                              Navigator.push(context, MaterialPageRoute(builder: (_) => const BillRemindersScreen()));
                            }),
                          ],
                        ),
                        const SizedBox(height: 14),
                        // Quick actions - Row 2 (NEW)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _quickAction('Ngân hàng', Icons.account_balance_rounded, const Color(0xFF2C5364), () {
                              Navigator.push(context, MaterialPageRoute(builder: (_) => const BankAccountsScreen()));
                            }),
                            _quickAction('Thẻ tín dụng', Icons.credit_card_rounded, const Color(0xFFFD746C), () {
                              Navigator.push(context, MaterialPageRoute(builder: (_) => const CreditCardsScreen()));
                            }),
                            _quickAction('Định kỳ', Icons.repeat_rounded, const Color(0xFF1A2980), () {
                              Navigator.push(context, MaterialPageRoute(builder: (_) => const RecurringTransactionsScreen()));
                            }),
                            _quickAction('Phân tích', Icons.auto_graph_rounded, const Color(0xFF11998E), () {
                              Navigator.push(context, MaterialPageRoute(builder: (_) => const AnalyticsScreen()));
                            }),
                          ],
                        ),
                        const SizedBox(height: 14),
                        // Quick actions - Row 3 (NEW)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _quickAction('Chia tiền', Icons.group_rounded, const Color(0xFF8E2DE2), () {
                              Navigator.push(context, MaterialPageRoute(builder: (_) => const SharedExpensesScreen()));
                            }),
                            _quickAction('Tiền tệ', Icons.currency_exchange_rounded, const Color(0xFF1A2980), () {
                              Navigator.push(context, MaterialPageRoute(builder: (_) => const MultiCurrencyScreen()));
                            }),
                            _quickAction('Báo cáo', Icons.assessment_rounded, const Color(0xFFEB5757), () {
                              Navigator.push(context, MaterialPageRoute(builder: (_) => const FinancialReportsScreen()));
                            }),
                            // Empty spacer to keep alignment
                            const SizedBox(width: 60),
                          ],
                        ),
                        const SizedBox(height: 24),

                        // Wallets scroll
                        if (walletProvider.wallets.isNotEmpty) ...[
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Ví của tôi', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                              TextButton(
                                onPressed: () => setState(() => _currentIndex = 1),
                                child: const Text('Xem tất cả', style: TextStyle(color: Color(0xFF6C63FF), fontSize: 13)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          SizedBox(
                            height: 90,
                            child: ListView.builder(
                              scrollDirection: Axis.horizontal,
                              itemCount: walletProvider.wallets.length,
                              itemBuilder: (_, i) {
                                final w = walletProvider.wallets[i];
                                final colors = [
                                  [const Color(0xFF6C63FF), const Color(0xFF9C88FF)],
                                  [const Color(0xFF11998E), const Color(0xFF38EF7D)],
                                  [const Color(0xFFEB5757), const Color(0xFFF9A825)],
                                  [const Color(0xFF2980B9), const Color(0xFF6DD5FA)],
                                ];
                                final colorPair = colors[i % colors.length];
                                return Container(
                                  width: 160,
                                  margin: const EdgeInsets.only(right: 12),
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(colors: colorPair),
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(w.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                                      Text(
                                        compactFormatter.format(w.balance),
                                        style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
                          ),
                          const SizedBox(height: 20),
                        ],

                        // Recent transactions
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Giao dịch gần đây', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                            TextButton(
                              onPressed: () => Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const AddTransactionScreen()),
                              ),
                              child: const Text('+ Thêm', style: TextStyle(color: Color(0xFF6C63FF), fontSize: 13)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        if (txProvider.transactions.isEmpty)
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 30),
                            child: Center(
                              child: Column(
                                children: [
                                  Icon(Icons.receipt_long_outlined, size: 50, color: Colors.white.withOpacity(0.2)),
                                  const SizedBox(height: 10),
                                  const Text('Chưa có giao dịch nào', style: TextStyle(color: Colors.grey)),
                                ],
                              ),
                            ),
                          )
                        else
                          ...txProvider.transactions.take(20).map((t) => _transactionItem(t, formatter)),
                      ],
                    ),
                  ),
                ),
        );
      },
    );
  }

  Widget _balanceItem(String label, double amount, IconData icon, Color color, NumberFormat formatter) {
    return Column(
      children: [
        Row(
          children: [
            Icon(icon, color: color, size: 14),
            const SizedBox(width: 4),
            Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12)),
          ],
        ),
        const SizedBox(height: 4),
        Text(formatter.format(amount), style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 14)),
      ],
    );
  }

  Widget _quickAction(String label, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: color.withOpacity(0.3)),
            ),
            child: Icon(icon, color: color, size: 26),
          ),
          const SizedBox(height: 6),
          Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11)),
        ],
      ),
    );
  }

  Widget _transactionItem(model.Transaction t, NumberFormat formatter) {
    final isIncome = t.type == 'income';
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3E),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: isIncome ? Colors.green.withOpacity(0.15) : Colors.red.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              isIncome ? Icons.arrow_upward_rounded : Icons.arrow_downward_rounded,
              color: isIncome ? Colors.greenAccent : Colors.redAccent,
              size: 18,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  t.categoryName ?? 'Không rõ',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14),
                ),
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
                style: TextStyle(
                  color: isIncome ? Colors.greenAccent : Colors.redAccent,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
              Text(DateFormat('dd/MM').format(t.date), style: const TextStyle(color: Colors.grey, fontSize: 12)),
            ],
          ),
        ],
      ),
    );
  }
}