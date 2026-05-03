import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/budget_alert.dart';

class BudgetAlertsScreen extends StatefulWidget {
  const BudgetAlertsScreen({super.key});

  @override
  State<BudgetAlertsScreen> createState() => _BudgetAlertsScreenState();
}

class _BudgetAlertsScreenState extends State<BudgetAlertsScreen> {
  final List<BudgetAlert> _alerts = [
    BudgetAlert(
      id: '1',
      category: 'Dining Out',
      budgetAmount: 300.0,
      spentAmount: 285.0,
      threshold: 80.0,
      severity: 'critical',
      message: 'You\'ve spent 95% of your Dining Out budget!',
      createdAt: DateTime.now().subtract(const Duration(hours: 2)),
    ),
    BudgetAlert(
      id: '2',
      category: 'Entertainment',
      budgetAmount: 200.0,
      spentAmount: 170.0,
      threshold: 80.0,
      severity: 'warning',
      message: 'You\'ve reached 85% of your Entertainment budget.',
      createdAt: DateTime.now().subtract(const Duration(hours: 5)),
    ),
    BudgetAlert(
      id: '3',
      category: 'Shopping',
      budgetAmount: 400.0,
      spentAmount: 280.0,
      threshold: 80.0,
      severity: 'info',
      message: 'You\'re at 70% of your Shopping budget.',
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
      isRead: true,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: '\$');
    final unreadCount = _alerts.where((a) => !a.isRead).length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Budget Alerts'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: _showSettings,
          ),
        ],
      ),
      body: Column(
        children: [
          // Summary banner
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            color: const Color(0xFF6C63FF).withValues(alpha: 0.1),
            child: Row(
              children: [
                const Icon(Icons.notifications_active, color: Color(0xFF6C63FF)),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'You have $unreadCount unread alert${unreadCount != 1 ? 's' : ''}',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                if (unreadCount > 0)
                  TextButton(
                    onPressed: _markAllAsRead,
                    child: const Text('Mark all read'),
                  ),
              ],
            ),
          ),

          // Alerts list
          Expanded(
            child: _alerts.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.check_circle, size: 64, color: Colors.green),
                        SizedBox(height: 16),
                        Text(
                          'No alerts!',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 8),
                        Text(
                          'You\'re staying within your budgets',
                          style: TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _alerts.length,
                    itemBuilder: (context, index) {
                      return _buildAlertCard(_alerts[index], formatter);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildAlertCard(BudgetAlert alert, NumberFormat formatter) {
    Color severityColor;
    IconData severityIcon;

    switch (alert.severity) {
      case 'critical':
        severityColor = Colors.red;
        severityIcon = Icons.error;
        break;
      case 'warning':
        severityColor = Colors.orange;
        severityIcon = Icons.warning;
        break;
      default:
        severityColor = Colors.blue;
        severityIcon = Icons.info;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      color: alert.isRead ? null : severityColor.withValues(alpha: 0.05),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: severityColor.withValues(alpha: 0.2),
          child: Icon(severityIcon, color: severityColor),
        ),
        title: Text(
          alert.category,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(alert.message),
            const SizedBox(height: 8),
            LinearProgressIndicator(
              value: alert.percentageUsed / 100,
              backgroundColor: Colors.grey[300],
              valueColor: AlwaysStoppedAnimation<Color>(severityColor),
            ),
            const SizedBox(height: 4),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${formatter.format(alert.spentAmount)} / ${formatter.format(alert.budgetAmount)}',
                  style: const TextStyle(fontSize: 12),
                ),
                Text(
                  '${alert.percentageUsed.toStringAsFixed(1)}%',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: severityColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              _getTimeAgo(alert.createdAt),
              style: const TextStyle(fontSize: 11, color: Colors.grey),
            ),
          ],
        ),
        trailing: PopupMenuButton(
          itemBuilder: (context) => [
            if (!alert.isRead)
              const PopupMenuItem(
                value: 'read',
                child: Text('Mark as read'),
              ),
            const PopupMenuItem(
              value: 'adjust',
              child: Text('Adjust budget'),
            ),
            const PopupMenuItem(
              value: 'dismiss',
              child: Text('Dismiss'),
            ),
          ],
          onSelected: (value) {
            switch (value) {
              case 'read':
                _markAsRead(alert);
                break;
              case 'adjust':
                _adjustBudget(alert);
                break;
              case 'dismiss':
                _dismissAlert(alert);
                break;
            }
          },
        ),
        onTap: () => _showAlertDetails(alert, formatter),
      ),
    );
  }

  String _getTimeAgo(DateTime dateTime) {
    final difference = DateTime.now().difference(dateTime);
    
    if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }

  void _showAlertDetails(BudgetAlert alert, NumberFormat formatter) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(alert.category),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(alert.message),
            const SizedBox(height: 16),
            _buildDetailRow('Budget', formatter.format(alert.budgetAmount)),
            _buildDetailRow('Spent', formatter.format(alert.spentAmount)),
            _buildDetailRow('Remaining', formatter.format(alert.remainingAmount)),
            _buildDetailRow('Percentage', '${alert.percentageUsed.toStringAsFixed(1)}%'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _adjustBudget(alert);
            },
            child: const Text('Adjust Budget'),
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

  void _markAsRead(BudgetAlert alert) {
    setState(() {
      alert = BudgetAlert(
        id: alert.id,
        category: alert.category,
        budgetAmount: alert.budgetAmount,
        spentAmount: alert.spentAmount,
        threshold: alert.threshold,
        severity: alert.severity,
        message: alert.message,
        createdAt: alert.createdAt,
        isRead: true,
      );
    });
  }

  void _markAllAsRead() {
    setState(() {
      for (var alert in _alerts) {
        // Mark all as read
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('All alerts marked as read')),
    );
  }

  void _adjustBudget(BudgetAlert alert) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Adjust budget for ${alert.category}')),
    );
  }

  void _dismissAlert(BudgetAlert alert) {
    setState(() {
      _alerts.remove(alert);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Alert dismissed')),
    );
  }

  void _showSettings() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Alert Settings'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SwitchListTile(
              title: const Text('Enable Alerts'),
              value: true,
              onChanged: (value) {},
            ),
            SwitchListTile(
              title: const Text('Email Notifications'),
              value: true,
              onChanged: (value) {},
            ),
            SwitchListTile(
              title: const Text('Push Notifications'),
              value: true,
              onChanged: (value) {},
            ),
            ListTile(
              title: const Text('Default Threshold'),
              subtitle: const Text('80%'),
              trailing: const Icon(Icons.edit),
              onTap: () {},
            ),
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
}
