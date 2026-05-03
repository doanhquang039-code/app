class SplitBill {
  final String id;
  final String title;
  final double totalAmount;
  final String currency;
  final DateTime date;
  final String createdBy;
  final List<Participant> participants;
  final String splitMethod; // equal, percentage, custom
  final String category;
  final String? description;
  final String? receiptUrl;
  final bool isSettled;

  SplitBill({
    required this.id,
    required this.title,
    required this.totalAmount,
    required this.currency,
    required this.date,
    required this.createdBy,
    required this.participants,
    required this.splitMethod,
    required this.category,
    this.description,
    this.receiptUrl,
    this.isSettled = false,
  });

  factory SplitBill.fromJson(Map<String, dynamic> json) {
    return SplitBill(
      id: json['id'].toString(),
      title: json['title'] ?? '',
      totalAmount: json['total_amount']?.toDouble() ?? 0.0,
      currency: json['currency'] ?? 'USD',
      date: DateTime.parse(json['date'] ?? DateTime.now().toIso8601String()),
      createdBy: json['created_by'] ?? '',
      participants: (json['participants'] as List?)
              ?.map((x) => Participant.fromJson(x))
              .toList() ??
          [],
      splitMethod: json['split_method'] ?? 'equal',
      category: json['category'] ?? '',
      description: json['description'],
      receiptUrl: json['receipt_url'],
      isSettled: json['is_settled'] ?? false,
    );
  }
}

class Participant {
  final String id;
  final String name;
  final String? email;
  final String? phone;
  final double amountOwed;
  final double amountPaid;
  final bool hasPaid;
  final DateTime? paidDate;

  Participant({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    required this.amountOwed,
    this.amountPaid = 0.0,
    this.hasPaid = false,
    this.paidDate,
  });

  double get balance => amountPaid - amountOwed;

  factory Participant.fromJson(Map<String, dynamic> json) {
    return Participant(
      id: json['id'].toString(),
      name: json['name'] ?? '',
      email: json['email'],
      phone: json['phone'],
      amountOwed: json['amount_owed']?.toDouble() ?? 0.0,
      amountPaid: json['amount_paid']?.toDouble() ?? 0.0,
      hasPaid: json['has_paid'] ?? false,
      paidDate: json['paid_date'] != null ? DateTime.parse(json['paid_date']) : null,
    );
  }
}
