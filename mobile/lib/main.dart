import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/wallet_provider.dart';
import 'providers/budget_provider.dart';
import 'providers/transaction_provider.dart';
import 'providers/net_worth_provider.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/home_screen.dart';
import 'screens/add_transaction_screen.dart';
import 'screens/stats_screen.dart';
import 'screens/category_screen.dart';
import 'screens/report_screen.dart';
import 'screens/wallet_screen.dart';
import 'screens/budget_screen.dart';
import 'screens/savings_screen.dart';
import 'screens/bill_reminders_screen.dart';
import 'screens/notifications_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/bank_accounts_screen.dart';
import 'screens/credit_cards_screen.dart';
import 'screens/recurring_transactions_screen.dart';
import 'screens/analytics_screen.dart';
import 'screens/shared_expenses_screen.dart';
import 'screens/multi_currency_screen.dart';
import 'screens/financial_reports_screen.dart';
import 'screens/net_worth_screen.dart';
import 'screens/bulk_import_screen.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => WalletProvider()),
        ChangeNotifierProvider(create: (_) => BudgetProvider()),
        ChangeNotifierProvider(create: (_) => TransactionProvider()),
        ChangeNotifierProvider(create: (_) => NetWorthProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Quản lý Chi tiêu',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        colorScheme: ColorScheme.dark(
          primary: const Color(0xFF6C63FF),
          secondary: const Color(0xFF9C88FF),
          surface: const Color(0xFF2A2A3E),
          background: const Color(0xFF1E1E2E),
        ),
        scaffoldBackgroundColor: const Color(0xFF1E1E2E),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF1E1E2E),
          elevation: 0,
        ),
        datePickerTheme: DatePickerThemeData(
          backgroundColor: const Color(0xFF2A2A3E),
          headerBackgroundColor: const Color(0xFF6C63FF),
          dayStyle: const TextStyle(color: Colors.white),
          weekdayStyle: const TextStyle(color: Colors.grey),
          yearStyle: const TextStyle(color: Colors.white),
          dayOverlayColor: MaterialStateProperty.all(
            const Color(0xFF6C63FF).withOpacity(0.2),
          ),
          todayBackgroundColor: MaterialStateProperty.all(
            const Color(0xFF6C63FF).withOpacity(0.3),
          ),
          dayBackgroundColor: MaterialStateProperty.resolveWith((states) {
            if (states.contains(MaterialState.selected)) return const Color(0xFF6C63FF);
            return null;
          }),
        ),
      ),
      initialRoute: '/login',
      routes: {
        '/login': (_) => const LoginScreen(),
        '/register': (_) => const RegisterScreen(),
        '/home': (_) => const HomeScreen(),
        '/add-transaction': (_) => const AddTransactionScreen(),
        '/stats': (_) => const StatsScreen(),
        '/categories': (_) => const CategoryScreen(),
        '/reports': (_) => const ReportScreen(),
        '/wallets': (_) => const WalletScreen(),
        '/budgets': (_) => const BudgetScreen(),
        '/savings': (_) => const SavingsScreen(),
        '/bills': (_) => const BillRemindersScreen(),
        '/notifications': (_) => const NotificationsScreen(),
        '/profile': (_) => const ProfileScreen(),
        '/bank-accounts': (_) => const BankAccountsScreen(),
        '/credit-cards': (_) => const CreditCardsScreen(),
        '/recurring': (_) => const RecurringTransactionsScreen(),
        '/analytics': (_) => const AnalyticsScreen(),
        '/shared-expenses': (_) => const SharedExpensesScreen(),
        '/multi-currency': (_) => const MultiCurrencyScreen(),
        '/financial-reports': (_) => const FinancialReportsScreen(),
        '/net-worth': (_) => const NetWorthScreen(),
        '/bulk-import': (_) => const BulkImportScreen(),
      },
    );
  }
}