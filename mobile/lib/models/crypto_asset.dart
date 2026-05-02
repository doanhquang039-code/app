class CryptoAsset {
  final String id;
  final String symbol;
  final String name;
  final double amount;
  final double currentPrice;
  final double purchasePrice;
  final double totalValue;
  final double profitLoss;
  final double profitLossPercentage;
  final DateTime purchaseDate;
  final String walletAddress;

  CryptoAsset({
    required this.id,
    required this.symbol,
    required this.name,
    required this.amount,
    required this.currentPrice,
    required this.purchasePrice,
    required this.totalValue,
    required this.profitLoss,
    required this.profitLossPercentage,
    required this.purchaseDate,
    required this.walletAddress,
  });

  factory CryptoAsset.fromJson(Map<String, dynamic> json) {
    return CryptoAsset(
      id: json['id'].toString(),
      symbol: json['symbol'] ?? '',
      name: json['name'] ?? '',
      amount: json['amount']?.toDouble() ?? 0.0,
      currentPrice: json['current_price']?.toDouble() ?? 0.0,
      purchasePrice: json['purchase_price']?.toDouble() ?? 0.0,
      totalValue: json['total_value']?.toDouble() ?? 0.0,
      profitLoss: json['profit_loss']?.toDouble() ?? 0.0,
      profitLossPercentage: json['profit_loss_percentage']?.toDouble() ?? 0.0,
      purchaseDate: DateTime.parse(json['purchase_date'] ?? DateTime.now().toIso8601String()),
      walletAddress: json['wallet_address'] ?? '',
    );
  }
}

class CryptoMarketData {
  final String symbol;
  final double price;
  final double change24h;
  final double changePercentage24h;
  final double marketCap;
  final double volume24h;
  final List<PricePoint> priceHistory;

  CryptoMarketData({
    required this.symbol,
    required this.price,
    required this.change24h,
    required this.changePercentage24h,
    required this.marketCap,
    required this.volume24h,
    required this.priceHistory,
  });

  factory CryptoMarketData.fromJson(Map<String, dynamic> json) {
    return CryptoMarketData(
      symbol: json['symbol'] ?? '',
      price: json['price']?.toDouble() ?? 0.0,
      change24h: json['change_24h']?.toDouble() ?? 0.0,
      changePercentage24h: json['change_percentage_24h']?.toDouble() ?? 0.0,
      marketCap: json['market_cap']?.toDouble() ?? 0.0,
      volume24h: json['volume_24h']?.toDouble() ?? 0.0,
      priceHistory: (json['price_history'] as List?)
              ?.map((x) => PricePoint.fromJson(x))
              .toList() ??
          [],
    );
  }
}

class PricePoint {
  final DateTime timestamp;
  final double price;

  PricePoint({
    required this.timestamp,
    required this.price,
  });

  factory PricePoint.fromJson(Map<String, dynamic> json) {
    return PricePoint(
      timestamp: DateTime.parse(json['timestamp'] ?? DateTime.now().toIso8601String()),
      price: json['price']?.toDouble() ?? 0.0,
    );
  }
}
