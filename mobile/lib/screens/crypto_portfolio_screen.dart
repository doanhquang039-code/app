import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import '../models/crypto_asset.dart';

class CryptoPortfolioScreen extends StatefulWidget {
  const CryptoPortfolioScreen({super.key});

  @override
  State<CryptoPortfolioScreen> createState() => _CryptoPortfolioScreenState();
}

class _CryptoPortfolioScreenState extends State<CryptoPortfolioScreen> {
  bool _isLoading = false;

  final List<CryptoAsset> _portfolio = [
    CryptoAsset(
      id: '1',
      symbol: 'BTC',
      name: 'Bitcoin',
      amount: 0.5,
      currentPrice: 45000.0,
      purchasePrice: 40000.0,
      totalValue: 22500.0,
      profitLoss: 2500.0,
      profitLossPercentage: 12.5,
      purchaseDate: DateTime.now().subtract(const Duration(days: 90)),
      walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    ),
    CryptoAsset(
      id: '2',
      symbol: 'ETH',
      name: 'Ethereum',
      amount: 5.0,
      currentPrice: 3000.0,
      purchasePrice: 2800.0,
      totalValue: 15000.0,
      profitLoss: 1000.0,
      profitLossPercentage: 7.14,
      purchaseDate: DateTime.now().subtract(const Duration(days: 60)),
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    ),
    CryptoAsset(
      id: '3',
      symbol: 'BNB',
      name: 'Binance Coin',
      amount: 20.0,
      currentPrice: 350.0,
      purchasePrice: 380.0,
      totalValue: 7000.0,
      profitLoss: -600.0,
      profitLossPercentage: -7.89,
      purchaseDate: DateTime.now().subtract(const Duration(days: 30)),
      walletAddress: 'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: '\$');
    final totalValue = _portfolio.fold<double>(0, (sum, a) => sum + a.totalValue);
    final totalProfitLoss = _portfolio.fold<double>(0, (sum, a) => sum + a.profitLoss);
    final totalProfitLossPercentage = (totalProfitLoss / (totalValue - totalProfitLoss) * 100);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Crypto Portfolio'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshPrices,
          ),
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _addCrypto,
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
                  // Portfolio value card
                  Card(
                    color: totalProfitLoss >= 0 ? const Color(0xFF11998E) : const Color(0xFFEB5757),
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        children: [
                          const Text(
                            'Total Portfolio Value',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            formatter.format(totalValue),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 36,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                totalProfitLoss >= 0 ? Icons.arrow_upward : Icons.arrow_downward,
                                color: Colors.white,
                                size: 20,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '${formatter.format(totalProfitLoss.abs())} (${totalProfitLossPercentage.abs().toStringAsFixed(2)}%)',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Portfolio distribution
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Portfolio Distribution',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          SizedBox(
                            height: 200,
                            child: PieChart(
                              PieChartData(
                                sections: _portfolio.map((asset) {
                                  final percentage = (asset.totalValue / totalValue * 100);
                                  return PieChartSectionData(
                                    value: asset.totalValue,
                                    title: '${asset.symbol}\n${percentage.toStringAsFixed(1)}%',
                                    color: _getColorForAsset(asset.symbol),
                                    radius: 80,
                                    titleStyle: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  );
                                }).toList(),
                                sectionsSpace: 2,
                                centerSpaceRadius: 40,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Assets list
                  const Text(
                    'Your Assets',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ..._portfolio.map((asset) => _buildAssetCard(asset, formatter)),
                ],
              ),
            ),
    );
  }

  Widget _buildAssetCard(CryptoAsset asset, NumberFormat formatter) {
    final isProfit = asset.profitLoss >= 0;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: _getColorForAsset(asset.symbol).withValues(alpha: 0.2),
          child: Text(
            asset.symbol.substring(0, 1),
            style: TextStyle(
              color: _getColorForAsset(asset.symbol),
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        title: Text(
          '${asset.name} (${asset.symbol})',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text('${asset.amount} ${asset.symbol}'),
            Text('${formatter.format(asset.currentPrice)} per coin'),
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(
                  isProfit ? Icons.arrow_upward : Icons.arrow_downward,
                  size: 14,
                  color: isProfit ? Colors.green : Colors.red,
                ),
                Text(
                  '${formatter.format(asset.profitLoss.abs())} (${asset.profitLossPercentage.abs().toStringAsFixed(2)}%)',
                  style: TextStyle(
                    color: isProfit ? Colors.green : Colors.red,
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
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildDetailItem('Total Value', formatter.format(asset.totalValue)),
                    _buildDetailItem('Purchase Price', formatter.format(asset.purchasePrice)),
                    _buildDetailItem('Current Price', formatter.format(asset.currentPrice)),
                  ],
                ),
                const SizedBox(height: 16),
                const Text(
                  'Wallet Address',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.grey[200],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          asset.walletAddress,
                          style: const TextStyle(
                            fontSize: 11,
                            fontFamily: 'monospace',
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.copy, size: 16),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Address copied!')),
                          );
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton.icon(
                      onPressed: () => _sellCrypto(asset),
                      icon: const Icon(Icons.sell),
                      label: const Text('Sell'),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton.icon(
                      onPressed: () => _buyCrypto(asset),
                      icon: const Icon(Icons.add),
                      label: const Text('Buy More'),
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

  Color _getColorForAsset(String symbol) {
    switch (symbol) {
      case 'BTC':
        return const Color(0xFFF7931A);
      case 'ETH':
        return const Color(0xFF627EEA);
      case 'BNB':
        return const Color(0xFFF3BA2F);
      case 'ADA':
        return const Color(0xFF0033AD);
      case 'SOL':
        return const Color(0xFF00FFA3);
      default:
        return const Color(0xFF6C63FF);
    }
  }

  void _refreshPrices() {
    setState(() {
      _isLoading = true;
    });

    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Prices updated!')),
        );
      }
    });
  }

  void _addCrypto() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Cryptocurrency'),
        content: const Text('Add crypto form would go here'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Crypto added!')),
              );
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  void _buyCrypto(CryptoAsset asset) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Buy ${asset.symbol}'),
        content: const TextField(
          decoration: InputDecoration(
            labelText: 'Amount',
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
                SnackBar(content: Text('${asset.symbol} purchased!')),
              );
            },
            child: const Text('Buy'),
          ),
        ],
      ),
    );
  }

  void _sellCrypto(CryptoAsset asset) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Sell ${asset.symbol}'),
        content: const TextField(
          decoration: InputDecoration(
            labelText: 'Amount',
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
                SnackBar(content: Text('${asset.symbol} sold!')),
              );
            },
            child: const Text('Sell'),
          ),
        ],
      ),
    );
  }
}
