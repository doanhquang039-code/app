import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/tax_calculation.dart';

class TaxCalculatorScreen extends StatefulWidget {
  const TaxCalculatorScreen({super.key});

  @override
  State<TaxCalculatorScreen> createState() => _TaxCalculatorScreenState();
}

class _TaxCalculatorScreenState extends State<TaxCalculatorScreen> {
  final _formKey = GlobalKey<FormState>();
  final _incomeController = TextEditingController();
  TaxCalculation? _calculation;
  String _filingStatus = 'single';
  final List<Deduction> _deductions = [];

  @override
  void dispose() {
    _incomeController.dispose();
    super.dispose();
  }

  void _calculateTax() {
    if (_formKey.currentState!.validate()) {
      final income = double.parse(_incomeController.text);
      final totalDeductions = _deductions.fold<double>(0, (sum, d) => sum + d.amount);
      final taxableIncome = income - totalDeductions;

      // Simple progressive tax calculation (example rates)
      final brackets = <TaxBracket>[];
      double totalTax = 0;

      if (taxableIncome <= 10000) {
        totalTax = taxableIncome * 0.10;
        brackets.add(TaxBracket(range: '\$0 - \$10,000', rate: 10, amount: totalTax));
      } else if (taxableIncome <= 40000) {
        brackets.add(TaxBracket(range: '\$0 - \$10,000', rate: 10, amount: 1000));
        final amount = (taxableIncome - 10000) * 0.12;
        brackets.add(TaxBracket(range: '\$10,001 - \$40,000', rate: 12, amount: amount));
        totalTax = 1000 + amount;
      } else if (taxableIncome <= 85000) {
        brackets.add(TaxBracket(range: '\$0 - \$10,000', rate: 10, amount: 1000));
        brackets.add(TaxBracket(range: '\$10,001 - \$40,000', rate: 12, amount: 3600));
        final amount = (taxableIncome - 40000) * 0.22;
        brackets.add(TaxBracket(range: '\$40,001 - \$85,000', rate: 22, amount: amount));
        totalTax = 4600 + amount;
      } else {
        brackets.add(TaxBracket(range: '\$0 - \$10,000', rate: 10, amount: 1000));
        brackets.add(TaxBracket(range: '\$10,001 - \$40,000', rate: 12, amount: 3600));
        brackets.add(TaxBracket(range: '\$40,001 - \$85,000', rate: 22, amount: 9900));
        final amount = (taxableIncome - 85000) * 0.24;
        brackets.add(TaxBracket(range: '\$85,001+', rate: 24, amount: amount));
        totalTax = 14500 + amount;
      }

      setState(() {
        _calculation = TaxCalculation(
          grossIncome: income,
          taxableIncome: taxableIncome,
          totalTax: totalTax,
          netIncome: income - totalTax,
          brackets: brackets,
          deductions: _deductions,
          taxYear: DateTime.now().year.toString(),
        );
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: '\$');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tax Calculator'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Input section
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Income Information',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _incomeController,
                        decoration: const InputDecoration(
                          labelText: 'Annual Gross Income',
                          prefixText: '\$',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.number,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter your income';
                          }
                          if (double.tryParse(value) == null) {
                            return 'Please enter a valid number';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      DropdownButtonFormField<String>(
                        value: _filingStatus,
                        decoration: const InputDecoration(
                          labelText: 'Filing Status',
                          border: OutlineInputBorder(),
                        ),
                        items: const [
                          DropdownMenuItem(value: 'single', child: Text('Single')),
                          DropdownMenuItem(value: 'married', child: Text('Married Filing Jointly')),
                          DropdownMenuItem(value: 'head', child: Text('Head of Household')),
                        ],
                        onChanged: (value) {
                          setState(() {
                            _filingStatus = value!;
                          });
                        },
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Deductions section
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Deductions',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          TextButton.icon(
                            onPressed: _addDeduction,
                            icon: const Icon(Icons.add),
                            label: const Text('Add'),
                          ),
                        ],
                      ),
                      if (_deductions.isEmpty)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 16),
                          child: Center(
                            child: Text(
                              'No deductions added',
                              style: TextStyle(color: Colors.grey),
                            ),
                          ),
                        )
                      else
                        ..._deductions.map((d) => ListTile(
                              title: Text(d.name),
                              subtitle: Text(d.category),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    formatter.format(d.amount),
                                    style: const TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.delete, size: 20),
                                    onPressed: () {
                                      setState(() {
                                        _deductions.remove(d);
                                      });
                                    },
                                  ),
                                ],
                              ),
                            )),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Calculate button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _calculateTax,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.all(16),
                  ),
                  child: const Text('Calculate Tax', style: TextStyle(fontSize: 16)),
                ),
              ),
              const SizedBox(height: 24),

              // Results section
              if (_calculation != null) ...[
                Card(
                  color: const Color(0xFF6C63FF),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        const Text(
                          'Estimated Tax',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          formatter.format(_calculation!.totalTax),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 36,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Effective Rate: ${_calculation!.effectiveTaxRate.toStringAsFixed(2)}%',
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Breakdown
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Tax Breakdown',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),
                        _buildBreakdownRow('Gross Income', formatter.format(_calculation!.grossIncome)),
                        _buildBreakdownRow('Total Deductions', formatter.format(_calculation!.grossIncome - _calculation!.taxableIncome)),
                        const Divider(),
                        _buildBreakdownRow('Taxable Income', formatter.format(_calculation!.taxableIncome), bold: true),
                        const SizedBox(height: 16),
                        const Text(
                          'Tax Brackets',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        ..._calculation!.brackets.map((bracket) => Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text('${bracket.range} (${bracket.rate}%)'),
                                  Text(
                                    formatter.format(bracket.amount),
                                    style: const TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            )),
                        const Divider(),
                        _buildBreakdownRow('Total Tax', formatter.format(_calculation!.totalTax), bold: true),
                        _buildBreakdownRow('Net Income', formatter.format(_calculation!.netIncome), bold: true, color: Colors.green),
                      ],
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBreakdownRow(String label, String value, {bool bold = false, Color? color}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontWeight: bold ? FontWeight.bold : FontWeight.normal,
              color: color,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontWeight: bold ? FontWeight.bold : FontWeight.normal,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  void _addDeduction() {
    final nameController = TextEditingController();
    final amountController = TextEditingController();
    String category = 'standard';

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Deduction'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(
                labelText: 'Deduction Name',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: amountController,
              decoration: const InputDecoration(
                labelText: 'Amount',
                prefixText: '\$',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: category,
              decoration: const InputDecoration(
                labelText: 'Category',
                border: OutlineInputBorder(),
              ),
              items: const [
                DropdownMenuItem(value: 'standard', child: Text('Standard')),
                DropdownMenuItem(value: 'mortgage', child: Text('Mortgage Interest')),
                DropdownMenuItem(value: 'charity', child: Text('Charitable Donations')),
                DropdownMenuItem(value: 'medical', child: Text('Medical Expenses')),
                DropdownMenuItem(value: 'education', child: Text('Education')),
              ],
              onChanged: (value) {
                category = value!;
              },
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
              if (nameController.text.isNotEmpty && amountController.text.isNotEmpty) {
                setState(() {
                  _deductions.add(Deduction(
                    name: nameController.text,
                    amount: double.parse(amountController.text),
                    category: category,
                  ));
                });
                Navigator.pop(context);
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }
}
