class Debt {
  final int? id;
  final String title;
  final String? description;
  final String type; // 'lend' or 'borrow'
  final String personName;
  final String? personPhone;
  final String? personEmail;
  final double totalAmount;
  final double paidAmount;
  final String currency;
  final double? interestRate;
  final DateTime startDate;
  final DateTime? dueDate;
  final String status;
  final bool reminderEnabled;
  final int reminderDaysBefore;
  final String? notes;

  Debt({
    this.id,
    required this.title,
    this.description,
    required this.type,
    required this.personName,
    this.personPhone,
    this.personEmail,
    required this.totalAmount,
    this.paidAmount = 0,
    this.currency = 'VND',
    this.interestRate,
    required this.startDate,
    this.dueDate,
    this.status = 'active',
    this.reminderEnabled = true,
    this.reminderDaysBefore = 3,
    this.notes,
  });

  double get remainingAmount => totalAmount - paidAmount;
  double get progressPercentage => totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  factory Debt.fromJson(Map<String, dynamic> json) {
    return Debt(
      id: json['id'],
      title: json['title'] ?? '',
      description: json['description'],
      type: json['type'] ?? 'borrow',
      personName: json['personName'] ?? '',
      personPhone: json['personPhone'],
      personEmail: json['personEmail'],
      totalAmount: double.tryParse(json['totalAmount']?.toString() ?? '0') ?? 0,
      paidAmount: double.tryParse(json['paidAmount']?.toString() ?? '0') ?? 0,
      currency: json['currency'] ?? 'VND',
      interestRate: json['interestRate'] != null ? double.tryParse(json['interestRate'].toString()) : null,
      startDate: DateTime.tryParse(json['startDate']?.toString() ?? '') ?? DateTime.now(),
      dueDate: json['dueDate'] != null ? DateTime.tryParse(json['dueDate'].toString()) : null,
      status: json['status'] ?? 'active',
      reminderEnabled: json['reminderEnabled'] ?? true,
      reminderDaysBefore: json['reminderDaysBefore'] ?? 3,
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() => {
    'title': title,
    'description': description,
    'type': type,
    'personName': personName,
    'personPhone': personPhone,
    'personEmail': personEmail,
    'totalAmount': totalAmount,
    'paidAmount': paidAmount,
    'currency': currency,
    'interestRate': interestRate,
    'startDate': startDate.toIso8601String(),
    'dueDate': dueDate?.toIso8601String(),
    'status': status,
    'reminderEnabled': reminderEnabled,
    'reminderDaysBefore': reminderDaysBefore,
    'notes': notes,
  };
}

class DebtPayment {
  final int? id;
  final int debtId;
  final double amount;
  final DateTime paymentDate;
  final String? paymentMethod;
  final String? note;

  DebtPayment({
    this.id,
    required this.debtId,
    required this.amount,
    required this.paymentDate,
    this.paymentMethod,
    this.note,
  });

  factory DebtPayment.fromJson(Map<String, dynamic> json) {
    return DebtPayment(
      id: json['id'],
      debtId: json['debtId'] ?? 0,
      amount: double.tryParse(json['amount']?.toString() ?? '0') ?? 0,
      paymentDate: DateTime.tryParse(json['paymentDate']?.toString() ?? '') ?? DateTime.now(),
      paymentMethod: json['paymentMethod'],
      note: json['note'],
    );
  }

  Map<String, dynamic> toJson() => {
    'debtId': debtId,
    'amount': amount,
    'paymentDate': paymentDate.toIso8601String(),
    'paymentMethod': paymentMethod,
    'note': note,
  };
}
