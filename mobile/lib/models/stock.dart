class Stock {
  final String id;
  final String symbol;
  final String name;
  final int shares;
  final double currentPrice;
  final double purchasePrice;
  final double totalValue;
  final double profitLoss;
  final double profitLossPercentage;
  final DateTime purchaseDate;
  final String exchange;

  Stock({
    required this.id,
    required this.symbol,
    required this.name,
    required this.shares,
    required this.currentPrice,
    required this.purchasePrice,
    required this.totalValue,
    required this.profitLoss,
    required this.profitLossPercentage,
    required this.purchaseDate,
    required this.exchange,
  });

  factory Stock.fromJson(Map<String, dynamic> json) {
    return Stock(
      id: json['id'].toString(),
      symbol: json['symbol'] ?? '',
      name: json['name'] ?? '',
      shares: json['shares'] ?? 0,
      currentPrice: json['current_price']?.toDouble() ?? 0.0,
      purchasePrice: json['purchase_price']?.toDouble() ?? 0.0,
      totalValue: json['total_value']?.toDouble() ?? 0.0,
      profitLoss: json['profit_loss']?.toDouble() ?? 0.0,
      profitLossPercentage: json['profit_loss_percentage']?.toDouble() ?? 0.0,
      purchaseDate: DateTime.parse(json['purchase_date'] ?? DateTime.now().toIso8601String()),
      exchange: json['exchange'] ?? '',
    );
  }
}

class StockQuote {
  final String symbol;
  final double price;
  final double change;
  final double changePercentage;
  final double open;
  final double high;
  final double low;
  final double volume;
  final DateTime lastUpdate;

  StockQuote({
    required this.symbol,
    required this.price,
    required this.change,
    required this.changePercentage,
    required this.open,
    required this.high,
    required this.low,
    required this.volume,
    required this.lastUpdate,
  });

  factory StockQuote.fromJson(Map<String, dynamic> json) {
    return StockQuote(
      symbol: json['symbol'] ?? '',
      price: json['price']?.toDouble() ?? 0.0,
      change: json['change']?.toDouble() ?? 0.0,
      changePercentage: json['change_percentage']?.toDouble() ?? 0.0,
      open: json['open']?.toDouble() ?? 0.0,
      high: json['high']?.toDouble() ?? 0.0,
      low: json['low']?.toDouble() ?? 0.0,
      volume: json['volume']?.toDouble() ?? 0.0,
      lastUpdate: DateTime.parse(json['last_update'] ?? DateTime.now().toIso8601String()),
    );
  }
}
