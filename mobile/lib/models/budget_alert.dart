class BudgetAlert {
  final String id;
  final String category;
  final double budgetAmount;
  final double spentAmount;
  final double threshold; // percentage (e.g., 80 means alert at 80%)
  final String severity; // info, warning, critical
  final String message;
  final DateTime createdAt;
  final bool isRead;
  final String? actionUrl;

  BudgetAlert({
    required this.id,
    required this.category,
    required this.budgetAmount,
    required this.spentAmount,
    required this.threshold,
    required this.severity,
    required this.message,
    required this.createdAt,
    this.isRead = false,
    this.actionUrl,
  });

  double get percentageUsed => (spentAmount / budgetAmount * 100).clamp(0, 100);
  
  double get remainingAmount => budgetAmount - spentAmount;

  factory BudgetAlert.fromJson(Map<String, dynamic> json) {
    return BudgetAlert(
      id: json['id'].toString(),
      category: json['category'] ?? '',
      budgetAmount: json['budget_amount']?.toDouble() ?? 0.0,
      spentAmount: json['spent_amount']?.toDouble() ?? 0.0,
      threshold: json['threshold']?.toDouble() ?? 80.0,
      severity: json['severity'] ?? 'info',
      message: json['message'] ?? '',
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
      isRead: json['is_read'] ?? false,
      actionUrl: json['action_url'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'category': category,
      'budget_amount': budgetAmount,
      'spent_amount': spentAmount,
      'threshold': threshold,
      'severity': severity,
      'message': message,
      'created_at': createdAt.toIso8601String(),
      'is_read': isRead,
      'action_url': actionUrl,
    };
  }
}

class AlertSettings {
  final bool enableAlerts;
  final double defaultThreshold;
  final bool emailNotifications;
  final bool pushNotifications;
  final List<String> mutedCategories;

  AlertSettings({
    required this.enableAlerts,
    required this.defaultThreshold,
    required this.emailNotifications,
    required this.pushNotifications,
    required this.mutedCategories,
  });

  factory AlertSettings.fromJson(Map<String, dynamic> json) {
    return AlertSettings(
      enableAlerts: json['enable_alerts'] ?? true,
      defaultThreshold: json['default_threshold']?.toDouble() ?? 80.0,
      emailNotifications: json['email_notifications'] ?? true,
      pushNotifications: json['push_notifications'] ?? true,
      mutedCategories: List<String>.from(json['muted_categories'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'enable_alerts': enableAlerts,
      'default_threshold': defaultThreshold,
      'email_notifications': emailNotifications,
      'push_notifications': pushNotifications,
      'muted_categories': mutedCategories,
    };
  }
}
