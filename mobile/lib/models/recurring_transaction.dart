class RecurringTransaction {
  final int id;
  final int walletId;
  final int categoryId;
  final double amount;
  final String type;
  final String? note;
  final String frequency;
  final String? frequencyDay;
  final DateTime startDate;
  final DateTime? endDate;
  final bool isActive;
  final DateTime? lastExecutedDate;
  final DateTime? nextExecutionDate;
  final String? categoryName;
  final String? walletName;

  RecurringTransaction({
    required this.id,
    required this.walletId,
    required this.categoryId,
    required this.amount,
    required this.type,
    this.note,
    required this.frequency,
    this.frequencyDay,
    required this.startDate,
    this.endDate,
    required this.isActive,
    this.lastExecutedDate,
    this.nextExecutionDate,
    this.categoryName,
    this.walletName,
  });

  String get frequencyLabel {
    switch (frequency) {
      case 'daily': return 'Hàng ngày';
      case 'weekly': return 'Hàng tuần';
      case 'biweekly': return 'Hai tuần';
      case 'monthly': return 'Hàng tháng';
      case 'quarterly': return 'Hàng quý';
      case 'yearly': return 'Hàng năm';
      default: return frequency;
    }
  }

  factory RecurringTransaction.fromJson(Map<String, dynamic> json) =>
      RecurringTransaction(
        id: json['id'],
        walletId: json['walletId'] ?? 0,
        categoryId: json['categoryId'] ?? 0,
        amount: double.tryParse(json['amount']?.toString() ?? '0') ?? 0,
        type: json['type'] ?? 'expense',
        note: json['note'],
        frequency: json['frequency'] ?? 'monthly',
        frequencyDay: json['frequencyDay'],
        startDate: DateTime.tryParse(json['startDate'] ?? '') ?? DateTime.now(),
        endDate: json['endDate'] != null
            ? DateTime.tryParse(json['endDate'])
            : null,
        isActive: json['isActive'] ?? true,
        lastExecutedDate: json['lastExecutedDate'] != null
            ? DateTime.tryParse(json['lastExecutedDate'])
            : null,
        nextExecutionDate: json['nextExecutionDate'] != null
            ? DateTime.tryParse(json['nextExecutionDate'])
            : null,
        categoryName: json['category']?['name'],
        walletName: json['wallet']?['name'],
      );
}
