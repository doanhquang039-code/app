import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/subscription.dart';

class SubscriptionManagerScreen extends StatefulWidget {
  const SubscriptionManagerScreen({super.key});

  @override
  State<SubscriptionManagerScreen> createState() => _SubscriptionManagerScreenState();
}

class _SubscriptionManagerScreenState extends State<SubscriptionManagerScreen> {
  final List<Subscription> _subscriptions = [
    Subscription(
      id: '1',
      name: 'Netflix',
      category: 'streaming',
      amount: 15.99,
      frequency: 'monthly',
      startDate: DateTime(2024, 1, 1),
      nextBillingDate: DateTime.now().add(const Duration(days: 15)),
      paymentMethod: 'Credit Card',
      status: 'active',
      autoRenew: true,
      description: 'Premium plan with 4K streaming',
    ),
    Subscription(
      id: '2',
      name: 'Spotify',
      category: 'streaming',
      amount: 9.99,
      frequency: 'monthly',
      startDate: DateTime(2023, 6, 1),
      nextBillingDate: DateTime.now().add(const Duration(days: 8)),
      paymentMethod: 'PayPal',
      status: 'active',
      autoRenew: true,
    ),
    Subscription(
      id: '3',
      name: 'Adobe Creative Cloud',
      category: 'software',
      amount: 52.99,
      frequency: 'monthly',
      startDate: DateTime(2024, 2, 1),
      nextBillingDate: DateTime.now().add(const Duration(days: 22)),
      paymentMethod: 'Credit Card',
      status: 'active',
      autoRenew: true,
    ),
    Subscription(
      id: '4',
      name: 'Planet Fitness',
      category: 'fitness',
      amount: 22.99,
      frequency: 'monthly',
      startDate: DateTime(2023, 9, 1),
      nextBillingDate: DateTime.now().add(const Duration(days: 5)),
      paymentMethod: 'Bank Account',
      status: 'active',
      autoRenew: true,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: '\$');
    final monthlyTotal = _subscriptions.where((s) => s.status == 'active').fold<double>(0, (sum, s) => sum + s.amount);
    final yearlyTotal = _subscriptions.where((s) => s.status == 'active').fold<double>(0, (sum, s) => sum + s.yearlyAmount);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Subscription Manager'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _addSubscription,
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
              color: const Color(0xFF8E2DE2),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    const Text(
                      'Monthly Total',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      formatter.format(monthlyTotal),
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
                        _buildSummaryItem('Yearly', formatter.format(yearlyTotal)),
                        _buildSummaryItem('Active', '${_subscriptions.where((s) => s.status == 'active').length}'),
                        _buildSummaryItem('Total', '${_subscriptions.length}'),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Upcoming bills
            const Text(
              'Upcoming Bills',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            ...() {
              final sorted = _subscriptions
                  .where((s) => s.status == 'active')
                  .toList()
                ..sort((a, b) => a.daysUntilNextBilling.compareTo(b.daysUntilNextBilling));
              return sorted.map((sub) => _buildSubscriptionCard(sub, formatter));
            }(),
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

  Widget _buildSubscriptionCard(Subscription sub, NumberFormat formatter) {
    final isDueSoon = sub.daysUntilNextBilling <= 7;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: _getCategoryColor(sub.category).withValues(alpha: 0.2),
          child: Icon(_getCategoryIcon(sub.category), color: _getCategoryColor(sub.category)),
        ),
        title: Text(
          sub.name,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text('${formatter.format(sub.amount)}/${sub.frequency}'),
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(
                  Icons.calendar_today,
                  size: 12,
                  color: isDueSoon ? Colors.orange : Colors.grey,
                ),
                const SizedBox(width: 4),
                Text(
                  'Due in ${sub.daysUntilNextBilling} days',
                  style: TextStyle(
                    fontSize: 12,
                    color: isDueSoon ? Colors.orange : Colors.grey,
                    fontWeight: isDueSoon ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ],
            ),
          ],
        ),
        trailing: PopupMenuButton(
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'edit',
              child: Text('Edit'),
            ),
            const PopupMenuItem(
              value: 'pause',
              child: Text('Pause'),
            ),
            const PopupMenuItem(
              value: 'cancel',
              child: Text('Cancel'),
            ),
          ],
          onSelected: (value) {
            switch (value) {
              case 'edit':
                _editSubscription(sub);
                break;
              case 'pause':
                _pauseSubscription(sub);
                break;
              case 'cancel':
                _cancelSubscription(sub);
                break;
            }
          },
        ),
        onTap: () => _showSubscriptionDetails(sub, formatter),
      ),
    );
  }

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'streaming':
        return Icons.play_circle;
      case 'software':
        return Icons.computer;
      case 'fitness':
        return Icons.fitness_center;
      case 'news':
        return Icons.newspaper;
      default:
        return Icons.subscriptions;
    }
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'streaming':
        return const Color(0xFFEB5757);
      case 'software':
        return const Color(0xFF6C63FF);
      case 'fitness':
        return const Color(0xFF11998E);
      case 'news':
        return const Color(0xFF8E2DE2);
      default:
        return const Color(0xFF2C5364);
    }
  }

  void _showSubscriptionDetails(Subscription sub, NumberFormat formatter) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(sub.name),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildDetailRow('Amount', '${formatter.format(sub.amount)}/${sub.frequency}'),
            _buildDetailRow('Yearly Cost', formatter.format(sub.yearlyAmount)),
            _buildDetailRow('Payment Method', sub.paymentMethod),
            _buildDetailRow('Auto Renew', sub.autoRenew ? 'Yes' : 'No'),
            _buildDetailRow('Next Billing', DateFormat('MMM dd, yyyy').format(sub.nextBillingDate!)),
            if (sub.description != null) ...[
              const SizedBox(height: 8),
              Text(sub.description!, style: const TextStyle(fontSize: 12, color: Colors.grey)),
            ],
          ],
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

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  void _addSubscription() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Add subscription form would open here')),
    );
  }

  void _editSubscription(Subscription sub) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Edit ${sub.name}')),
    );
  }

  void _pauseSubscription(Subscription sub) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('${sub.name} paused')),
    );
  }

  void _cancelSubscription(Subscription sub) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Subscription'),
        content: Text('Are you sure you want to cancel ${sub.name}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('No'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('${sub.name} cancelled')),
              );
            },
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );
  }
}
