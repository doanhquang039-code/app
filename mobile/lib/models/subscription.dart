class Subscription {
  final String id;
  final String name;
  final String category; // streaming, software, fitness, news, other
  final double amount;
  final String frequency; // monthly, yearly
  final DateTime startDate;
  final DateTime? nextBillingDate;
  final String paymentMethod;
  final String status; // active, paused, cancelled
  final bool autoRenew;
  final String? description;
  final String? iconUrl;

  Subscription({
    required this.id,
    required this.name,
    required this.category,
    required this.amount,
    required this.frequency,
    required this.startDate,
    this.nextBillingDate,
    required this.paymentMethod,
    required this.status,
    required this.autoRenew,
    this.description,
    this.iconUrl,
  });

  double get yearlyAmount => frequency == 'yearly' ? amount : amount * 12;
  
  int get daysUntilNextBilling => nextBillingDate != null
      ? nextBillingDate!.difference(DateTime.now()).inDays
      : 0;

  factory Subscription.fromJson(Map<String, dynamic> json) {
    return Subscription(
      id: json['id'].toString(),
      name: json['name'] ?? '',
      category: json['category'] ?? 'other',
      amount: json['amount']?.toDouble() ?? 0.0,
      frequency: json['frequency'] ?? 'monthly',
      startDate: DateTime.parse(json['start_date'] ?? DateTime.now().toIso8601String()),
      nextBillingDate: json['next_billing_date'] != null
          ? DateTime.parse(json['next_billing_date'])
          : null,
      paymentMethod: json['payment_method'] ?? '',
      status: json['status'] ?? 'active',
      autoRenew: json['auto_renew'] ?? true,
      description: json['description'],
      iconUrl: json['icon_url'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'category': category,
      'amount': amount,
      'frequency': frequency,
      'start_date': startDate.toIso8601String(),
      'next_billing_date': nextBillingDate?.toIso8601String(),
      'payment_method': paymentMethod,
      'status': status,
      'auto_renew': autoRenew,
      'description': description,
      'icon_url': iconUrl,
    };
  }
}
