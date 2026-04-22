import 'package:flutter/material.dart';
import '../models/savings_goal.dart';
import '../services/api_service.dart';

class SavingsProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  List<SavingsGoal> _goals = [];
  bool _isLoading = false;

  List<SavingsGoal> get goals => _goals;
  bool get isLoading => _isLoading;

  double get totalTarget => _goals.fold(0.0, (s, g) => s + g.targetAmount);
  double get totalSaved => _goals.fold(0.0, (s, g) => s + g.currentAmount);
  int get activeCount => _goals.where((g) => !g.isCompleted).length;
  int get completedCount => _goals.where((g) => g.isCompleted).length;

  Future<void> loadGoals() async {
    _isLoading = true;
    notifyListeners();
    try {
      final data = await _api.getSavingsGoals();
      _goals = data.map((e) => SavingsGoal.fromJson(e)).toList();
    } catch (_) {}
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> createGoal(Map<String, dynamic> data) async {
    try {
      final res = await _api.createSavingsGoal(data);
      _goals.insert(0, SavingsGoal.fromJson(res));
      notifyListeners();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> contribute(int goalId, double amount) async {
    try {
      await _api.addContribution(goalId, amount);
      await loadGoals();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> deleteGoal(int id) async {
    try {
      await _api.deleteSavingsGoal(id);
      _goals.removeWhere((g) => g.id == id);
      notifyListeners();
      return true;
    } catch (_) {
      return false;
    }
  }
}
