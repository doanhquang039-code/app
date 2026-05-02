import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import '../models/expense_prediction.dart';

class ExpensePredictionScreen extends StatefulWidget {
  const ExpensePredictionScreen({super.key});

  @override
  State<ExpensePredictionScreen> createState() => _ExpensePredictionScreenState();
}

class _ExpensePredictionScreenState extends State<ExpensePredictionScreen> {
  String _selectedPeriod = 'month';
  bool _isLoading = false;

  // Mock data
  final List<ExpensePrediction> _predictions = [
    ExpensePrediction(
      category: 'Groceries',
      predictedAmount: 450.0,
      actualAmount: 420.0,
      variance: -30.0,
      period: 'month',
      monthlyData: [
        MonthlyData(month: 'Jan', predicted: 400, actual: 380),
        MonthlyData(month: 'Feb', predicted: 420, actual: 410),
        MonthlyData(month: 'Mar', predicted: 430, actual: 440),
        MonthlyData(month: 'Apr', predicted: 440, actual: 430),
        MonthlyData(month: 'May', predicted: 450, actual: 420),
      ],
      accuracy: 'high',
    ),
    ExpensePrediction(
      category: 'Transportation',
      predictedAmount: 200.0,
      actualAmount: 215.0,
      variance: 15.0,
      period: 'month',
      monthlyData: [
        MonthlyData(month: 'Jan', predicted: 220, actual: 230),
        MonthlyData(month: 'Feb', predicted: 210, actual: 205),
        MonthlyData(month: 'Mar', predicted: 200, actual: 210),
        MonthlyData(month: 'Apr', predicted: 195, actual: 200),
        MonthlyData(month: 'May', predicted: 200, actual: 215),
      ],
      accuracy: 'medium',
    ),
    ExpensePrediction(
      category: 'Entertainment',
      predictedAmount: 150.0,
      actualAmount: 148.0,
      variance: -2.0,
      period: 'month',
      monthlyData: [
        MonthlyData(month: 'Jan', predicted: 145, actual: 150),
        MonthlyData(month: 'Feb', predicted: 150, actual: 145),
        MonthlyData(month: 'Mar', predicted: 148, actual: 152),
        MonthlyData(month: 'Apr', predicted: 152, actual: 150),
        MonthlyData(month: 'May', predicted: 150, actual: 148),
      ],
      accuracy: 'high',
    ),
    ExpensePrediction(
      category: 'Utilities',
      predictedAmount: 120.0,
      actualAmount: 135.0,
      variance: 15.0,
      period: 'month',
      monthlyData: [
        MonthlyData(month: 'Jan', predicted: 110, actual: 115),
        MonthlyData(month: 'Feb', predicted: 115, actual: 120),
        MonthlyData(month: 'Mar', predicted: 118, actual: 125),
        MonthlyData(month: 'Apr', predicted: 120, actual: 130),
        MonthlyData(month: 'May', predicted: 120, actual: 135),
      ],
      accuracy: 'medium',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: '\$');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Expense Predictions'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshPredictions,
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
                  // Period selector
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Prediction Period',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 12),
                          SegmentedButton<String>(
                            segments: const [
                              ButtonSegment(value: 'week', label: Text('Week')),
                              ButtonSegment(value: 'month', label: Text('Month')),
                              ButtonSegment(value: 'year', label: Text('Year')),
                            ],
                            selected: {_selectedPeriod},
                            onSelectionChanged: (Set<String> newSelection) {
                              setState(() {
                                _selectedPeriod = newSelection.first;
                              });
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Summary card
                  _buildSummaryCard(formatter),
                  const SizedBox(height: 20),

                  // Predictions list
                  const Text(
                    'Category Predictions',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ..._predictions.map((prediction) => _buildPredictionCard(prediction, formatter)),
                ],
              ),
            ),
    );
  }

  Widget _buildSummaryCard(NumberFormat formatter) {
    final totalPredicted = _predictions.fold<double>(0, (sum, p) => sum + p.predictedAmount);
    final totalActual = _predictions.fold<double>(0, (sum, p) => sum + p.actualAmount);
    final totalVariance = totalActual - totalPredicted;
    final accuracy = ((1 - (totalVariance.abs() / totalPredicted)) * 100).clamp(0, 100);

    return Card(
      color: const Color(0xFF6C63FF),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const Text(
              'Overall Prediction',
              style: TextStyle(
                color: Colors.white70,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              formatter.format(totalPredicted),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildSummaryItem('Actual', formatter.format(totalActual), Colors.white),
                _buildSummaryItem('Variance', formatter.format(totalVariance), totalVariance >= 0 ? Colors.redAccent : Colors.greenAccent),
                _buildSummaryItem('Accuracy', '${accuracy.toStringAsFixed(1)}%', Colors.white),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryItem(String label, String value, Color color) {
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
          style: TextStyle(
            color: color,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildPredictionCard(ExpensePrediction prediction, NumberFormat formatter) {
    final isAccurate = prediction.variance.abs() < (prediction.predictedAmount * 0.1);
    final accuracyColor = isAccurate ? Colors.green : Colors.orange;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: accuracyColor.withValues(alpha: 0.2),
          child: Icon(
            isAccurate ? Icons.check_circle : Icons.warning,
            color: accuracyColor,
          ),
        ),
        title: Text(
          prediction.category,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text('Predicted: ${formatter.format(prediction.predictedAmount)}'),
            Text('Actual: ${formatter.format(prediction.actualAmount)}'),
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(
                  prediction.variance >= 0 ? Icons.arrow_upward : Icons.arrow_downward,
                  size: 14,
                  color: prediction.variance >= 0 ? Colors.red : Colors.green,
                ),
                Text(
                  '${formatter.format(prediction.variance.abs())} (${(prediction.variance / prediction.predictedAmount * 100).abs().toStringAsFixed(1)}%)',
                  style: TextStyle(
                    color: prediction.variance >= 0 ? Colors.red : Colors.green,
                    fontWeight: FontWeight.bold,
                  ),
                ),
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
                const Text(
                  'Historical Comparison',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  height: 200,
                  child: LineChart(
                    LineChartData(
                      gridData: const FlGridData(show: true),
                      titlesData: FlTitlesData(
                        leftTitles: const AxisTitles(
                          sideTitles: SideTitles(showTitles: true, reservedSize: 40),
                        ),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            getTitlesWidget: (value, meta) {
                              if (value.toInt() >= 0 && value.toInt() < prediction.monthlyData.length) {
                                return Text(
                                  prediction.monthlyData[value.toInt()].month,
                                  style: const TextStyle(fontSize: 10),
                                );
                              }
                              return const Text('');
                            },
                          ),
                        ),
                        rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      ),
                      borderData: FlBorderData(show: true),
                      lineBarsData: [
                        LineChartBarData(
                          spots: prediction.monthlyData
                              .asMap()
                              .entries
                              .map((e) => FlSpot(e.key.toDouble(), e.value.predicted))
                              .toList(),
                          isCurved: true,
                          color: Colors.blue,
                          barWidth: 3,
                          dotData: const FlDotData(show: true),
                        ),
                        LineChartBarData(
                          spots: prediction.monthlyData
                              .asMap()
                              .entries
                              .map((e) => FlSpot(e.key.toDouble(), e.value.actual))
                              .toList(),
                          isCurved: true,
                          color: Colors.orange,
                          barWidth: 3,
                          dotData: const FlDotData(show: true),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildLegendItem('Predicted', Colors.blue),
                    const SizedBox(width: 20),
                    _buildLegendItem('Actual', Colors.orange),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }

  void _refreshPredictions() {
    setState(() {
      _isLoading = true;
    });

    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Predictions updated!')),
        );
      }
    });
  }
}
