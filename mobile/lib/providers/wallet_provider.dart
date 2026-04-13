import 'package:flutter/material.dart';
import '../models/wallet.dart';
import '../services/api_service.dart';

class WalletProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  List<Wallet> _wallets = [];
  Wallet? _selectedWallet;
  bool _isLoading = false;

  List<Wallet> get wallets => _wallets;
  Wallet? get selectedWallet => _selectedWallet;
  bool get isLoading => _isLoading;

  double get totalBalance =>
      _wallets.fold(0, (sum, w) => sum + w.balance);

  Future<void> loadWallets() async {
    _isLoading = true;
    notifyListeners();
    try {
      final data = await _api.getWallets();
      _wallets = data.map((e) => Wallet.fromJson(e)).toList();
      if (_selectedWallet == null && _wallets.isNotEmpty) {
        _selectedWallet = _wallets.firstWhere(
          (w) => w.isDefault,
          orElse: () => _wallets.first,
        );
      }
    } catch (_) {}
    _isLoading = false;
    notifyListeners();
  }

  void selectWallet(Wallet wallet) {
    _selectedWallet = wallet;
    notifyListeners();
  }

  Future<bool> createWallet(Map<String, dynamic> data) async {
    try {
      final res = await _api.createWallet(data);
      _wallets.add(Wallet.fromJson(res));
      notifyListeners();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> updateWallet(int id, Map<String, dynamic> data) async {
    try {
      final res = await _api.updateWallet(id, data);
      final idx = _wallets.indexWhere((w) => w.id == id);
      if (idx != -1) _wallets[idx] = Wallet.fromJson(res);
      notifyListeners();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> deleteWallet(int id) async {
    try {
      await _api.deleteWallet(id);
      _wallets.removeWhere((w) => w.id == id);
      if (_selectedWallet?.id == id) {
        _selectedWallet = _wallets.isNotEmpty ? _wallets.first : null;
      }
      notifyListeners();
      return true;
    } catch (_) {
      return false;
    }
  }
}
