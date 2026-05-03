class ExpenseCategory {
  final String id;
  final String name;
  final String icon;
  final String color;
  final String type; // expense, income
  final bool isDefault;
  final double? monthlyBudget;
  final int transactionCount;
  final double totalAmount;
  final String? parentCategoryId;
  final List<ExpenseCategory>? subCategories;

  ExpenseCategory({
    required this.id,
    required this.name,
    required this.icon,
    required this.color,
    required this.type,
    this.isDefault = false,
    this.monthlyBudget,
    this.transactionCount = 0,
    this.totalAmount = 0.0,
    this.parentCategoryId,
    this.subCategories,
  });

  factory ExpenseCategory.fromJson(Map<String, dynamic> json) {
    return ExpenseCategory(
      id: json['id'].toString(),
      name: json['name'] ?? '',
      icon: json['icon'] ?? 'category',
      color: json['color'] ?? '#6C63FF',
      type: json['type'] ?? 'expense',
      isDefault: json['is_default'] ?? false,
      monthlyBudget: json['monthly_budget']?.toDouble(),
      transactionCount: json['transaction_count'] ?? 0,
      totalAmount: json['total_amount']?.toDouble() ?? 0.0,
      parentCategoryId: json['parent_category_id'],
      subCategories: (json['sub_categories'] as List?)
          ?.map((x) => ExpenseCategory.fromJson(x))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'icon': icon,
      'color': color,
      'type': type,
      'is_default': isDefault,
      'monthly_budget': monthlyBudget,
      'transaction_count': transactionCount,
      'total_amount': totalAmount,
      'parent_category_id': parentCategoryId,
      'sub_categories': subCategories?.map((x) => x.toJson()).toList(),
    };
  }
}

class CategoryStatistics {
  final String categoryId;
  final String categoryName;
  final double totalAmount;
  final int transactionCount;
  final double averageAmount;
  final double percentageOfTotal;
  final String trend; // increasing, decreasing, stable

  CategoryStatistics({
    required this.categoryId,
    required this.categoryName,
    required this.totalAmount,
    required this.transactionCount,
    required this.averageAmount,
    required this.percentageOfTotal,
    required this.trend,
  });

  factory CategoryStatistics.fromJson(Map<String, dynamic> json) {
    return CategoryStatistics(
      categoryId: json['category_id'].toString(),
      categoryName: json['category_name'] ?? '',
      totalAmount: json['total_amount']?.toDouble() ?? 0.0,
      transactionCount: json['transaction_count'] ?? 0,
      averageAmount: json['average_amount']?.toDouble() ?? 0.0,
      percentageOfTotal: json['percentage_of_total']?.toDouble() ?? 0.0,
      trend: json['trend'] ?? 'stable',
    );
  }
}
