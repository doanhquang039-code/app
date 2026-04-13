class Wallet {
  final int id;
  final String name;
  final double balance;
  final String? icon;
  final String? color;
  final String currency;
  final bool isDefault;

  Wallet({
    required this.id,
    required this.name,
    required this.balance,
    this.icon,
    this.color,
    required this.currency,
    required this.isDefault,
  });

  factory Wallet.fromJson(Map<String, dynamic> json) => Wallet(
        id: json['id'],
        name: json['name'] ?? '',
        balance: double.tryParse(json['balance']?.toString() ?? '0') ?? 0,
        icon: json['icon'],
        color: json['color'],
        currency: json['currency'] ?? 'VND',
        isDefault: json['isDefault'] ?? false,
      );

  Map<String, dynamic> toJson() => {
        'name': name,
        'balance': balance,
        'icon': icon,
        'color': color,
        'currency': currency,
        'isDefault': isDefault,
      };
}
