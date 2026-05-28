import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  bool _isLoggedIn = false;
  String? _token;
  String? _lastError;
  final ApiService _api = ApiService();

  bool get isLoggedIn => _isLoggedIn;
  String? get token => _token;
  String? get lastError => _lastError;

  Future<void> checkLogin() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    _isLoggedIn = _token != null;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    try {
      _lastError = null;
      final data = await _api.login(email, password);
      _token = data['access_token'];
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', _token!);
      _isLoggedIn = true;
      notifyListeners();
      return true;
    } catch (e) {
      _lastError = _readApiError(e) ?? 'Dang nhap that bai';
      return false;
    }
  }

  Future<void> completeSocialLogin(String token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
    _isLoggedIn = true;
    notifyListeners();
  }

  Future<bool> register(String email, String password) async {
    try {
      _lastError = null;
      await _api.register(email, password);
      return true;
    } catch (e) {
      _lastError = _readApiError(e) ?? 'Dang ky that bai';
      return false;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    _token = null;
    _isLoggedIn = false;
    _lastError = null;
    notifyListeners();
  }

  String? _readApiError(Object error) {
    if (error is! DioException) return null;
    final data = error.response?.data;
    if (data is Map<String, dynamic>) {
      final message = data['message'];
      if (message is String && message.isNotEmpty) return message;
      if (message is List && message.isNotEmpty) return message.join('\n');
      final errorText = data['error'];
      if (errorText is String && errorText.isNotEmpty) return errorText;
    }
    return null;
  }
}
