class SmartBudget {
  final String id;
  final String category;
  final double recommendedAmount;
  final double currentAmount;
  final String reason;
  final double savingsPotential;
  final List<String> tips;
  final String priority;

  SmartBudget({
    required this.id,
    required this.category,
    required this.recommendedAmount,
    required this.currentAmount,
    required this.reason,
    required this.savingsPotential,
    required this.tips,
    required this.priority,
  });

  factory SmartBudget.fromJson(Map<String, dynamic> json) {
    return SmartBudget(
      id: json['id'].toString(),
      category: json['category'] ?? '',
      recommendedAmount: json['recommended_amount']?.toDouble() ?? 0.0,
      currentAmount: json['current_amount']?.toDouble() ?? 0.0,
      reason: json['reason'] ?? '',
      savingsPotential: json['savings_potential']?.toDouble() ?? 0.0,
      tips: List<String>.from(json['tips'] ?? []),
      priority: json['priority'] ?? 'medium',
    );
  }
}
