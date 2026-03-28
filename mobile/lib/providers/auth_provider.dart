import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  bool _isLoggedIn = false;
  String? _token;
  final ApiService _api = ApiService();

  bool get isLoggedIn => _isLoggedIn;
  String? get token => _token;

  Future<void> checkLogin() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    _isLoggedIn = _token != null;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    try {
      final data = await _api.login(email, password);
      _token = data['access_token'];
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', _token!);
      _isLoggedIn = true;
      notifyListeners();
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> register(String email, String password) async {
    try {
      await _api.register(email, password);
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    _token = null;
    _isLoggedIn = false;
    notifyListeners();
  }
}