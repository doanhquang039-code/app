class ExpensePrediction {
  final String category;
  final double predictedAmount;
  final double actualAmount;
  final double variance;
  final String period;
  final List<MonthlyData> monthlyData;
  final String accuracy;

  ExpensePrediction({
    required this.category,
    required this.predictedAmount,
    required this.actualAmount,
    required this.variance,
    required this.period,
    required this.monthlyData,
    required this.accuracy,
  });

  factory ExpensePrediction.fromJson(Map<String, dynamic> json) {
    return ExpensePrediction(
      category: json['category'] ?? '',
      predictedAmount: json['predicted_amount']?.toDouble() ?? 0.0,
      actualAmount: json['actual_amount']?.toDouble() ?? 0.0,
      variance: json['variance']?.toDouble() ?? 0.0,
      period: json['period'] ?? 'month',
      monthlyData: (json['monthly_data'] as List?)
              ?.map((x) => MonthlyData.fromJson(x))
              .toList() ??
          [],
      accuracy: json['accuracy'] ?? 'medium',
    );
  }
}

class MonthlyData {
  final String month;
  final double predicted;
  final double actual;

  MonthlyData({
    required this.month,
    required this.predicted,
    required this.actual,
  });

  factory MonthlyData.fromJson(Map<String, dynamic> json) {
    return MonthlyData(
      month: json['month'] ?? '',
      predicted: json['predicted']?.toDouble() ?? 0.0,
      actual: json['actual']?.toDouble() ?? 0.0,
    );
  }
}
