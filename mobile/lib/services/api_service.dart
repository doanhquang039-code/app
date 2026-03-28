import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:3000'; // Android emulator
  late Dio _dio;

  ApiService() {
    _dio = Dio(BaseOptions(baseUrl: baseUrl));
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

  // Auth
  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await _dio.post('/auth/login', data: {'email': email, 'password': password});
    return res.data;
  }

  Future<Map<String, dynamic>> register(String email, String password) async {
    final res = await _dio.post('/auth/register', data: {'email': email, 'password': password});
    return res.data;
  }

  // Transactions
  Future<List<dynamic>> getTransactions() async {
    final res = await _dio.get('/transactions');
    return res.data;
  }

  Future<Map<String, dynamic>> createTransaction(Map<String, dynamic> data) async {
    final res = await _dio.post('/transactions', data: data);
    return res.data;
  }

  Future<void> deleteTransaction(int id) async {
    await _dio.delete('/transactions/$id');
  }

  Future<Map<String, dynamic>> getSummary() async {
    final res = await _dio.get('/transactions/summary');
    return res.data;
  }

  // Categories
  Future<List<dynamic>> getCategories() async {
    final res = await _dio.get('/categories');
    return res.data;
  }
}