import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/expense_category.dart';

class CategoryManagerScreen extends StatefulWidget {
  const CategoryManagerScreen({super.key});

  @override
  State<CategoryManagerScreen> createState() => _CategoryManagerScreenState();
}

class _CategoryManagerScreenState extends State<CategoryManagerScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final List<ExpenseCategory> _categories = [
    ExpenseCategory(
      id: '1',
      name: 'Groceries',
      icon: 'shopping_cart',
      color: '#11998E',
      type: 'expense',
      isDefault: true,
      monthlyBudget: 500.0,
      transactionCount: 45,
      totalAmount: 450.0,
    ),
    ExpenseCategory(
      id: '2',
      name: 'Transportation',
      icon: 'directions_car',
      color: '#6C63FF',
      type: 'expense',
      isDefault: true,
      monthlyBudget: 200.0,
      transactionCount: 28,
      totalAmount: 185.0,
    ),
    ExpenseCategory(
      id: '3',
      name: 'Entertainment',
      icon: 'movie',
      color: '#EB5757',
      type: 'expense',
      monthlyBudget: 150.0,
      transactionCount: 12,
      totalAmount: 120.0,
    ),
    ExpenseCategory(
      id: '4',
      name: 'Salary',
      icon: 'attach_money',
      color: '#38EF7D',
      type: 'income',
      isDefault: true,
      transactionCount: 2,
      totalAmount: 5000.0,
    ),
    ExpenseCategory(
      id: '5',
      name: 'Freelance',
      icon: 'work',
      color: '#8E2DE2',
      type: 'income',
      transactionCount: 5,
      totalAmount: 1200.0,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Category Manager'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Expense'),
            Tab(text: 'Income'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _addCategory,
          ),
        ],
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildCategoryList('expense'),
          _buildCategoryList('income'),
        ],
      ),
    );
  }

  Widget _buildCategoryList(String type) {
    final categories = _categories.where((c) => c.type == type).toList();
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: '\$');

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: categories.length,
      itemBuilder: (context, index) {
        return _buildCategoryCard(categories[index], formatter);
      },
    );
  }

  Widget _buildCategoryCard(ExpenseCategory category, NumberFormat formatter) {
    final budgetUsage = category.monthlyBudget != null
        ? (category.totalAmount / category.monthlyBudget! * 100).clamp(0, 100)
        : 0.0;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: Color(int.parse(category.color.replaceFirst('#', '0xFF'))).withValues(alpha: 0.2),
          child: Icon(
            _getIconData(category.icon),
            color: Color(int.parse(category.color.replaceFirst('#', '0xFF'))),
          ),
        ),
        title: Row(
          children: [
            Text(
              category.name,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            if (category.isDefault) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.blue.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  'DEFAULT',
                  style: TextStyle(
                    fontSize: 9,
                    color: Colors.blue,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ],
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text('${category.transactionCount} transactions'),
            Text(
              formatter.format(category.totalAmount),
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            if (category.monthlyBudget != null) ...[
              const SizedBox(height: 8),
              LinearProgressIndicator(
                value: budgetUsage / 100,
                backgroundColor: Colors.grey[300],
                valueColor: AlwaysStoppedAnimation<Color>(
                  budgetUsage > 90 ? Colors.red : budgetUsage > 75 ? Colors.orange : Colors.green,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Budget: ${formatter.format(category.monthlyBudget)} (${budgetUsage.toStringAsFixed(0)}% used)',
                style: const TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ],
          ],
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildStatItem('Transactions', '${category.transactionCount}'),
                    _buildStatItem('Total', formatter.format(category.totalAmount)),
                    if (category.monthlyBudget != null)
                      _buildStatItem('Budget', formatter.format(category.monthlyBudget!)),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    if (!category.isDefault)
                      TextButton.icon(
                        onPressed: () => _deleteCategory(category),
                        icon: const Icon(Icons.delete, color: Colors.red),
                        label: const Text('Delete', style: TextStyle(color: Colors.red)),
                      ),
                    const SizedBox(width: 8),
                    ElevatedButton.icon(
                      onPressed: () => _editCategory(category),
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

  Widget _buildStatItem(String label, String value) {
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

  IconData _getIconData(String iconName) {
    switch (iconName) {
      case 'shopping_cart':
        return Icons.shopping_cart;
      case 'directions_car':
        return Icons.directions_car;
      case 'movie':
        return Icons.movie;
      case 'attach_money':
        return Icons.attach_money;
      case 'work':
        return Icons.work;
      case 'restaurant':
        return Icons.restaurant;
      case 'home':
        return Icons.home;
      case 'health':
        return Icons.local_hospital;
      default:
        return Icons.category;
    }
  }

  void _addCategory() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Category'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              decoration: const InputDecoration(
                labelText: 'Category Name',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(
                labelText: 'Type',
                border: OutlineInputBorder(),
              ),
              items: const [
                DropdownMenuItem(value: 'expense', child: Text('Expense')),
                DropdownMenuItem(value: 'income', child: Text('Income')),
              ],
              onChanged: (value) {},
            ),
            const SizedBox(height: 16),
            TextField(
              decoration: const InputDecoration(
                labelText: 'Monthly Budget (Optional)',
                prefixText: '\$',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
          ],
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
                const SnackBar(content: Text('Category added!')),
              );
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  void _editCategory(ExpenseCategory category) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Edit ${category.name}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              decoration: InputDecoration(
                labelText: 'Category Name',
                border: const OutlineInputBorder(),
              ),
              controller: TextEditingController(text: category.name),
            ),
            const SizedBox(height: 16),
            TextField(
              decoration: InputDecoration(
                labelText: 'Monthly Budget',
                prefixText: '\$',
                border: const OutlineInputBorder(),
              ),
              controller: TextEditingController(
                text: category.monthlyBudget?.toString() ?? '',
              ),
              keyboardType: TextInputType.number,
            ),
          ],
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
                const SnackBar(content: Text('Category updated!')),
              );
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _deleteCategory(ExpenseCategory category) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Category'),
        content: Text('Are you sure you want to delete "${category.name}"? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            onPressed: () {
              Navigator.pop(context);
              setState(() {
                _categories.remove(category);
              });
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Category deleted!')),
              );
            },
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}
