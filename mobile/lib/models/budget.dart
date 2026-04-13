class Budget {
  final int id;
  final int? categoryId;
  final String? categoryName;
  final double amount;
  final double spent;
  final String period;
  final DateTime startDate;
  final DateTime endDate;

  Budget({
    required this.id,
    this.categoryId,
    this.categoryName,
    required this.amount,
    required this.spent,
    required this.period,
    required this.startDate,
    required this.endDate,
  });

  double get remaining => amount - spent;
  double get progressPercent => amount > 0 ? (spent / amount).clamp(0.0, 1.0) : 0;
  bool get isOverBudget => spent > amount;
  bool get isNearLimit => progressPercent >= 0.8 && !isOverBudget;

  factory Budget.fromJson(Map<String, dynamic> json) => Budget(
        id: json['id'],
        categoryId: json['categoryId'],
        categoryName: json['categoryName'] ?? json['category']?['name'],
        amount: double.tryParse(json['amount']?.toString() ?? '0') ?? 0,
        spent: double.tryParse(json['spent']?.toString() ?? '0') ?? 0,
        period: json['period'] ?? 'monthly',
        startDate: json['startDate'] != null
            ? DateTime.parse(json['startDate'])
            : DateTime.now(),
        endDate: json['endDate'] != null
            ? DateTime.parse(json['endDate'])
            : DateTime.now().add(const Duration(days: 30)),
      );
}
