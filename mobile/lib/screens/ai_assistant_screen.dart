import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/ai_insight.dart';
import '../providers/transaction_provider.dart';

class AIAssistantScreen extends StatefulWidget {
  const AIAssistantScreen({Key? key}) : super(key: key);

  @override
  State<AIAssistantScreen> createState() => _AIAssistantScreenState();
}

class _AIAssistantScreenState extends State<AIAssistantScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = false;

  // Mock data - replace with API calls
  final List<AIInsight> _insights = [
    AIInsight(
      id: '1',
      title: 'High Spending Alert',
      description: 'Your dining expenses are 40% higher than last month. Consider meal planning to save money.',
      category: 'spending',
      priority: 'high',
      potentialSavings: 150.0,
      actionItems: [
        'Create a weekly meal plan',
        'Cook at home 4 days a week',
        'Use grocery coupons',
      ],
      createdAt: DateTime.now().subtract(const Duration(hours: 2)),
    ),
    AIInsight(
      id: '2',
      title: 'Savings Opportunity',
      description: 'You have \$500 sitting idle. Consider moving it to a high-yield savings account.',
      category: 'saving',
      priority: 'medium',
      potentialSavings: 25.0,
      actionItems: [
        'Research high-yield savings accounts',
        'Compare interest rates',
        'Transfer funds',
      ],
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
    ),
    AIInsight(
      id: '3',
      title: 'Debt Payoff Strategy',
      description: 'By paying an extra \$100/month on your credit card, you can save \$300 in interest.',
      category: 'debt',
      priority: 'high',
      potentialSavings: 300.0,
      actionItems: [
        'Increase monthly payment by \$100',
        'Set up automatic payments',
        'Track progress monthly',
      ],
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
    ),
  ];

  final List<SpendingPrediction> _predictions = [
    SpendingPrediction(
      category: 'Groceries',
      predictedAmount: 450.0,
      confidence: 0.85,
      period: 'month',
      historicalData: [400, 420, 430, 440, 450],
      trend: 'increasing',
    ),
    SpendingPrediction(
      category: 'Transportation',
      predictedAmount: 200.0,
      confidence: 0.78,
      period: 'month',
      historicalData: [220, 210, 200, 195, 200],
      trend: 'decreasing',
    ),
    SpendingPrediction(
      category: 'Entertainment',
      predictedAmount: 150.0,
      confidence: 0.92,
      period: 'month',
      historicalData: [145, 150, 148, 152, 150],
      trend: 'stable',
    ),
  ];

  final List<FinancialRecommendation> _recommendations = [
    FinancialRecommendation(
      id: '1',
      type: 'save_money',
      title: 'Cancel Unused Subscriptions',
      description: 'You have 3 subscriptions you haven\'t used in 2 months. Canceling them could save you \$45/month.',
      impact: 85.0,
      difficulty: 'easy',
      estimatedTimeMinutes: 15,
      steps: [
        'Review subscription list',
        'Cancel unused services',
        'Set calendar reminder to review quarterly',
      ],
    ),
    FinancialRecommendation(
      id: '2',
      type: 'optimize_budget',
      title: 'Adjust Budget Categories',
      description: 'Your actual spending doesn\'t match your budget. Reallocate funds for better accuracy.',
      impact: 70.0,
      difficulty: 'medium',
      estimatedTimeMinutes: 30,
      steps: [
        'Review last 3 months spending',
        'Identify overspent categories',
        'Adjust budget allocations',
        'Set up alerts for overspending',
      ],
    ),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
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
        title: const Text('AI Financial Assistant'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(icon: Icon(Icons.lightbulb), text: 'Insights'),
            Tab(icon: Icon(Icons.trending_up), text: 'Predictions'),
            Tab(icon: Icon(Icons.recommend), text: 'Recommendations'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildInsightsTab(),
          _buildPredictionsTab(),
          _buildRecommendationsTab(),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _refreshInsights,
        icon: const Icon(Icons.refresh),
        label: const Text('Refresh AI'),
      ),
    );
  }

  Widget _buildInsightsTab() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _insights.length,
      itemBuilder: (context, index) {
        final insight = _insights[index];
        return _buildInsightCard(insight);
      },
    );
  }

  Widget _buildInsightCard(AIInsight insight) {
    Color priorityColor;
    IconData priorityIcon;

    switch (insight.priority) {
      case 'high':
        priorityColor = Colors.red;
        priorityIcon = Icons.priority_high;
        break;
      case 'medium':
        priorityColor = Colors.orange;
        priorityIcon = Icons.warning;
        break;
      default:
        priorityColor = Colors.blue;
        priorityIcon = Icons.info;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: priorityColor.withOpacity(0.2),
          child: Icon(priorityIcon, color: priorityColor),
        ),
        title: Text(
          insight.title,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(insight.description),
            if (insight.potentialSavings != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  'Potential Savings: \$${insight.potentialSavings!.toStringAsFixed(2)}',
                  style: const TextStyle(
                    color: Colors.green,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
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
                const Text(
                  'Action Items:',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                ...insight.actionItems.map((item) => Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Row(
                        children: [
                          const Icon(Icons.check_circle_outline, size: 16),
                          const SizedBox(width: 8),
                          Expanded(child: Text(item)),
                        ],
                      ),
                    )),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: () => _dismissInsight(insight.id),
                      child: const Text('Dismiss'),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: () => _takeAction(insight),
                      child: const Text('Take Action'),
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

  Widget _buildPredictionsTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _predictions.length,
      itemBuilder: (context, index) {
        final prediction = _predictions[index];
        return _buildPredictionCard(prediction);
      },
    );
  }

  Widget _buildPredictionCard(SpendingPrediction prediction) {
    Color trendColor;
    IconData trendIcon;

    switch (prediction.trend) {
      case 'increasing':
        trendColor = Colors.red;
        trendIcon = Icons.trending_up;
        break;
      case 'decreasing':
        trendColor = Colors.green;
        trendIcon = Icons.trending_down;
        break;
      default:
        trendColor = Colors.blue;
        trendIcon = Icons.trending_flat;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  prediction.category,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Row(
                  children: [
                    Icon(trendIcon, color: trendColor, size: 20),
                    const SizedBox(width: 4),
                    Text(
                      prediction.trend.toUpperCase(),
                      style: TextStyle(
                        color: trendColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Predicted Amount',
                      style: TextStyle(color: Colors.grey),
                    ),
                    Text(
                      '\$${prediction.predictedAmount.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text(
                      'Confidence',
                      style: TextStyle(color: Colors.grey),
                    ),
                    Text(
                      '${(prediction.confidence * 100).toStringAsFixed(0)}%',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.green,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text(
              'Historical Trend',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            SizedBox(
              height: 100,
              child: _buildMiniChart(prediction.historicalData),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniChart(List<double> data) {
    return CustomPaint(
      painter: _MiniChartPainter(data),
      child: Container(),
    );
  }

  Widget _buildRecommendationsTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _recommendations.length,
      itemBuilder: (context, index) {
        final recommendation = _recommendations[index];
        return _buildRecommendationCard(recommendation);
      },
    );
  }

  Widget _buildRecommendationCard(FinancialRecommendation recommendation) {
    Color difficultyColor;
    switch (recommendation.difficulty) {
      case 'easy':
        difficultyColor = Colors.green;
        break;
      case 'hard':
        difficultyColor = Colors.red;
        break;
      default:
        difficultyColor = Colors.orange;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    recommendation.title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: difficultyColor.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    recommendation.difficulty.toUpperCase(),
                    style: TextStyle(
                      color: difficultyColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 10,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(recommendation.description),
            const SizedBox(height: 16),
            Row(
              children: [
                _buildMetric('Impact', '${recommendation.impact.toInt()}%', Colors.blue),
                const SizedBox(width: 16),
                _buildMetric('Time', '${recommendation.estimatedTimeMinutes} min', Colors.purple),
              ],
            ),
            const SizedBox(height: 16),
            const Text(
              'Steps:',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            ...recommendation.steps.asMap().entries.map((entry) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 12,
                        child: Text('${entry.key + 1}'),
                      ),
                      const SizedBox(width: 8),
                      Expanded(child: Text(entry.value)),
                    ],
                  ),
                )),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => _implementRecommendation(recommendation),
                child: const Text('Start Implementation'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetric(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(color: Colors.grey, fontSize: 12),
        ),
        Text(
          value,
          style: TextStyle(
            color: color,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
      ],
    );
  }

  void _refreshInsights() {
    setState(() {
      _isLoading = true;
    });

    // Simulate API call
    Future.delayed(const Duration(seconds: 2), () {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('AI insights refreshed!')),
      );
    });
  }

  void _dismissInsight(String id) {
    setState(() {
      _insights.removeWhere((insight) => insight.id == id);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Insight dismissed')),
    );
  }

  void _takeAction(AIInsight insight) {
    // Navigate to relevant screen or show action dialog
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Take Action'),
        content: Text('Implement actions for: ${insight.title}'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Action started!')),
              );
            },
            child: const Text('Start'),
          ),
        ],
      ),
    );
  }

  void _implementRecommendation(FinancialRecommendation recommendation) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(recommendation.title),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('This will take approximately ${recommendation.estimatedTimeMinutes} minutes.'),
            const SizedBox(height: 16),
            const Text('Are you ready to start?'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Later'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Implementation guide opened!')),
              );
            },
            child: const Text('Start Now'),
          ),
        ],
      ),
    );
  }
}

class _MiniChartPainter extends CustomPainter {
  final List<double> data;

  _MiniChartPainter(this.data);

  @override
  void paint(Canvas canvas, Size size) {
    if (data.isEmpty) return;

    final paint = Paint()
      ..color = Colors.blue
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    final path = Path();
    final maxValue = data.reduce((a, b) => a > b ? a : b);
    final minValue = data.reduce((a, b) => a < b ? a : b);
    final range = maxValue - minValue;

    for (int i = 0; i < data.length; i++) {
      final x = (size.width / (data.length - 1)) * i;
      final y = size.height - ((data[i] - minValue) / range) * size.height;

      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }

    canvas.drawPath(path, paint);

    // Draw points
    final pointPaint = Paint()
      ..color = Colors.blue
      ..style = PaintingStyle.fill;

    for (int i = 0; i < data.length; i++) {
      final x = (size.width / (data.length - 1)) * i;
      final y = size.height - ((data[i] - minValue) / range) * size.height;
      canvas.drawCircle(Offset(x, y), 4, pointPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
