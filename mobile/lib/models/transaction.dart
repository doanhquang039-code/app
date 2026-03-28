class Transaction {
  final int id;
  final double amount;
  final String type;
  final String? note;
  final DateTime date;
  final int categoryId;
  final String? categoryName;

  Transaction({
    required this.id,
    required this.amount,
    required this.type,
    this.note,
    required this.date,
    required this.categoryId,
    this.categoryName,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'],
      amount: double.parse(json['amount'].toString()),
      type: json['type'],
      note: json['note'],
      date: DateTime.parse(json['date']),
      categoryId: json['categoryId'],
      categoryName: json['category']?['name'],
    );
  }
}