class BankAccount {
  final int id;
  final String bankName;
  final String accountNumber;
  final String accountHolder;
  final String? accountType;
  final double balance;
  final String? branchCode;
  final String? ifscCode;
  final String? routingNumber;
  final String? swiftCode;
  final String? icon;
  final bool isActive;
  final int? linkedWalletId;

  BankAccount({
    required this.id,
    required this.bankName,
    required this.accountNumber,
    required this.accountHolder,
    this.accountType,
    required this.balance,
    this.branchCode,
    this.ifscCode,
    this.routingNumber,
    this.swiftCode,
    this.icon,
    required this.isActive,
    this.linkedWalletId,
  });

  factory BankAccount.fromJson(Map<String, dynamic> json) => BankAccount(
        id: json['id'],
        bankName: json['bankName'] ?? '',
        accountNumber: json['accountNumber'] ?? '',
        accountHolder: json['accountHolder'] ?? '',
        accountType: json['accountType'],
        balance: double.tryParse(json['balance']?.toString() ?? '0') ?? 0,
        branchCode: json['branchCode'],
        ifscCode: json['ifscCode'],
        routingNumber: json['routingNumber'],
        swiftCode: json['swiftCode'],
        icon: json['icon'],
        isActive: json['isActive'] ?? true,
        linkedWalletId: json['linkedWalletId'],
      );

  Map<String, dynamic> toJson() => {
        'bankName': bankName,
        'accountNumber': accountNumber,
        'accountHolder': accountHolder,
        'accountType': accountType,
        'balance': balance,
        'branchCode': branchCode,
        'ifscCode': ifscCode,
        'routingNumber': routingNumber,
        'swiftCode': swiftCode,
        'icon': icon,
        'isActive': isActive,
        'linkedWalletId': linkedWalletId,
      };
}
