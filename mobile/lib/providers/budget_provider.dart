import 'package:flutter/material.dart';
import '../models/budget.dart';
import '../services/api_service.dart';

class BudgetProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  List<Budget> _budgets = [];
  bool _isLoading = false;

  List<Budget> get budgets => _budgets;
  bool get isLoading => _isLoading;

  List<Budget> get overBudget => _budgets.where((b) => b.isOverBudget).toList();
  List<Budget> get nearLimit => _budgets.where((b) => b.isNearLimit).toList();

  Future<void> loadBudgets() async {
    _isLoading = true;
    notifyListeners();
    try {
      final data = await _api.getBudgets();
      _budgets = data.map((e) => Budget.fromJson(e)).toList();
    } catch (_) {}
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> createBudget(Map<String, dynamic> data) async {
    try {
      final res = await _api.createBudget(data);
      _budgets.add(Budget.fromJson(res));
      notifyListeners();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> updateBudget(int id, Map<String, dynamic> data) async {
    try {
      final res = await _api.updateBudget(id, data);
      final idx = _budgets.indexWhere((b) => b.id == id);
      if (idx != -1) _budgets[idx] = Budget.fromJson(res);
      notifyListeners();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> deleteBudget(int id) async {
    try {
      await _api.deleteBudget(id);
      _budgets.removeWhere((b) => b.id == id);
      notifyListeners();
      return true;
    } catch (_) {
      return false;
    }
  }
}
