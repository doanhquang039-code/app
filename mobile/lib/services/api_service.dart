import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:3000'; // Android emulator
  late Dio _dio;

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ));
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
    ));
  }

  // ─── AUTH ─────────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await _dio.post('/auth/login', data: {'email': email, 'password': password});
    return res.data;
  }

  Future<Map<String, dynamic>> register(String email, String password, {String? name}) async {
    final res = await _dio.post('/auth/register', data: {
      'email': email,
      'password': password,
      if (name != null) 'name': name,
    });
    return res.data;
  }

  // ─── PROFILE ──────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> getProfile() async {
    final res = await _dio.get('/users/profile');
    return res.data;
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final res = await _dio.put('/users/profile', data: data);
    return res.data;
  }

  // ─── DASHBOARD ────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> getDashboard() async {
    final res = await _dio.get('/dashboard');
    return res.data;
  }

  // ─── WALLETS ──────────────────────────────────────────────────────────────
  Future<List<dynamic>> getWallets() async {
    final res = await _dio.get('/wallets');
    return res.data;
  }

  Future<Map<String, dynamic>> getWallet(int id) async {
    final res = await _dio.get('/wallets/$id');
    return res.data;
  }

  Future<Map<String, dynamic>> createWallet(Map<String, dynamic> data) async {
    final res = await _dio.post('/wallets', data: data);
    return res.data;
  }

  Future<Map<String, dynamic>> updateWallet(int id, Map<String, dynamic> data) async {
    final res = await _dio.put('/wallets/$id', data: data);
    return res.data;
  }

  Future<void> deleteWallet(int id) async {
    await _dio.delete('/wallets/$id');
  }

  // ─── TRANSACTIONS ─────────────────────────────────────────────────────────
  Future<List<dynamic>> getTransactions({
    int? walletId,
    int? categoryId,
    String? type,
    String? startDate,
    String? endDate,
    int? limit,
  }) async {
    final res = await _dio.get('/transactions', queryParameters: {
      if (walletId != null) 'walletId': walletId,
      if (categoryId != null) 'categoryId': categoryId,
      if (type != null) 'type': type,
      if (startDate != null) 'startDate': startDate,
      if (endDate != null) 'endDate': endDate,
      if (limit != null) 'limit': limit,
    });
    return res.data;
  }

  Future<Map<String, dynamic>> createTransaction(Map<String, dynamic> data) async {
    final res = await _dio.post('/transactions', data: data);
    return res.data;
  }

  Future<Map<String, dynamic>> updateTransaction(int id, Map<String, dynamic> data) async {
    final res = await _dio.put('/transactions/$id', data: data);
    return res.data;
  }

  Future<void> deleteTransaction(int id) async {
    await _dio.delete('/transactions/$id');
  }

  Future<Map<String, dynamic>> getSummary() async {
    final res = await _dio.get('/transactions/summary');
    return res.data;
  }

  // ─── CATEGORIES ───────────────────────────────────────────────────────────
  Future<List<dynamic>> getCategories() async {
    final res = await _dio.get('/categories');
    return res.data;
  }

  Future<Map<String, dynamic>> createCategory(Map<String, dynamic> data) async {
    final res = await _dio.post('/categories', data: data);
    return res.data;
  }

  Future<Map<String, dynamic>> updateCategory(int id, Map<String, dynamic> data) async {
    final res = await _dio.put('/categories/$id', data: data);
    return res.data;
  }

  Future<void> deleteCategory(int id) async {
    await _dio.delete('/categories/$id');
  }

  // ─── BUDGETS ──────────────────────────────────────────────────────────────
  Future<List<dynamic>> getBudgets() async {
    final res = await _dio.get('/budgets');
    return res.data;
  }

  Future<Map<String, dynamic>> createBudget(Map<String, dynamic> data) async {
    final res = await _dio.post('/budgets', data: data);
    return res.data;
  }

  Future<Map<String, dynamic>> updateBudget(int id, Map<String, dynamic> data) async {
    final res = await _dio.put('/budgets/$id', data: data);
    return res.data;
  }

  Future<void> deleteBudget(int id) async {
    await _dio.delete('/budgets/$id');
  }

  // ─── SAVINGS GOALS ────────────────────────────────────────────────────────
  Future<List<dynamic>> getSavingsGoals() async {
    final res = await _dio.get('/savings-goals');
    return res.data;
  }

  Future<Map<String, dynamic>> createSavingsGoal(Map<String, dynamic> data) async {
    final res = await _dio.post('/savings-goals', data: data);
    return res.data;
  }

  Future<Map<String, dynamic>> updateSavingsGoal(int id, Map<String, dynamic> data) async {
    final res = await _dio.put('/savings-goals/$id', data: data);
    return res.data;
  }

  Future<Map<String, dynamic>> addContribution(int goalId, double amount) async {
    final res = await _dio.post('/savings-goals/$goalId/contribute', data: {'amount': amount});
    return res.data;
  }

  Future<void> deleteSavingsGoal(int id) async {
    await _dio.delete('/savings-goals/$id');
  }

  // ─── BILL REMINDERS ───────────────────────────────────────────────────────
  Future<List<dynamic>> getBillReminders() async {
    final res = await _dio.get('/bill-reminders');
    return res.data;
  }

  Future<Map<String, dynamic>> createBillReminder(Map<String, dynamic> data) async {
    final res = await _dio.post('/bill-reminders', data: data);
    return res.data;
  }

  Future<Map<String, dynamic>> markBillPaid(int id) async {
    final res = await _dio.put('/bill-reminders/$id/pay');
    return res.data;
  }

  Future<void> deleteBillReminder(int id) async {
    await _dio.delete('/bill-reminders/$id');
  }

  // ─── NOTIFICATIONS ────────────────────────────────────────────────────────
  Future<List<dynamic>> getNotifications() async {
    final res = await _dio.get('/smart-notifications');
    return res.data;
  }

  Future<Map<String, dynamic>> getUnreadCount() async {
    final res = await _dio.get('/smart-notifications/stats/unread-count');
    return res.data;
  }

  Future<void> markNotificationRead(int id) async {
    await _dio.put('/smart-notifications/$id/read');
  }

  Future<void> markAllNotificationsRead() async {
    await _dio.put('/smart-notifications/all/read');
  }

  // ─── REPORTS ──────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> getReport({String? period, String? startDate, String? endDate}) async {
    final res = await _dio.get('/reports', queryParameters: {
      if (period != null) 'period': period,
      if (startDate != null) 'startDate': startDate,
      if (endDate != null) 'endDate': endDate,
    });
    return res.data;
  }

  // ─── RECURRING TRANSACTIONS ───────────────────────────────────────────────
  Future<List<dynamic>> getRecurringTransactions() async {
    final res = await _dio.get('/recurring-transactions');
    return res.data;
  }

  Future<Map<String, dynamic>> createRecurringTransaction(Map<String, dynamic> data) async {
    final res = await _dio.post('/recurring-transactions', data: data);
    return res.data;
  }

  Future<void> deleteRecurringTransaction(int id) async {
    await _dio.delete('/recurring-transactions/$id');
  }

  // ─── BANK ACCOUNTS ────────────────────────────────────────────────────────
  Future<List<dynamic>> getBankAccounts() async {
    final res = await _dio.get('/bank-accounts');
    return res.data;
  }

  Future<Map<String, dynamic>> createBankAccount(Map<String, dynamic> data) async {
    final res = await _dio.post('/bank-accounts', data: data);
    return res.data;
  }

  Future<Map<String, dynamic>> updateBankAccount(int id, Map<String, dynamic> data) async {
    final res = await _dio.put('/bank-accounts/$id', data: data);
    return res.data;
  }

  Future<void> deleteBankAccount(int id) async {
    await _dio.delete('/bank-accounts/$id');
  }

  Future<Map<String, dynamic>> getBankTotalBalance() async {
    final res = await _dio.get('/bank-accounts/total-balance');
    return res.data;
  }

  // ─── CREDIT CARDS ─────────────────────────────────────────────────────────
  Future<List<dynamic>> getCreditCards() async {
    final res = await _dio.get('/credit-cards');
    return res.data;
  }

  Future<Map<String, dynamic>> createCreditCard(Map<String, dynamic> data) async {
    final res = await _dio.post('/credit-cards', data: data);
    return res.data;
  }

  Future<Map<String, dynamic>> updateCreditCard(int id, Map<String, dynamic> data) async {
    final res = await _dio.put('/credit-cards/$id', data: data);
    return res.data;
  }

  Future<void> deleteCreditCard(int id) async {
    await _dio.delete('/credit-cards/$id');
  }

  Future<Map<String, dynamic>> getCreditCardUtilization() async {
    final res = await _dio.get('/credit-cards/analytics/utilization-ratio');
    return res.data;
  }

  Future<Map<String, dynamic>> getCreditCardTotalLimit() async {
    final res = await _dio.get('/credit-cards/analytics/total-limit');
    return res.data;
  }

  // ─── SHARED EXPENSES ─────────────────────────────────────────────────────
  Future<List<dynamic>> getSharedExpenseGroups() async {
    final res = await _dio.get('/shared-expenses/groups');
    return res.data;
  }

  Future<Map<String, dynamic>> createSharedExpenseGroup(Map<String, dynamic> data) async {
    final res = await _dio.post('/shared-expenses/groups', data: data);
    return res.data;
  }

  Future<Map<String, dynamic>> getSharedExpenseGroup(int id) async {
    final res = await _dio.get('/shared-expenses/groups/$id');
    return res.data;
  }

  Future<void> deleteSharedExpenseGroup(int id) async {
    await _dio.delete('/shared-expenses/groups/$id');
  }

  Future<Map<String, dynamic>> addSharedExpense(int groupId, Map<String, dynamic> data) async {
    final res = await _dio.post('/shared-expenses/groups/$groupId/expenses', data: data);
    return res.data;
  }

  Future<Map<String, dynamic>> getGroupBalance(int groupId) async {
    final res = await _dio.get('/shared-expenses/groups/$groupId/balance');
    return res.data;
  }

  Future<List<dynamic>> getGroupExpenses(int groupId) async {
    final res = await _dio.get('/shared-expenses/groups/$groupId/expenses');
    return res.data;
  }

  Future<Map<String, dynamic>> getGroupSummary(int groupId) async {
    final res = await _dio.get('/shared-expenses/groups/$groupId/summary');
    return res.data;
  }

  // ─── MULTI-CURRENCY ───────────────────────────────────────────────────────
  Future<List<dynamic>> getCurrencies() async {
    final res = await _dio.get('/multi-currency/currencies');
    return res.data;
  }

  Future<Map<String, dynamic>> convertCurrency(String from, String to, double amount) async {
    final res = await _dio.get('/multi-currency/convert', queryParameters: {
      'from': from,
      'to': to,
      'amount': amount,
    });
    return res.data;
  }

  Future<List<dynamic>> getExchangeRateHistory(String from, String to, {int days = 30}) async {
    final res = await _dio.get('/multi-currency/exchange-history', queryParameters: {
      'from': from,
      'to': to,
      'days': days,
    });
    return res.data;
  }

  // ─── ANALYTICS & INSIGHTS ─────────────────────────────────────────────────
  Future<Map<String, dynamic>> getAnalytics({String? period}) async {
    final res = await _dio.get('/analytics', queryParameters: {
      if (period != null) 'period': period,
    });
    return res.data;
  }

  Future<Map<String, dynamic>> getFinancialInsights() async {
    final res = await _dio.get('/financial-insights/summary');
    return res.data;
  }

  Future<Map<String, dynamic>> getSpendingForecast() async {
    final res = await _dio.get('/financial-insights/spending-forecast');
    return res.data;
  }

  Future<List<dynamic>> getSpendingByCategory({String? month}) async {
    final res = await _dio.get('/financial-insights/spending-by-category', queryParameters: {
      if (month != null) 'month': month,
    });
    return res.data;
  }

  Future<List<dynamic>> getMonthlyTrend({int months = 6}) async {
    final res = await _dio.get('/financial-insights/monthly-trend', queryParameters: {
      'months': months,
    });
    return res.data;
  }

  Future<Map<String, dynamic>> getRecommendations() async {
    final res = await _dio.get('/financial-insights/recommendations');
    return res.data;
  }

  Future<Map<String, dynamic>> getSpendingTrend({int days = 30}) async {
    final res = await _dio.get('/analytics/spending-trend', queryParameters: {
      'days': days,
    });
    return res.data;
  }

  Future<Map<String, dynamic>> getPredictedExpense() async {
    final res = await _dio.get('/analytics/predicted-expense');
    return res.data;
  }

  // ─── TAGS ─────────────────────────────────────────────────────────────────
  Future<List<dynamic>> getTags() async {
    final res = await _dio.get('/tags');
    return res.data;
  }

  Future<Map<String, dynamic>> createTag(Map<String, dynamic> data) async {
    final res = await _dio.post('/tags', data: data);
    return res.data;
  }

  Future<void> deleteTag(int id) async {
    await _dio.delete('/tags/$id');
  }

  // ─── FINANCIAL REPORTS ────────────────────────────────────────────────────
  Future<List<dynamic>> getFinancialReports() async {
    final res = await _dio.get('/financial-reports');
    return res.data;
  }

  Future<Map<String, dynamic>> generateMonthlyReport({int? month, int? year}) async {
    final now = DateTime.now();
    final res = await _dio.post('/financial-reports/monthly', queryParameters: {
      'month': month ?? now.month,
      'year': year ?? now.year,
    });
    return res.data;
  }

  Future<Map<String, dynamic>> generateQuarterlyReport({int? quarter, int? year}) async {
    final now = DateTime.now();
    final res = await _dio.post('/financial-reports/quarterly', queryParameters: {
      'quarter': quarter ?? ((now.month - 1) ~/ 3 + 1),
      'year': year ?? now.year,
    });
    return res.data;
  }

  Future<Map<String, dynamic>> generateYearlyReport({int? year}) async {
    final res = await _dio.post('/financial-reports/yearly', queryParameters: {
      'year': year ?? DateTime.now().year,
    });
    return res.data;
  }

  Future<void> deleteFinancialReport(int id) async {
    await _dio.delete('/financial-reports/$id');
  }

  // ─── USER PROFILE ───────────────────────────────────────────────────────
  Future<Map<String, dynamic>> getUserProfile() async {
    final res = await _dio.get('/user-profiles');
    return res.data;
  }

  Future<Map<String, dynamic>> updateUserProfile(Map<String, dynamic> data) async {
    final res = await _dio.put('/user-profiles', data: data);
    return res.data;
  }

  Future<Map<String, dynamic>> updateUserSettings(Map<String, dynamic> settings) async {
    final res = await _dio.put('/user-profiles/settings', data: settings);
    return res.data;
  }

  // ─── DEBTS ──────────────────────────────────────────────────────────────
  Future<List<dynamic>> getDebts() async {
    final res = await _dio.get('/debts');
    return res.data;
  }

  Future<Map<String, dynamic>> getDebtsSummary() async {
    final res = await _dio.get('/debts/summary');
    return res.data;
  }

  Future<Map<String, dynamic>> getDebt(int id) async {
    final res = await _dio.get('/debts/$id');
    return res.data;
  }

  Future<Map<String, dynamic>> createDebt(Map<String, dynamic> data) async {
    final res = await _dio.post('/debts', data: data);
    return res.data;
  }

  Future<Map<String, dynamic>> updateDebt(int id, Map<String, dynamic> data) async {
    final res = await _dio.put('/debts/$id', data: data);
    return res.data;
  }

  Future<void> deleteDebt(int id) async {
    await _dio.delete('/debts/$id');
  }

  Future<List<dynamic>> getDebtPayments(int debtId) async {
    final res = await _dio.get('/debts/$debtId/payments');
    return res.data;
  }

  Future<Map<String, dynamic>> addDebtPayment(int debtId, Map<String, dynamic> data) async {
    final res = await _dio.post('/debts/$debtId/payments', data: data);
    return res.data;
  }

  // ─── INVESTMENTS ────────────────────────────────────────────────────────
  Future<List<dynamic>> getInvestments() async {
    final res = await _dio.get('/investments');
    return res.data;
  }

  Future<Map<String, dynamic>> getPortfolioSummary() async {
    final res = await _dio.get('/investments/portfolio');
    return res.data;
  }

  Future<Map<String, dynamic>> getInvestment(int id) async {
    final res = await _dio.get('/investments/$id');
    return res.data;
  }

  Future<Map<String, dynamic>> createInvestment(Map<String, dynamic> data) async {
    final res = await _dio.post('/investments', data: data);
    return res.data;
  }

  Future<Map<String, dynamic>> updateInvestment(int id, Map<String, dynamic> data) async {
    final res = await _dio.put('/investments/$id', data: data);
    return res.data;
  }

  Future<void> deleteInvestment(int id) async {
    await _dio.delete('/investments/$id');
  }

  Future<List<dynamic>> getInvestmentTransactions(int investmentId) async {
    final res = await _dio.get('/investments/$investmentId/transactions');
    return res.data;
  }

  Future<Map<String, dynamic>> addInvestmentTransaction(int investmentId, Map<String, dynamic> data) async {
    final res = await _dio.post('/investments/$investmentId/transactions', data: data);
    return res.data;
  }

  // ─── AUDIT LOGS ─────────────────────────────────────────────────────────
  Future<List<dynamic>> getAuditLogs({int limit = 50}) async {
    final res = await _dio.get('/audit-logs', queryParameters: {'limit': limit});
    return res.data;
  }

  Future<Map<String, dynamic>> getAuditStats() async {
    final res = await _dio.get('/audit-logs/stats');
    return res.data;
  }

  // ─── NET WORTH ────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> getNetWorthCurrent() async {
    final res = await _dio.get('/net-worth/current');
    return Map<String, dynamic>.from(res.data as Map);
  }

  Future<List<dynamic>> getNetWorthSnapshots({
    bool latest = false,
    String? from,
    String? to,
  }) async {
    final res = await _dio.get('/net-worth/snapshots', queryParameters: {
      if (latest) 'latest': 'true',
      if (from != null) 'from': from,
      if (to != null) 'to': to,
    });
    final data = res.data;
    if (data is List) return data;
    return [];
  }

  Future<Map<String, dynamic>> captureNetWorthSnapshot({String? note}) async {
    final res = await _dio.post('/net-worth/snapshots', data: {
      if (note != null && note.isNotEmpty) 'note': note,
    });
    return Map<String, dynamic>.from(res.data as Map);
  }

  Future<Map<String, dynamic>> bulkImportTransactions(List<Map<String, dynamic>> items) async {
    final res = await _dio.post('/transactions/bulk', data: {'items': items});
    return Map<String, dynamic>.from(res.data as Map);
  }
}