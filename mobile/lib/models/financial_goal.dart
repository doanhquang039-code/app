class FinancialGoal {
  final String id;
  final String name;
  final double targetAmount;
  final double currentAmount;
  final DateTime deadline;
  final String category;
  final String priority;
  final double monthlyContribution;
  final List<Milestone> milestones;
  final bool isCompleted;

  FinancialGoal({
    required this.id,
    required this.name,
    required this.targetAmount,
    required this.currentAmount,
    required this.deadline,
    required this.category,
    required this.priority,
    required this.monthlyContribution,
    required this.milestones,
    this.isCompleted = false,
  });

  double get progress => (currentAmount / targetAmount * 100).clamp(0, 100);

  factory FinancialGoal.fromJson(Map<String, dynamic> json) {
    return FinancialGoal(
      id: json['id'].toString(),
      name: json['name'] ?? '',
      targetAmount: json['target_amount']?.toDouble() ?? 0.0,
      currentAmount: json['current_amount']?.toDouble() ?? 0.0,
      deadline: DateTime.parse(json['deadline'] ?? DateTime.now().toIso8601String()),
      category: json['category'] ?? '',
      priority: json['priority'] ?? 'medium',
      monthlyContribution: json['monthly_contribution']?.toDouble() ?? 0.0,
      milestones: (json['milestones'] as List?)
              ?.map((x) => Milestone.fromJson(x))
              .toList() ??
          [],
      isCompleted: json['is_completed'] ?? false,
    );
  }
}

class Milestone {
  final String name;
  final double amount;
  final bool isCompleted;

  Milestone({
    required this.name,
    required this.amount,
    required this.isCompleted,
  });

  factory Milestone.fromJson(Map<String, dynamic> json) {
    return Milestone(
      name: json['name'] ?? '',
      amount: json['amount']?.toDouble() ?? 0.0,
      isCompleted: json['is_completed'] ?? false,
    );
  }
}
