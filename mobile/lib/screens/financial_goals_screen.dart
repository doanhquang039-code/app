import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/financial_goal.dart';

class FinancialGoalsScreen extends StatefulWidget {
  const FinancialGoalsScreen({super.key});

  @override
  State<FinancialGoalsScreen> createState() => _FinancialGoalsScreenState();
}

class _FinancialGoalsScreenState extends State<FinancialGoalsScreen> {
  final List<FinancialGoal> _goals = [
    FinancialGoal(
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 10000.0,
      currentAmount: 6500.0,
      deadline: DateTime.now().add(const Duration(days: 180)),
      category: 'savings',
      priority: 'high',
      monthlyContribution: 500.0,
      milestones: [
        Milestone(name: '25% Complete', amount: 2500.0, isCompleted: true),
        Milestone(name: '50% Complete', amount: 5000.0, isCompleted: true),
        Milestone(name: '75% Complete', amount: 7500.0, isCompleted: false),
        Milestone(name: '100% Complete', amount: 10000.0, isCompleted: false),
      ],
    ),
    FinancialGoal(
      id: '2',
      name: 'Vacation to Europe',
      targetAmount: 5000.0,
      currentAmount: 2800.0,
      deadline: DateTime.now().add(const Duration(days: 270)),
      category: 'travel',
      priority: 'medium',
      monthlyContribution: 300.0,
      milestones: [
        Milestone(name: 'Flights Booked', amount: 1500.0, isCompleted: true),
        Milestone(name: 'Accommodation', amount: 2500.0, isCompleted: true),
        Milestone(name: 'Activities Budget', amount: 4000.0, isCompleted: false),
        Milestone(name: 'Full Budget', amount: 5000.0, isCompleted: false),
      ],
    ),
    FinancialGoal(
      id: '3',
      name: 'New Car Down Payment',
      targetAmount: 15000.0,
      currentAmount: 4200.0,
      deadline: DateTime.now().add(const Duration(days: 365)),
      category: 'purchase',
      priority: 'high',
      monthlyContribution: 900.0,
      milestones: [
        Milestone(name: '20% Saved', amount: 3000.0, isCompleted: true),
        Milestone(name: '40% Saved', amount: 6000.0, isCompleted: false),
        Milestone(name: '60% Saved', amount: 9000.0, isCompleted: false),
        Milestone(name: '80% Saved', amount: 12000.0, isCompleted: false),
        Milestone(name: 'Goal Reached', amount: 15000.0, isCompleted: false),
      ],
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: '\$');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Financial Goals'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _addNewGoal,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Summary card
            _buildSummaryCard(formatter),
            const SizedBox(height: 24),

            // Goals list
            const Text(
              'Your Goals',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            ..._goals.map((goal) => _buildGoalCard(goal, formatter)),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryCard(NumberFormat formatter) {
    final totalTarget = _goals.fold<double>(0, (sum, g) => sum + g.targetAmount);
    final totalCurrent = _goals.fold<double>(0, (sum, g) => sum + g.currentAmount);
    final overallProgress = (totalCurrent / totalTarget * 100).clamp(0, 100);

    return Card(
      color: const Color(0xFF6C63FF),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const Text(
              'Overall Progress',
              style: TextStyle(
                color: Colors.white70,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              '${overallProgress.toStringAsFixed(1)}%',
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
                _buildSummaryItem('Saved', formatter.format(totalCurrent)),
                _buildSummaryItem('Target', formatter.format(totalTarget)),
                _buildSummaryItem('Goals', '${_goals.length}'),
              ],
            ),
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

  Widget _buildGoalCard(FinancialGoal goal, NumberFormat formatter) {
    final daysRemaining = goal.deadline.difference(DateTime.now()).inDays;
    final monthsRemaining = (daysRemaining / 30).ceil();
    final remaining = goal.targetAmount - goal.currentAmount;

    Color priorityColor;
    switch (goal.priority) {
      case 'high':
        priorityColor = Colors.red;
        break;
      case 'low':
        priorityColor = Colors.blue;
        break;
      default:
        priorityColor = Colors.orange;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: priorityColor.withValues(alpha: 0.2),
          child: Icon(
            _getCategoryIcon(goal.category),
            color: priorityColor,
          ),
        ),
        title: Text(
          goal.name,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),
            LinearProgressIndicator(
              value: goal.progress / 100,
              backgroundColor: Colors.grey[300],
              valueColor: AlwaysStoppedAnimation<Color>(priorityColor),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${formatter.format(goal.currentAmount)} / ${formatter.format(goal.targetAmount)}',
                  style: const TextStyle(fontSize: 12),
                ),
                Text(
                  '${goal.progress.toStringAsFixed(1)}%',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: priorityColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              '$daysRemaining days remaining ($monthsRemaining months)',
              style: const TextStyle(fontSize: 11, color: Colors.grey),
            ),
          ],
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Goal details
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildDetailItem('Remaining', formatter.format(remaining)),
                    _buildDetailItem('Monthly', formatter.format(goal.monthlyContribution)),
                    _buildDetailItem('Priority', goal.priority.toUpperCase()),
                  ],
                ),
                const SizedBox(height: 20),

                // Milestones
                const Text(
                  'Milestones',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                ...goal.milestones.map((milestone) => _buildMilestoneItem(milestone, formatter)),
                const SizedBox(height: 16),

                // Actions
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton.icon(
                      onPressed: () => _editGoal(goal),
                      icon: const Icon(Icons.edit),
                      label: const Text('Edit'),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton.icon(
                      onPressed: () => _contributeToGoal(goal),
                      icon: const Icon(Icons.add),
                      label: const Text('Contribute'),
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

  Widget _buildMilestoneItem(Milestone milestone, NumberFormat formatter) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(
            milestone.isCompleted ? Icons.check_circle : Icons.radio_button_unchecked,
            color: milestone.isCompleted ? Colors.green : Colors.grey,
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              milestone.name,
              style: TextStyle(
                decoration: milestone.isCompleted ? TextDecoration.lineThrough : null,
                color: milestone.isCompleted ? Colors.grey : null,
              ),
            ),
          ),
          Text(
            formatter.format(milestone.amount),
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'savings':
        return Icons.savings;
      case 'travel':
        return Icons.flight;
      case 'purchase':
        return Icons.shopping_cart;
      case 'education':
        return Icons.school;
      case 'investment':
        return Icons.trending_up;
      default:
        return Icons.flag;
    }
  }

  void _addNewGoal() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add New Goal'),
        content: const Text('Goal creation form would go here'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Goal added!')),
              );
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  void _editGoal(FinancialGoal goal) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Edit ${goal.name}'),
        content: const Text('Goal editing form would go here'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Goal updated!')),
              );
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _contributeToGoal(FinancialGoal goal) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Contribute to ${goal.name}'),
        content: const TextField(
          decoration: InputDecoration(
            labelText: 'Amount',
            prefixText: '\$',
          ),
          keyboardType: TextInputType.number,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Contribution added!')),
              );
            },
            child: const Text('Contribute'),
          ),
        ],
      ),
    );
  }
}
