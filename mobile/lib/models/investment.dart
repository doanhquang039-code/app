class Investment {
  final int? id;
  final String name;
  final String type; // stock, crypto, mutual_fund, gold, real_estate, bond, savings_deposit
  final String? symbol;
  final double? quantity;
  final double buyPrice;
  final double? currentPrice;
  final double totalInvested;
  final double? currentValue;
  final double? profitLoss;
  final double? profitLossPercentage;
  final String currency;
  final String? platform;
  final DateTime buyDate;
  final DateTime? sellDate;
  final String status;
  final String? notes;
  final String? icon;

  Investment({
    this.id,
    required this.name,
    required this.type,
    this.symbol,
    this.quantity,
    required this.buyPrice,
    this.currentPrice,
    required this.totalInvested,
    this.currentValue,
    this.profitLoss,
    this.profitLossPercentage,
    this.currency = 'VND',
    this.platform,
    required this.buyDate,
    this.sellDate,
    this.status = 'holding',
    this.notes,
    this.icon,
  });

  factory Investment.fromJson(Map<String, dynamic> json) {
    return Investment(
      id: json['id'],
      name: json['name'] ?? '',
      type: json['type'] ?? 'stock',
      symbol: json['symbol'],
      quantity: json['quantity'] != null ? double.tryParse(json['quantity'].toString()) : null,
      buyPrice: double.tryParse(json['buyPrice']?.toString() ?? '0') ?? 0,
      currentPrice: json['currentPrice'] != null ? double.tryParse(json['currentPrice'].toString()) : null,
      totalInvested: double.tryParse(json['totalInvested']?.toString() ?? '0') ?? 0,
      currentValue: json['currentValue'] != null ? double.tryParse(json['currentValue'].toString()) : null,
      profitLoss: json['profitLoss'] != null ? double.tryParse(json['profitLoss'].toString()) : null,
      profitLossPercentage: json['profitLossPercentage'] != null ? double.tryParse(json['profitLossPercentage'].toString()) : null,
      currency: json['currency'] ?? 'VND',
      platform: json['platform'],
      buyDate: DateTime.tryParse(json['buyDate']?.toString() ?? '') ?? DateTime.now(),
      sellDate: json['sellDate'] != null ? DateTime.tryParse(json['sellDate'].toString()) : null,
      status: json['status'] ?? 'holding',
      notes: json['notes'],
      icon: json['icon'],
    );
  }

  Map<String, dynamic> toJson() => {
    'name': name,
    'type': type,
    'symbol': symbol,
    'quantity': quantity,
    'buyPrice': buyPrice,
    'currentPrice': currentPrice,
    'totalInvested': totalInvested,
    'currentValue': currentValue,
    'currency': currency,
    'platform': platform,
    'buyDate': buyDate.toIso8601String(),
    'sellDate': sellDate?.toIso8601String(),
    'status': status,
    'notes': notes,
    'icon': icon,
  };
}
