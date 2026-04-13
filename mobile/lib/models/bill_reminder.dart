class BillReminder {
  final int id;
  final String name;
  final double amount;
  final DateTime dueDate;
  final bool isPaid;
  final String? frequency;
  final String? category;
  final String? note;

  BillReminder({
    required this.id,
    required this.name,
    required this.amount,
    required this.dueDate,
    required this.isPaid,
    this.frequency,
    this.category,
    this.note,
  });

  bool get isOverdue => !isPaid && dueDate.isBefore(DateTime.now());
  bool get isDueSoon =>
      !isPaid &&
      !isOverdue &&
      dueDate.isBefore(DateTime.now().add(const Duration(days: 3)));

  factory BillReminder.fromJson(Map<String, dynamic> json) => BillReminder(
        id: json['id'],
        name: json['name'] ?? '',
        amount: double.tryParse(json['amount']?.toString() ?? '0') ?? 0,
        dueDate: json['dueDate'] != null
            ? DateTime.parse(json['dueDate'])
            : DateTime.now(),
        isPaid: json['isPaid'] ?? false,
        frequency: json['frequency'],
        category: json['category'],
        note: json['note'],
      );
}
