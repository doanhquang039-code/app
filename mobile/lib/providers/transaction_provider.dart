import 'package:flutter/material.dart';
import '../models/transaction.dart' as model;
import '../services/api_service.dart';

class TransactionProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  List<model.Transaction> _transactions = [];
  bool _isLoading = false;
  double _totalIncome = 0;
  double _totalExpense = 0;

  // Filters
  int? _filterWalletId;
  int? _filterCategoryId;
  String? _filterType;

  List<model.Transaction> get transactions => _transactions;
  bool get isLoading => _isLoading;
  double get totalIncome => _totalIncome;
  double get totalExpense => _totalExpense;
  double get balance => _totalIncome - _totalExpense;
  int? get filterWalletId => _filterWalletId;

  void setFilter({int? walletId, int? categoryId, String? type}) {
    _filterWalletId = walletId;
    _filterCategoryId = categoryId;
    _filterType = type;
    loadTransactions();
  }

  Future<void> loadTransactions() async {
    _isLoading = true;
    notifyListeners();
    try {
      final data = await _api.getTransactions(
        walletId: _filterWalletId,
        categoryId: _filterCategoryId,
        type: _filterType,
      );
      _transactions = data.map((e) => model.Transaction.fromJson(e)).toList();

      final summary = await _api.getSummary();
      _totalIncome = double.tryParse(summary['totalIncome']?.toString() ?? '0') ?? 0;
      _totalExpense = double.tryParse(summary['totalExpense']?.toString() ?? '0') ?? 0;
    } catch (_) {}
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> addTransaction(Map<String, dynamic> data) async {
    try {
      final res = await _api.createTransaction(data);
      _transactions.insert(0, model.Transaction.fromJson(res));
      if (data['type'] == 'income') {
        _totalIncome += double.tryParse(data['amount']?.toString() ?? '0') ?? 0;
      } else {
        _totalExpense += double.tryParse(data['amount']?.toString() ?? '0') ?? 0;
      }
      notifyListeners();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> deleteTransaction(int id) async {
    try {
      await _api.deleteTransaction(id);
      _transactions.removeWhere((t) => t.id == id);
      notifyListeners();
      return true;
    } catch (_) {
      return false;
    }
  }
}
