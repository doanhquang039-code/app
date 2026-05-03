class BillPayment {
  final String id;
  final String billType; // electricity, water, internet, phone, gas, insurance
  final String provider;
  final String accountNumber;
  final double amount;
  final DateTime dueDate;
  final DateTime? paidDate;
  final String status; // pending, paid, overdue, scheduled
  final bool isRecurring;
  final String? recurringFrequency; // monthly, quarterly, yearly
  final String? notes;

  BillPayment({
    required this.id,
    required this.billType,
    required this.provider,
    required this.accountNumber,
    required this.amount,
    required this.dueDate,
    this.paidDate,
    required this.status,
    this.isRecurring = false,
    this.recurringFrequency,
    this.notes,
  });

  bool get isOverdue => status == 'overdue' || (status == 'pending' && DateTime.now().isAfter(dueDate));
  int get daysUntilDue => dueDate.difference(DateTime.now()).inDays;

  factory BillPayment.fromJson(Map<String, dynamic> json) {
    return BillPayment(
      id: json['id'].toString(),
      billType: json['bill_type'] ?? '',
      provider: json['provider'] ?? '',
      accountNumber: json['account_number'] ?? '',
      amount: json['amount']?.toDouble() ?? 0.0,
      dueDate: DateTime.parse(json['due_date'] ?? DateTime.now().toIso8601String()),
      paidDate: json['paid_date'] != null ? DateTime.parse(json['paid_date']) : null,
      status: json['status'] ?? 'pending',
      isRecurring: json['is_recurring'] ?? false,
      recurringFrequency: json['recurring_frequency'],
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'bill_type': billType,
      'provider': provider,
      'account_number': accountNumber,
      'amount': amount,
      'due_date': dueDate.toIso8601String(),
      'paid_date': paidDate?.toIso8601String(),
      'status': status,
      'is_recurring': isRecurring,
      'recurring_frequency': recurringFrequency,
      'notes': notes,
    };
  }
}

class BillCategory {
  final String type;
  final String name;
  final String icon;
  final int count;
  final double totalAmount;

  BillCategory({
    required this.type,
    required this.name,
    required this.icon,
    required this.count,
    required this.totalAmount,
  });
}
