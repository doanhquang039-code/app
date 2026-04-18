class SharedExpenseGroup {
  final int id;
  final String groupName;
  final String? description;
  final double totalAmount;
  final String? icon;
  final bool isActive;
  final List<SharedExpense> expenses;
  final int memberCount;

  SharedExpenseGroup({
    required this.id,
    required this.groupName,
    this.description,
    required this.totalAmount,
    this.icon,
    required this.isActive,
    this.expenses = const [],
    this.memberCount = 0,
  });

  factory SharedExpenseGroup.fromJson(Map<String, dynamic> json) =>
      SharedExpenseGroup(
        id: json['id'],
        groupName: json['groupName'] ?? '',
        description: json['description'],
        totalAmount:
            double.tryParse(json['totalAmount']?.toString() ?? '0') ?? 0,
        icon: json['icon'],
        isActive: json['isActive'] ?? true,
        expenses: json['expenses'] != null
            ? (json['expenses'] as List)
                .map((e) => SharedExpense.fromJson(e))
                .toList()
            : [],
        memberCount: json['members']?.length ?? json['memberCount'] ?? 0,
      );
}

class SharedExpense {
  final int id;
  final int groupId;
  final int paidByUserId;
  final String description;
  final double amount;
  final String? splits;
  final DateTime? date;
  final String? paidByName;

  SharedExpense({
    required this.id,
    required this.groupId,
    required this.paidByUserId,
    required this.description,
    required this.amount,
    this.splits,
    this.date,
    this.paidByName,
  });

  factory SharedExpense.fromJson(Map<String, dynamic> json) => SharedExpense(
        id: json['id'],
        groupId: json['groupId'] ?? 0,
        paidByUserId: json['paidByUserId'] ?? 0,
        description: json['description'] ?? '',
        amount: double.tryParse(json['amount']?.toString() ?? '0') ?? 0,
        splits: json['splits'],
        date:
            json['date'] != null ? DateTime.tryParse(json['date']) : null,
        paidByName: json['paidByUser']?['email'],
      );
}
