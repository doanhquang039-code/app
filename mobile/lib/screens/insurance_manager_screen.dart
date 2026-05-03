import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/insurance.dart';

class InsuranceManagerScreen extends StatefulWidget {
  const InsuranceManagerScreen({super.key});

  @override
  State<InsuranceManagerScreen> createState() => _InsuranceManagerScreenState();
}

class _InsuranceManagerScreenState extends State<InsuranceManagerScreen> {
  // Mock data
  final List<Insurance> _insurances = [
    Insurance(
      id: '1',
      type: 'health',
      provider: 'Blue Cross Blue Shield',
      policyNumber: 'BCBS-2024-001',
      premium: 450.0,
      frequency: 'monthly',
      coverageAmount: 500000.0,
      startDate: DateTime(2024, 1, 1),
      endDate: DateTime(2025, 12, 31),
      status: 'active',
      beneficiaries: [
        Beneficiary(name: 'Jane Doe', relationship: 'Spouse', percentage: 100),
      ],
      documents: ['policy.pdf', 'terms.pdf'],
    ),
    Insurance(
      id: '2',
      type: 'auto',
      provider: 'State Farm',
      policyNumber: 'SF-AUTO-2024-456',
      premium: 120.0,
      frequency: 'monthly',
      coverageAmount: 100000.0,
      startDate: DateTime(2024, 3, 1),
      endDate: DateTime(2025, 2, 28),
      status: 'active',
      beneficiaries: [],
      documents: ['auto_policy.pdf'],
    ),
    Insurance(
      id: '3',
      type: 'life',
      provider: 'MetLife',
      policyNumber: 'ML-LIFE-2023-789',
      premium: 85.0,
      frequency: 'monthly',
      coverageAmount: 1000000.0,
      startDate: DateTime(2023, 6, 1),
      endDate: DateTime(2043, 5, 31),
      status: 'active',
      beneficiaries: [
        Beneficiary(name: 'Jane Doe', relationship: 'Spouse', percentage: 60),
        Beneficiary(name: 'John Doe Jr', relationship: 'Child', percentage: 40),
      ],
      documents: ['life_policy.pdf', 'beneficiary_form.pdf'],
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: '\$');
    final totalPremium = _insurances.fold<double>(0, (sum, i) => sum + i.premium);
    final totalCoverage = _insurances.fold<double>(0, (sum, i) => sum + i.coverageAmount);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Insurance Manager'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _addInsurance,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Summary card
            Card(
              color: const Color(0xFF6C63FF),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    const Text(
                      'Total Coverage',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      formatter.format(totalCoverage),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildSummaryItem('Policies', '${_insurances.length}'),
                        _buildSummaryItem('Monthly Premium', formatter.format(totalPremium)),
                        _buildSummaryItem('Active', '${_insurances.where((i) => i.isActive).length}'),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Insurance list
            const Text(
              'Your Policies',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            ..._insurances.map((insurance) => _buildInsuranceCard(insurance, formatter)),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryItem(String label, String value) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 12,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildInsuranceCard(Insurance insurance, NumberFormat formatter) {
    final isExpiringSoon = insurance.daysUntilExpiry < 60;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: _getTypeColor(insurance.type).withValues(alpha: 0.2),
          child: Icon(_getTypeIcon(insurance.type), color: _getTypeColor(insurance.type)),
        ),
        title: Text(
          insurance.provider,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text('${_getTypeName(insurance.type)} Insurance'),
            Text('Policy: ${insurance.policyNumber}'),
            const SizedBox(height: 4),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: insurance.isActive ? Colors.green.withValues(alpha: 0.1) : Colors.grey.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    insurance.status.toUpperCase(),
                    style: TextStyle(
                      color: insurance.isActive ? Colors.green : Colors.grey,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                if (isExpiringSoon) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.orange.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      'Expires in ${insurance.daysUntilExpiry} days',
                      style: const TextStyle(
                        color: Colors.orange,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Coverage details
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildDetailItem('Coverage', formatter.format(insurance.coverageAmount)),
                    _buildDetailItem('Premium', '${formatter.format(insurance.premium)}/${insurance.frequency}'),
                    _buildDetailItem('Documents', '${insurance.documents.length}'),
                  ],
                ),
                const SizedBox(height: 16),

                // Dates
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Start Date', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        Text(
                          DateFormat('MMM dd, yyyy').format(insurance.startDate),
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        const Text('End Date', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        Text(
                          DateFormat('MMM dd, yyyy').format(insurance.endDate),
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ],
                ),

                // Beneficiaries
                if (insurance.beneficiaries.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  const Text(
                    'Beneficiaries',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  ...insurance.beneficiaries.map((b) => Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('${b.name} (${b.relationship})'),
                            Text(
                              '${b.percentage.toStringAsFixed(0)}%',
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      )),
                ],

                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton.icon(
                      onPressed: () => _viewDocuments(insurance),
                      icon: const Icon(Icons.description),
                      label: const Text('Documents'),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton.icon(
                      onPressed: () => _editInsurance(insurance),
                      icon: const Icon(Icons.edit),
                      label: const Text('Edit'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailItem(String label, String value) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  IconData _getTypeIcon(String type) {
    switch (type) {
      case 'health':
        return Icons.local_hospital;
      case 'auto':
        return Icons.directions_car;
      case 'life':
        return Icons.favorite;
      case 'home':
        return Icons.home;
      case 'travel':
        return Icons.flight;
      default:
        return Icons.shield;
    }
  }

  Color _getTypeColor(String type) {
    switch (type) {
      case 'health':
        return const Color(0xFF11998E);
      case 'auto':
        return const Color(0xFF6C63FF);
      case 'life':
        return const Color(0xFFEB5757);
      case 'home':
        return const Color(0xFF8E2DE2);
      case 'travel':
        return const Color(0xFF38EF7D);
      default:
        return const Color(0xFF2C5364);
    }
  }

  String _getTypeName(String type) {
    return type[0].toUpperCase() + type.substring(1);
  }

  void _addInsurance() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Insurance'),
        content: const Text('Insurance form would go here'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Insurance added!')),
              );
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  void _editInsurance(Insurance insurance) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Edit ${insurance.provider}'),
        content: const Text('Edit form would go here'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Insurance updated!')),
              );
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _viewDocuments(Insurance insurance) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Documents'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: insurance.documents
              .map((doc) => ListTile(
                    leading: const Icon(Icons.description),
                    title: Text(doc),
                    trailing: IconButton(
                      icon: const Icon(Icons.download),
                      onPressed: () {},
                    ),
                  ))
              .toList(),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}
