class Loan {
  final String id;
  final String type; // personal, mortgage, auto, student, business
  final String lender;
  final double principal;
  final double interestRate;
  final int termMonths;
  final double monthlyPayment;
  final double totalInterest;
  final double totalAmount;
  final DateTime startDate;
  final DateTime endDate;
  final double remainingBalance;
  final int paymentsMade;
  final String status; // active, paid_off, defaulted

  Loan({
    required this.id,
    required this.type,
    required this.lender,
    required this.principal,
    required this.interestRate,
    required this.termMonths,
    required this.monthlyPayment,
    required this.totalInterest,
    required this.totalAmount,
    required this.startDate,
    required this.endDate,
    required this.remainingBalance,
    required this.paymentsMade,
    required this.status,
  });

  double get progressPercentage => (paymentsMade / termMonths * 100).clamp(0, 100);
  
  int get remainingPayments => termMonths - paymentsMade;

  factory Loan.fromJson(Map<String, dynamic> json) {
    return Loan(
      id: json['id'].toString(),
      type: json['type'] ?? '',
      lender: json['lender'] ?? '',
      principal: json['principal']?.toDouble() ?? 0.0,
      interestRate: json['interest_rate']?.toDouble() ?? 0.0,
      termMonths: json['term_months'] ?? 0,
      monthlyPayment: json['monthly_payment']?.toDouble() ?? 0.0,
      totalInterest: json['total_interest']?.toDouble() ?? 0.0,
      totalAmount: json['total_amount']?.toDouble() ?? 0.0,
      startDate: DateTime.parse(json['start_date'] ?? DateTime.now().toIso8601String()),
      endDate: DateTime.parse(json['end_date'] ?? DateTime.now().toIso8601String()),
      remainingBalance: json['remaining_balance']?.toDouble() ?? 0.0,
      paymentsMade: json['payments_made'] ?? 0,
      status: json['status'] ?? 'active',
    );
  }
}

class LoanCalculation {
  final double loanAmount;
  final double interestRate;
  final int termMonths;
  final double monthlyPayment;
  final double totalInterest;
  final double totalAmount;
  final List<PaymentSchedule> schedule;

  LoanCalculation({
    required this.loanAmount,
    required this.interestRate,
    required this.termMonths,
    required this.monthlyPayment,
    required this.totalInterest,
    required this.totalAmount,
    required this.schedule,
  });

  static LoanCalculation calculate({
    required double principal,
    required double annualRate,
    required int months,
  }) {
    final monthlyRate = annualRate / 100 / 12;
    final monthlyPayment = principal *
        (monthlyRate * pow(1 + monthlyRate, months)) /
        (pow(1 + monthlyRate, months) - 1);

    final totalAmount = monthlyPayment * months;
    final totalInterest = totalAmount - principal;

    // Generate payment schedule
    final schedule = <PaymentSchedule>[];
    double balance = principal;

    for (int i = 1; i <= months; i++) {
      final interestPayment = balance * monthlyRate;
      final principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;

      schedule.add(PaymentSchedule(
        paymentNumber: i,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: balance > 0 ? balance : 0,
      ));
    }

    return LoanCalculation(
      loanAmount: principal,
      interestRate: annualRate,
      termMonths: months,
      monthlyPayment: monthlyPayment,
      totalInterest: totalInterest,
      totalAmount: totalAmount,
      schedule: schedule,
    );
  }
}

class PaymentSchedule {
  final int paymentNumber;
  final double payment;
  final double principal;
  final double interest;
  final double balance;

  PaymentSchedule({
    required this.paymentNumber,
    required this.payment,
    required this.principal,
    required this.interest,
    required this.balance,
  });
}

// Helper function
num pow(num x, num exponent) {
  return x.toDouble().pow(exponent.toInt());
}

extension on double {
  double pow(int exponent) {
    double result = 1;
    for (int i = 0; i < exponent; i++) {
      result *= this;
    }
    return result;
  }
}
