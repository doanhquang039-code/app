import 'package:flutter/material.dart';
import '../models/category.dart';
import '../services/api_service.dart';

class CategoryProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  List<Category> _categories = [];
  bool _isLoading = false;

  List<Category> get categories => _categories;
  bool get isLoading => _isLoading;

  List<Category> get expenseCategories =>
      _categories.where((c) => c.type == 'expense').toList();

  List<Category> get incomeCategories =>
      _categories.where((c) => c.type == 'income').toList();

  Future<void> loadCategories() async {
    _isLoading = true;
    notifyListeners();
    try {
      final data = await _api.getCategories();
      _categories = data.map((e) => Category.fromJson(e)).toList();
    } catch (_) {}
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> createCategory(Map<String, dynamic> data) async {
    try {
      final res = await _api.createCategory(data);
      _categories.add(Category.fromJson(res));
      notifyListeners();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> deleteCategory(int id) async {
    try {
      await _api.deleteCategory(id);
      _categories.removeWhere((c) => c.id == id);
      notifyListeners();
      return true;
    } catch (_) {
      return false;
    }
  }
}
