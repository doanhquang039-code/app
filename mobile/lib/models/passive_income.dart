class PassiveIncome {
  final String id;
  final String name;
  final String category; // rental, dividends, royalties, interest, business
  final double monthlyIncome;
  final double yearlyIncome;
  final DateTime startDate;
  final String frequency; // monthly, quarterly, yearly
  final bool isActive;
  final List<IncomeHistory> history;
  final String? description;
  final double? initialInvestment;

  PassiveIncome({
    required this.id,
    required this.name,
    required this.category,
    required this.monthlyIncome,
    required this.yearlyIncome,
    required this.startDate,
    required this.frequency,
    this.isActive = true,
    required this.history,
    this.description,
    this.initialInvestment,
  });

  double get roi {
    if (initialInvestment == null || initialInvestment == 0) return 0;
    return (yearlyIncome / initialInvestment!) * 100;
  }

  factory PassiveIncome.fromJson(Map<String, dynamic> json) {
    return PassiveIncome(
      id: json['id'].toString(),
      name: json['name'] ?? '',
      category: json['category'] ?? '',
      monthlyIncome: json['monthly_income']?.toDouble() ?? 0.0,
      yearlyIncome: json['yearly_income']?.toDouble() ?? 0.0,
      startDate: DateTime.parse(json['start_date'] ?? DateTime.now().toIso8601String()),
      frequency: json['frequency'] ?? 'monthly',
      isActive: json['is_active'] ?? true,
      history: (json['history'] as List?)
              ?.map((x) => IncomeHistory.fromJson(x))
              .toList() ??
          [],
      description: json['description'],
      initialInvestment: json['initial_investment']?.toDouble(),
    );
  }
}

class IncomeHistory {
  final DateTime date;
  final double amount;
  final String? note;

  IncomeHistory({
    required this.date,
    required this.amount,
    this.note,
  });

  factory IncomeHistory.fromJson(Map<String, dynamic> json) {
    return IncomeHistory(
      date: DateTime.parse(json['date'] ?? DateTime.now().toIso8601String()),
      amount: json['amount']?.toDouble() ?? 0.0,
      note: json['note'],
    );
  }
}

class PassiveIncomeAnalytics {
  final double totalMonthly;
  final double totalYearly;
  final int activeStreams;
  final Map<String, double> categoryBreakdown;
  final double averageROI;
  final List<PassiveIncome> topPerformers;

  PassiveIncomeAnalytics({
    required this.totalMonthly,
    required this.totalYearly,
    required this.activeStreams,
    required this.categoryBreakdown,
    required this.averageROI,
    required this.topPerformers,
  });
}
