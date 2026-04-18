class Currency {
  final int id;
  final String code;
  final String name;
  final String symbol;
  final double exchangeRate;
  final String? icon;
  final bool isActive;

  Currency({
    required this.id,
    required this.code,
    required this.name,
    required this.symbol,
    required this.exchangeRate,
    this.icon,
    required this.isActive,
  });

  factory Currency.fromJson(Map<String, dynamic> json) => Currency(
        id: json['id'],
        code: json['code'] ?? '',
        name: json['name'] ?? '',
        symbol: json['symbol'] ?? '',
        exchangeRate:
            double.tryParse(json['exchangeRate']?.toString() ?? '1') ?? 1,
        icon: json['icon'],
        isActive: json['isActive'] ?? true,
      );
}
