class SavingsGoal {
  final int id;
  final String name;
  final double targetAmount;
  final double currentAmount;
  final DateTime? deadline;
  final String? icon;
  final String? color;
  final bool isCompleted;

  SavingsGoal({
    required this.id,
    required this.name,
    required this.targetAmount,
    required this.currentAmount,
    this.deadline,
    this.icon,
    this.color,
    required this.isCompleted,
  });

  double get progressPercent =>
      targetAmount > 0 ? (currentAmount / targetAmount).clamp(0.0, 1.0) : 0;
  double get remaining => targetAmount - currentAmount;
  int? get daysLeft => deadline != null
      ? deadline!.difference(DateTime.now()).inDays
      : null;

  factory SavingsGoal.fromJson(Map<String, dynamic> json) => SavingsGoal(
        id: json['id'],
        name: json['name'] ?? '',
        targetAmount:
            double.tryParse(json['targetAmount']?.toString() ?? '0') ?? 0,
        currentAmount:
            double.tryParse(json['currentAmount']?.toString() ?? '0') ?? 0,
        deadline: json['deadline'] != null
            ? DateTime.tryParse(json['deadline'])
            : null,
        icon: json['icon'],
        color: json['color'],
        isCompleted: json['isCompleted'] ?? false,
      );
}
