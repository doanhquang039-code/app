import 'package:flutter/foundation.dart';
import '../models/net_worth_snapshot.dart';
import '../services/api_service.dart';

class NetWorthProvider extends ChangeNotifier {
  final ApiService _api = ApiService();

  Map<String, dynamic>? currentBreakdown;
  List<NetWorthSnapshot> snapshots = [];
  bool isLoading = false;
  String? lastError;

  double get netWorth =>
      double.tryParse(currentBreakdown?['netWorth']?.toString() ?? '0') ?? 0;

  Future<void> loadAll() async {
    isLoading = true;
    lastError = null;
    notifyListeners();
    try {
      currentBreakdown = await _api.getNetWorthCurrent();
      final raw = await _api.getNetWorthSnapshots(latest: true);
      snapshots = raw
          .map((e) => NetWorthSnapshot.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList()
        ..sort((a, b) => a.snapshotDate.compareTo(b.snapshotDate));
    } catch (e) {
      lastError = e.toString();
      currentBreakdown = null;
      snapshots = [];
    }
    isLoading = false;
    notifyListeners();
  }

  Future<bool> captureSnapshot({String? note}) async {
    try {
      await _api.captureNetWorthSnapshot(note: note);
      await loadAll();
      return true;
    } catch (e) {
      lastError = e.toString();
      notifyListeners();
      return false;
    }
  }
}
