class Receipt {
  final String id;
  final String merchantName;
  final DateTime date;
  final double totalAmount;
  final String currency;
  final List<ReceiptItem> items;
  final String category;
  final String paymentMethod;
  final String imagePath;
  final bool isProcessed;

  Receipt({
    required this.id,
    required this.merchantName,
    required this.date,
    required this.totalAmount,
    required this.currency,
    required this.items,
    required this.category,
    required this.paymentMethod,
    required this.imagePath,
    this.isProcessed = false,
  });

  factory Receipt.fromJson(Map<String, dynamic> json) {
    return Receipt(
      id: json['id'].toString(),
      merchantName: json['merchant_name'] ?? '',
      date: DateTime.parse(json['date'] ?? DateTime.now().toIso8601String()),
      totalAmount: json['total_amount']?.toDouble() ?? 0.0,
      currency: json['currency'] ?? 'VND',
      items: (json['items'] as List?)
              ?.map((x) => ReceiptItem.fromJson(x))
              .toList() ??
          [],
      category: json['category'] ?? '',
      paymentMethod: json['payment_method'] ?? '',
      imagePath: json['image_path'] ?? '',
      isProcessed: json['is_processed'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'merchant_name': merchantName,
      'date': date.toIso8601String(),
      'total_amount': totalAmount,
      'currency': currency,
      'items': items.map((x) => x.toJson()).toList(),
      'category': category,
      'payment_method': paymentMethod,
      'image_path': imagePath,
      'is_processed': isProcessed,
    };
  }
}

class ReceiptItem {
  final String name;
  final int quantity;
  final double price;
  final double total;

  ReceiptItem({
    required this.name,
    required this.quantity,
    required this.price,
    required this.total,
  });

  factory ReceiptItem.fromJson(Map<String, dynamic> json) {
    return ReceiptItem(
      name: json['name'] ?? '',
      quantity: json['quantity'] ?? 1,
      price: json['price']?.toDouble() ?? 0.0,
      total: json['total']?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'quantity': quantity,
      'price': price,
      'total': total,
    };
  }
}
