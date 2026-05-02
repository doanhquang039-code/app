class TaxCalculation {
  final double grossIncome;
  final double taxableIncome;
  final double totalTax;
  final double netIncome;
  final List<TaxBracket> brackets;
  final List<Deduction> deductions;
  final String taxYear;

  TaxCalculation({
    required this.grossIncome,
    required this.taxableIncome,
    required this.totalTax,
    required this.netIncome,
    required this.brackets,
    required this.deductions,
    required this.taxYear,
  });

  double get effectiveTaxRate => (totalTax / grossIncome * 100);

  factory TaxCalculation.fromJson(Map<String, dynamic> json) {
    return TaxCalculation(
      grossIncome: json['gross_income']?.toDouble() ?? 0.0,
      taxableIncome: json['taxable_income']?.toDouble() ?? 0.0,
      totalTax: json['total_tax']?.toDouble() ?? 0.0,
      netIncome: json['net_income']?.toDouble() ?? 0.0,
      brackets: (json['brackets'] as List?)
              ?.map((x) => TaxBracket.fromJson(x))
              .toList() ??
          [],
      deductions: (json['deductions'] as List?)
              ?.map((x) => Deduction.fromJson(x))
              .toList() ??
          [],
      taxYear: json['tax_year'] ?? DateTime.now().year.toString(),
    );
  }
}

class TaxBracket {
  final String range;
  final double rate;
  final double amount;

  TaxBracket({
    required this.range,
    required this.rate,
    required this.amount,
  });

  factory TaxBracket.fromJson(Map<String, dynamic> json) {
    return TaxBracket(
      range: json['range'] ?? '',
      rate: json['rate']?.toDouble() ?? 0.0,
      amount: json['amount']?.toDouble() ?? 0.0,
    );
  }
}

class Deduction {
  final String name;
  final double amount;
  final String category;

  Deduction({
    required this.name,
    required this.amount,
    required this.category,
  });

  factory Deduction.fromJson(Map<String, dynamic> json) {
    return Deduction(
      name: json['name'] ?? '',
      amount: json['amount']?.toDouble() ?? 0.0,
      category: json['category'] ?? '',
    );
  }
}
