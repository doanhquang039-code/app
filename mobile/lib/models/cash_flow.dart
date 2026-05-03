class CashFlowForecast {
  final DateTime startDate;
  final DateTime endDate;
  final double startingBalance;
  final List<CashFlowPeriod> periods;
  final double projectedEndBalance;
  final List<CashFlowAlert> alerts;

  CashFlowForecast({
    required this.startDate,
    required this.endDate,
    required this.startingBalance,
    required this.periods,
    required this.projectedEndBalance,
    required this.alerts,
  });

  factory CashFlowForecast.fromJson(Map<String, dynamic> json) {
    return CashFlowForecast(
      startDate: DateTime.parse(json['start_date'] ?? DateTime.now().toIso8601String()),
      endDate: DateTime.parse(json['end_date'] ?? DateTime.now().toIso8601String()),
      startingBalance: json['starting_balance']?.toDouble() ?? 0.0,
      periods: (json['periods'] as List?)
              ?.map((x) => CashFlowPeriod.fromJson(x))
              .toList() ??
          [],
      projectedEndBalance: json['projected_end_balance']?.toDouble() ?? 0.0,
      alerts: (json['alerts'] as List?)
              ?.map((x) => CashFlowAlert.fromJson(x))
              .toList() ??
          [],
    );
  }
}

class CashFlowPeriod {
  final DateTime date;
  final double income;
  final double expenses;
  final double netCashFlow;
  final double balance;
  final List<CashFlowItem> incomeItems;
  final List<CashFlowItem> expenseItems;

  CashFlowPeriod({
    required this.date,
    required this.income,
    required this.expenses,
    required this.netCashFlow,
    required this.balance,
    required this.incomeItems,
    required this.expenseItems,
  });

  factory CashFlowPeriod.fromJson(Map<String, dynamic> json) {
    return CashFlowPeriod(
      date: DateTime.parse(json['date'] ?? DateTime.now().toIso8601String()),
      income: json['income']?.toDouble() ?? 0.0,
      expenses: json['expenses']?.toDouble() ?? 0.0,
      netCashFlow: json['net_cash_flow']?.toDouble() ?? 0.0,
      balance: json['balance']?.toDouble() ?? 0.0,
      incomeItems: (json['income_items'] as List?)
              ?.map((x) => CashFlowItem.fromJson(x))
              .toList() ??
          [],
      expenseItems: (json['expense_items'] as List?)
              ?.map((x) => CashFlowItem.fromJson(x))
              .toList() ??
          [],
    );
  }
}

class CashFlowItem {
  final String name;
  final double amount;
  final String category;
  final bool isRecurring;

  CashFlowItem({
    required this.name,
    required this.amount,
    required this.category,
    this.isRecurring = false,
  });

  factory CashFlowItem.fromJson(Map<String, dynamic> json) {
    return CashFlowItem(
      name: json['name'] ?? '',
      amount: json['amount']?.toDouble() ?? 0.0,
      category: json['category'] ?? '',
      isRecurring: json['is_recurring'] ?? false,
    );
  }
}

class CashFlowAlert {
  final String type; // warning, critical, info
  final String message;
  final DateTime date;
  final double? amount;

  CashFlowAlert({
    required this.type,
    required this.message,
    required this.date,
    this.amount,
  });

  factory CashFlowAlert.fromJson(Map<String, dynamic> json) {
    return CashFlowAlert(
      type: json['type'] ?? 'info',
      message: json['message'] ?? '',
      date: DateTime.parse(json['date'] ?? DateTime.now().toIso8601String()),
      amount: json['amount']?.toDouble(),
    );
  }
}
