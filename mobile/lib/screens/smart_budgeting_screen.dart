import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/smart_budget.dart';

class SmartBudgetingScreen extends StatefulWidget {
  const SmartBudgetingScreen({super.key});

  @override
  State<SmartBudgetingScreen> createState() => _SmartBudgetingScreenState();
}

class _SmartBudgetingScreenState extends State<SmartBudgetingScreen> {
  bool _isLoading = false;

  // Mock data
  final List<SmartBudget> _budgets = [
    SmartBudget(
      id: '1',
      category: 'Groceries',
      recommendedAmount: 400.0,
      currentAmount: 500.0,
      reason: 'Based on your spending patterns, you can reduce grocery expenses by meal planning and buying in bulk.',
      savingsPotential: 100.0,
      tips: [
        'Create weekly meal plans',
        'Buy generic brands',
        'Use coupons and cashback apps',
        'Shop seasonal produce',
      ],
      priority: 'high',
    ),
    SmartBudget(
      id: '2',
      category: 'Entertainment',
      recommendedAmount: 120.0,
      currentAmount: 150.0,
      reason: 'Your entertainment spending is 25% above average. Consider free alternatives.',
      savingsPotential: 30.0,
      tips: [
        'Use free streaming trials',
        'Attend free community events',
        'Share subscriptions with family',
        'Look for discount days',
      ],
      priority: 'medium',
    ),
    SmartBudget(
      id: '3',
      category: 'Transportation',
      recommendedAmount: 180.0,
      currentAmount: 200.0,
      reason: 'Carpooling or public transport could reduce your transportation costs.',
      savingsPotential: 20.0,
      tips: [
        'Use public transportation',
        'Carpool with colleagues',
        'Combine errands to save fuel',
        'Consider bike for short trips',
      ],
      priority: 'medium',
    ),
    SmartBudget(
      id: '4',
      category: 'Dining Out',
      recommendedAmount: 150.0,
      currentAmount: 250.0,
      reason: 'Dining out expenses are significantly high. Cooking at home can save substantial money.',
      savingsPotential: 100.0,
      tips: [
        'Cook at home 5 days a week',
        'Pack lunch for work',
        'Use restaurant deals and coupons',
        'Limit coffee shop visits',
      ],
      priority: 'high',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: '\$');
    final totalSavings = _budgets.fold<double>(0, (sum, b) => sum + b.savingsPotential);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Smart Budgeting'),
        actions: [
          IconButton(
            icon: const Icon(Icons.auto_fix_high),
            onPressed: _applyAllRecommendations,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Savings potential card
                  Card(
                    color: const Color(0xFF11998E),
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        children: [
                          const Icon(
                            Icons.savings,
                            color: Colors.white,
                            size: 48,
                          ),
                          const SizedBox(height: 12),
                          const Text(
                            'Total Savings Potential',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            formatter.format(totalSavings),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 36,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'per month',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // AI recommendations
                  Row(
                    children: [
                      const Icon(Icons.lightbulb, color: Color(0xFF6C63FF)),
                      const SizedBox(width: 8),
                      const Text(
                        'AI Recommendations',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Budget recommendations
                  ..._budgets.map((budget) => _buildBudgetCard(budget, formatter)),
                ],
              ),
            ),
    );
  }

  Widget _buildBudgetCard(SmartBudget budget, NumberFormat formatter) {
    Color priorityColor;
    IconData priorityIcon;

    switch (budget.priority) {
      case 'high':
        priorityColor = Colors.red;
        priorityIcon = Icons.priority_high;
        break;
      case 'low':
        priorityColor = Colors.blue;
        priorityIcon = Icons.low_priority;
        break;
      default:
        priorityColor = Colors.orange;
        priorityIcon = Icons.warning;
    }

    final difference = budget.currentAmount - budget.recommendedAmount;
    final percentageDiff = (difference / budget.currentAmount * 100);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: priorityColor.withValues(alpha: 0.2),
          child: Icon(priorityIcon, color: priorityColor),
        ),
        title: Text(
          budget.category,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Current', style: TextStyle(fontSize: 11, color: Colors.grey)),
                      Text(
                        formatter.format(budget.currentAmount),
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.arrow_forward, size: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Recommended', style: TextStyle(fontSize: 11, color: Colors.grey)),
                      Text(
                        formatter.format(budget.recommendedAmount),
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.green,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.green.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                'Save ${formatter.format(budget.savingsPotential)} (${percentageDiff.toStringAsFixed(1)}%)',
                style: const TextStyle(
                  color: Colors.green,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ),
          ],
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Why this recommendation?',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(budget.reason),
                const SizedBox(height: 16),
                const Text(
                  'Tips to achieve this:',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                ...budget.tips.map((tip) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(
                            Icons.check_circle,
                            size: 18,
                            color: Colors.green,
                          ),
                          const SizedBox(width: 8),
                          Expanded(child: Text(tip)),
                        ],
                      ),
                    )),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: () => _dismissRecommendation(budget.id),
                      child: const Text('Not Now'),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: () => _applyRecommendation(budget),
                      child: const Text('Apply Budget'),
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

  void _applyRecommendation(SmartBudget budget) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Apply Recommendation'),
        content: Text(
          'Update ${budget.category} budget to \$${budget.recommendedAmount.toStringAsFixed(2)}?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() {
                budget = SmartBudget(
                  id: budget.id,
                  category: budget.category,
                  recommendedAmount: budget.recommendedAmount,
                  currentAmount: budget.recommendedAmount,
                  reason: budget.reason,
                  savingsPotential: 0,
                  tips: budget.tips,
                  priority: budget.priority,
                );
              });
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('${budget.category} budget updated!')),
              );
            },
            child: const Text('Apply'),
          ),
        ],
      ),
    );
  }

  void _dismissRecommendation(String id) {
    setState(() {
      _budgets.removeWhere((b) => b.id == id);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Recommendation dismissed')),
    );
  }

  void _applyAllRecommendations() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Apply All Recommendations'),
        content: const Text(
          'This will update all budget categories to their recommended amounts. Continue?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() {
                _isLoading = true;
              });
              Future.delayed(const Duration(seconds: 1), () {
                if (mounted) {
                  setState(() {
                    _isLoading = false;
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('All budgets updated successfully!')),
                  );
                }
              });
            },
            child: const Text('Apply All'),
          ),
        ],
      ),
    );
  }
}
