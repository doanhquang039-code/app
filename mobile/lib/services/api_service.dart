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
}