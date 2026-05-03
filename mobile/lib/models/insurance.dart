class Insurance {
  final String id;
  final String type; // life, health, auto, home, travel
  final String provider;
  final String policyNumber;
  final double premium;
  final String frequency; // monthly, quarterly, yearly
  final double coverageAmount;
  final DateTime startDate;
  final DateTime endDate;
  final String status; // active, expired, cancelled
  final List<Beneficiary> beneficiaries;
  final List<String> documents;

  Insurance({
    required this.id,
    required this.type,
    required this.provider,
    required this.policyNumber,
    required this.premium,
    required this.frequency,
    required this.coverageAmount,
    required this.startDate,
    required this.endDate,
    required this.status,
    required this.beneficiaries,
    required this.documents,
  });

  bool get isActive => status == 'active' && DateTime.now().isBefore(endDate);
  
  int get daysUntilExpiry => endDate.difference(DateTime.now()).inDays;

  factory Insurance.fromJson(Map<String, dynamic> json) {
    return Insurance(
      id: json['id'].toString(),
      type: json['type'] ?? '',
      provider: json['provider'] ?? '',
      policyNumber: json['policy_number'] ?? '',
      premium: json['premium']?.toDouble() ?? 0.0,
      frequency: json['frequency'] ?? 'monthly',
      coverageAmount: json['coverage_amount']?.toDouble() ?? 0.0,
      startDate: DateTime.parse(json['start_date'] ?? DateTime.now().toIso8601String()),
      endDate: DateTime.parse(json['end_date'] ?? DateTime.now().toIso8601String()),
      status: json['status'] ?? 'active',
      beneficiaries: (json['beneficiaries'] as List?)
              ?.map((x) => Beneficiary.fromJson(x))
              .toList() ??
          [],
      documents: List<String>.from(json['documents'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'provider': provider,
      'policy_number': policyNumber,
      'premium': premium,
      'frequency': frequency,
      'coverage_amount': coverageAmount,
      'start_date': startDate.toIso8601String(),
      'end_date': endDate.toIso8601String(),
      'status': status,
      'beneficiaries': beneficiaries.map((x) => x.toJson()).toList(),
      'documents': documents,
    };
  }
}

class Beneficiary {
  final String name;
  final String relationship;
  final double percentage;

  Beneficiary({
    required this.name,
    required this.relationship,
    required this.percentage,
  });

  factory Beneficiary.fromJson(Map<String, dynamic> json) {
    return Beneficiary(
      name: json['name'] ?? '',
      relationship: json['relationship'] ?? '',
      percentage: json['percentage']?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'relationship': relationship,
      'percentage': percentage,
    };
  }
}
