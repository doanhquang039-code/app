class AIInsight {
  final String id;
  final String title;
  final String description;
  final String category; // spending, saving, investment, debt
  final String priority; // high, medium, low
  final double? potentialSavings;
  final List<String> actionItems;
  final DateTime createdAt;
  final bool isRead;

  AIInsight({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.priority,
    this.potentialSavings,
    required this.actionItems,
    required this.createdAt,
    this.isRead = false,
  });

  factory AIInsight.fromJson(Map<String, dynamic> json) {
    return AIInsight(
      id: json['id'].toString(),
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? 'spending',
      priority: json['priority'] ?? 'medium',
      potentialSavings: json['potential_savings']?.toDouble(),
      actionItems: List<String>.from(json['action_items'] ?? []),
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
      isRead: json['is_read'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'category': category,
      'priority': priority,
      'potential_savings': potentialSavings,
      'action_items': actionItems,
      'created_at': createdAt.toIso8601String(),
      'is_read': isRead,
    };
  }
}

class SpendingPrediction {
  final String category;
  final double predictedAmount;
  final double confidence;
  final String period; // week, month, year
  final List<double> historicalData;
  final String trend; // increasing, decreasing, stable

  SpendingPrediction({
    required this.category,
    required this.predictedAmount,
    required this.confidence,
    required this.period,
    required this.historicalData,
    required this.trend,
  });

  factory SpendingPrediction.fromJson(Map<String, dynamic> json) {
    return SpendingPrediction(
      category: json['category'] ?? '',
      predictedAmount: json['predicted_amount']?.toDouble() ?? 0.0,
      confidence: json['confidence']?.toDouble() ?? 0.0,
      period: json['period'] ?? 'month',
      historicalData: List<double>.from(json['historical_data']?.map((x) => x.toDouble()) ?? []),
      trend: json['trend'] ?? 'stable',
    );
  }
}

class FinancialRecommendation {
  final String id;
  final String type; // save_money, reduce_debt, invest, optimize_budget
  final String title;
  final String description;
  final double impact; // 0-100 score
  final String difficulty; // easy, medium, hard
  final int estimatedTimeMinutes;
  final List<String> steps;

  FinancialRecommendation({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    required this.impact,
    required this.difficulty,
    required this.estimatedTimeMinutes,
    required this.steps,
  });

  factory FinancialRecommendation.fromJson(Map<String, dynamic> json) {
    return FinancialRecommendation(
      id: json['id'].toString(),
      type: json['type'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      impact: json['impact']?.toDouble() ?? 0.0,
      difficulty: json['difficulty'] ?? 'medium',
      estimatedTimeMinutes: json['estimated_time_minutes'] ?? 0,
      steps: List<String>.from(json['steps'] ?? []),
    );
  }
}
