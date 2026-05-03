import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/loan.dart';

class LoanCalculatorScreen extends StatefulWidget {
  const LoanCalculatorScreen({super.key});

  @override
  State<LoanCalculatorScreen> createState() => _LoanCalculatorScreenState();
}

class _LoanCalculatorScreenState extends State<LoanCalculatorScreen> {
  final _formKey = GlobalKey<FormState>();
  final _principalController = TextEditingController(text: '10000');
  final _rateController = TextEditingController(text: '5.5');
  final _termController = TextEditingController(text: '60');
  
  LoanCalculation? _calculation;
  bool _showSchedule = false;

  @override
  void dispose() {
    _principalController.dispose();
    _rateController.dispose();
    _termController.dispose();
    super.dispose();
  }

  void _calculate() {
    if (_formKey.currentState!.validate()) {
      final principal = double.parse(_principalController.text);
      final rate = double.parse(_rateController.text);
      final months = int.parse(_termController.text);

      setState(() {
        _calculation = LoanCalculation.calculate(
          principal: principal,
          annualRate: rate,
          months: months,
        );
        _showSchedule = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: '\$');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Loan Calculator'),
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
                        'Loan Details',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _principalController,
                        decoration: const InputDecoration(
                          labelText: 'Loan Amount',
                          prefixText: '\$',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.number,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter loan amount';
                          }
                          if (double.tryParse(value) == null) {
                            return 'Please enter a valid number';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _rateController,
                        decoration: const InputDecoration(
                          labelText: 'Annual Interest Rate',
                          suffixText: '%',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.number,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter interest rate';
                          }
                          if (double.tryParse(value) == null) {
                            return 'Please enter a valid number';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _termController,
                        decoration: const InputDecoration(
                          labelText: 'Loan Term',
                          suffixText: 'months',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.number,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter loan term';
                          }
                          if (int.tryParse(value) == null) {
                            return 'Please enter a valid number';
                          }
                          return null;
                        },
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Calculate button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _calculate,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.all(16),
                  ),
                  child: const Text('Calculate', style: TextStyle(fontSize: 16)),
                ),
              ),
              const SizedBox(height: 24),

              // Results
              if (_calculation != null) ...[
                Card(
                  color: const Color(0xFF6C63FF),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        const Text(
                          'Monthly Payment',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          formatter.format(_calculation!.monthlyPayment),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 36,
                            fontWeight: FontWeight.bold,
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
                          'Loan Summary',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),
                        _buildSummaryRow('Loan Amount', formatter.format(_calculation!.loanAmount)),
                        _buildSummaryRow('Interest Rate', '${_calculation!.interestRate.toStringAsFixed(2)}%'),
                        _buildSummaryRow('Loan Term', '${_calculation!.termMonths} months'),
                        const Divider(),
                        _buildSummaryRow('Monthly Payment', formatter.format(_calculation!.monthlyPayment), bold: true),
                        _buildSummaryRow('Total Interest', formatter.format(_calculation!.totalInterest), color: Colors.orange),
                        _buildSummaryRow('Total Amount', formatter.format(_calculation!.totalAmount), bold: true, color: Colors.green),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Payment schedule button
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () {
                      setState(() {
                        _showSchedule = !_showSchedule;
                      });
                    },
                    icon: Icon(_showSchedule ? Icons.expand_less : Icons.expand_more),
                    label: Text(_showSchedule ? 'Hide Payment Schedule' : 'Show Payment Schedule'),
                  ),
                ),

                // Payment schedule
                if (_showSchedule) ...[
                  const SizedBox(height: 16),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Payment Schedule',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: DataTable(
                              columns: const [
                                DataColumn(label: Text('#')),
                                DataColumn(label: Text('Payment')),
                                DataColumn(label: Text('Principal')),
                                DataColumn(label: Text('Interest')),
                                DataColumn(label: Text('Balance')),
                              ],
                              rows: _calculation!.schedule.take(12).map((payment) {
                                return DataRow(cells: [
                                  DataCell(Text('${payment.paymentNumber}')),
                                  DataCell(Text(formatter.format(payment.payment))),
                                  DataCell(Text(formatter.format(payment.principal))),
                                  DataCell(Text(formatter.format(payment.interest))),
                                  DataCell(Text(formatter.format(payment.balance))),
                                ]);
                              }).toList(),
                            ),
                          ),
                          if (_calculation!.schedule.length > 12)
                            Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: Text(
                                'Showing first 12 of ${_calculation!.schedule.length} payments',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ],
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool bold = false, Color? color}) {
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
}
