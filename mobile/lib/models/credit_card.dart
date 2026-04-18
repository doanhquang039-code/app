class CreditCardModel {
  final int id;
  final String cardholderName;
  final String cardNumber;
  final String cardType;
  final String issuingBank;
  final int expiryMonth;
  final int expiryYear;
  final double creditLimit;
  final double currentBalance;
  final double? interestRate;
  final int? billingCycleDayOfMonth;
  final String? icon;
  final bool isActive;
  final int? linkedWalletId;

  CreditCardModel({
    required this.id,
    required this.cardholderName,
    required this.cardNumber,
    required this.cardType,
    required this.issuingBank,
    required this.expiryMonth,
    required this.expiryYear,
    required this.creditLimit,
    required this.currentBalance,
    this.interestRate,
    this.billingCycleDayOfMonth,
    this.icon,
    required this.isActive,
    this.linkedWalletId,
  });

  double get availableCredit => creditLimit - currentBalance;
  double get utilizationPercent =>
      creditLimit > 0 ? (currentBalance / creditLimit * 100) : 0;

  factory CreditCardModel.fromJson(Map<String, dynamic> json) =>
      CreditCardModel(
        id: json['id'],
        cardholderName: json['cardholderName'] ?? '',
        cardNumber: json['cardNumber'] ?? '',
        cardType: json['cardType'] ?? 'Visa',
        issuingBank: json['issuingBank'] ?? '',
        expiryMonth: json['expiryMonth'] ?? 1,
        expiryYear: json['expiryYear'] ?? 2026,
        creditLimit:
            double.tryParse(json['creditLimit']?.toString() ?? '0') ?? 0,
        currentBalance:
            double.tryParse(json['currentBalance']?.toString() ?? '0') ?? 0,
        interestRate:
            double.tryParse(json['interestRate']?.toString() ?? '0'),
        billingCycleDayOfMonth: json['billingCycleDayOfMonth'],
        icon: json['icon'],
        isActive: json['isActive'] ?? true,
        linkedWalletId: json['linkedWalletId'],
      );

  Map<String, dynamic> toJson() => {
        'cardholderName': cardholderName,
        'cardNumber': cardNumber,
        'cardType': cardType,
        'issuingBank': issuingBank,
        'expiryMonth': expiryMonth,
        'expiryYear': expiryYear,
        'creditLimit': creditLimit,
        'currentBalance': currentBalance,
        'interestRate': interestRate,
        'billingCycleDayOfMonth': billingCycleDayOfMonth,
        'icon': icon,
        'isActive': isActive,
        'linkedWalletId': linkedWalletId,
      };
}
