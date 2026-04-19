class NetWorthSnapshot {
  final int id;
  final DateTime snapshotDate;
  final double walletTotal;
  final double bankTotal;
  final double investmentTotal;
  final double receivablesTotal;
  final double borrowingsTotal;
  final double creditCardDebtTotal;
  final double netWorth;
  final String? note;

  NetWorthSnapshot({
    required this.id,
    required this.snapshotDate,
    required this.walletTotal,
    required this.bankTotal,
    required this.investmentTotal,
    required this.receivablesTotal,
    required this.borrowingsTotal,
    required this.creditCardDebtTotal,
    required this.netWorth,
    this.note,
  });

  static double _num(dynamic v) =>
      double.tryParse(v?.toString() ?? '0') ?? 0;

  factory NetWorthSnapshot.fromJson(Map<String, dynamic> json) {
    return NetWorthSnapshot(
      id: (json['id'] as num).toInt(),
      snapshotDate: DateTime.tryParse(json['snapshotDate']?.toString() ?? '') ??
          DateTime.now(),
      walletTotal: _num(json['walletTotal']),
      bankTotal: _num(json['bankTotal']),
      investmentTotal: _num(json['investmentTotal']),
      receivablesTotal: _num(json['receivablesTotal']),
      borrowingsTotal: _num(json['borrowingsTotal']),
      creditCardDebtTotal: _num(json['creditCardDebtTotal']),
      netWorth: _num(json['netWorth']),
      note: json['note']?.toString(),
    );
  }
}
