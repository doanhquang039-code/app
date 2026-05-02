import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import '../models/stock.dart';

class StockMarketScreen extends StatefulWidget {
  const StockMarketScreen({super.key});

  @override
  State<StockMarketScreen> createState() => _StockMarketScreenState();
}

class _StockMarketScreenState extends State<StockMarketScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = false;

  final List<Stock> _portfolio = [
    Stock(
      id: '1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      shares: 50,
      currentPrice: 175.50,
      purchasePrice: 160.00,
      totalValue: 8775.00,
      profitLoss: 775.00,
      profitLossPercentage: 9.69,
      purchaseDate: DateTime.now().subtract(const Duration(days: 120)),
      exchange: 'NASDAQ',
    ),
    Stock(
      id: '2',
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      shares: 30,
      currentPrice: 140.25,
      purchasePrice: 135.00,
      totalValue: 4207.50,
      profitLoss: 157.50,
      profitLossPercentage: 3.89,
      purchaseDate: DateTime.now().subtract(const Duration(days: 90)),
      exchange: 'NASDAQ',
    ),
    Stock(
      id: '3',
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      shares: 40,
      currentPrice: 380.00,
      purchasePrice: 390.00,
      totalValue: 15200.00,
      profitLoss: -400.00,
      profitLossPercentage: -2.56,
      purchaseDate: DateTime.now().subtract(const Duration(days: 60)),
      exchange: 'NASDAQ',
    ),
  ];

  final List<StockQuote> _watchlist = [
    StockQuote(
      symbol: 'TSLA',
      price: 245.30,
      change: 5.20,
      changePercentage: 2.16,
      open: 240.10,
      high: 248.50,
      low: 239.80,
      volume: 125000000,
      lastUpdate: DateTime.now(),
    ),
    StockQuote(
      symbol: 'AMZN',
      price: 178.90,
      change: -2.40,
      changePercentage: -1.32,
      open: 181.30,
      high: 182.50,
      low: 177.20,
      volume: 85000000,
      lastUpdate: DateTime.now(),
    ),
    StockQuote(
      symbol: 'NVDA',
      price: 495.20,
      change: 12.80,
      changePercentage: 2.65,
      open: 482.40,
      high: 498.30,
      low: 480.10,
      volume: 95000000,
      lastUpdate: DateTime.now(),
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
        title: const Text('Stock Market'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(icon: Icon(Icons.pie_chart), text: 'Portfolio'),
            Tab(icon: Icon(Icons.remove_red_eye), text: 'Watchlist'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshData,
          ),
        ],
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildPortfolioTab(),
          _buildWatchlistTab(),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _addStock,
        icon: const Icon(Icons.add),
        label: const Text('Add Stock'),
      ),
    );
  }

  Widget _buildPortfolioTab() {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: '\$');
    final totalValue = _portfolio.fold<double>(0, (sum, s) => sum + s.totalValue);
    final totalProfitLoss = _portfolio.fold<double>(0, (sum, s) => sum + s.profitLoss);
    final totalProfitLossPercentage = (totalProfitLoss / (totalValue - totalProfitLoss) * 100);

    return SingleChildScrollView(
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
                    'Portfolio Value',
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

          // Holdings
          const Text(
            'Your Holdings',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          ..._portfolio.map((stock) => _buildStockCard(stock, formatter)),
        ],
      ),
    );
  }

  Widget _buildWatchlistTab() {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: '\$');

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Market Movers',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          ..._watchlist.map((quote) => _buildQuoteCard(quote, formatter)),
        ],
      ),
    );
  }

  Widget _buildStockCard(Stock stock, NumberFormat formatter) {
    final isProfit = stock.profitLoss >= 0;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: isProfit ? Colors.green.withValues(alpha: 0.2) : Colors.red.withValues(alpha: 0.2),
          child: Text(
            stock.symbol.substring(0, 1),
            style: TextStyle(
              color: isProfit ? Colors.green : Colors.red,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        title: Text(
          '${stock.symbol} - ${stock.name}',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text('${stock.shares} shares @ ${formatter.format(stock.currentPrice)}'),
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(
                  isProfit ? Icons.arrow_upward : Icons.arrow_downward,
                  size: 14,
                  color: isProfit ? Colors.green : Colors.red,
                ),
                Text(
                  '${formatter.format(stock.profitLoss.abs())} (${stock.profitLossPercentage.abs().toStringAsFixed(2)}%)',
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
                    _buildDetailItem('Total Value', formatter.format(stock.totalValue)),
                    _buildDetailItem('Avg Cost', formatter.format(stock.purchasePrice)),
                    _buildDetailItem('Exchange', stock.exchange),
                  ],
                ),
                const SizedBox(height: 16),
                const Text(
                  'Purchase Date',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                  ),
                ),
                Text(
                  DateFormat('MMM dd, yyyy').format(stock.purchaseDate),
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton.icon(
                      onPressed: () => _sellStock(stock),
                      icon: const Icon(Icons.sell),
                      label: const Text('Sell'),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton.icon(
                      onPressed: () => _buyStock(stock),
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

  Widget _buildQuoteCard(StockQuote quote, NumberFormat formatter) {
    final isPositive = quote.change >= 0;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: isPositive ? Colors.green.withValues(alpha: 0.2) : Colors.red.withValues(alpha: 0.2),
          child: Text(
            quote.symbol.substring(0, 1),
            style: TextStyle(
              color: isPositive ? Colors.green : Colors.red,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        title: Text(
          quote.symbol,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(formatter.format(quote.price)),
            Row(
              children: [
                Icon(
                  isPositive ? Icons.arrow_upward : Icons.arrow_downward,
                  size: 12,
                  color: isPositive ? Colors.green : Colors.red,
                ),
                Text(
                  '${formatter.format(quote.change.abs())} (${quote.changePercentage.abs().toStringAsFixed(2)}%)',
                  style: TextStyle(
                    color: isPositive ? Colors.green : Colors.red,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ],
        ),
        trailing: IconButton(
          icon: const Icon(Icons.add_circle_outline),
          onPressed: () => _addToPortfolio(quote),
        ),
        onTap: () => _showQuoteDetails(quote, formatter),
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

  void _showQuoteDetails(StockQuote quote, NumberFormat formatter) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(quote.symbol),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildQuoteDetailRow('Price', formatter.format(quote.price)),
            _buildQuoteDetailRow('Open', formatter.format(quote.open)),
            _buildQuoteDetailRow('High', formatter.format(quote.high)),
            _buildQuoteDetailRow('Low', formatter.format(quote.low)),
            _buildQuoteDetailRow('Volume', NumberFormat.compact().format(quote.volume)),
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
              _addToPortfolio(quote);
            },
            child: const Text('Buy'),
          ),
        ],
      ),
    );
  }

  Widget _buildQuoteDetailRow(String label, String value) {
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

  void _refreshData() {
    setState(() {
      _isLoading = true;
    });

    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Market data updated!')),
        );
      }
    });
  }

  void _addStock() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Stock'),
        content: const Text('Stock search and add form would go here'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Stock added!')),
              );
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  void _buyStock(Stock stock) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Buy ${stock.symbol}'),
        content: const TextField(
          decoration: InputDecoration(
            labelText: 'Number of shares',
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
                SnackBar(content: Text('${stock.symbol} purchased!')),
              );
            },
            child: const Text('Buy'),
          ),
        ],
      ),
    );
  }

  void _sellStock(Stock stock) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Sell ${stock.symbol}'),
        content: const TextField(
          decoration: InputDecoration(
            labelText: 'Number of shares',
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
                SnackBar(content: Text('${stock.symbol} sold!')),
              );
            },
            child: const Text('Sell'),
          ),
        ],
      ),
    );
  }

  void _addToPortfolio(StockQuote quote) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Buy ${quote.symbol}'),
        content: const TextField(
          decoration: InputDecoration(
            labelText: 'Number of shares',
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
                SnackBar(content: Text('${quote.symbol} added to portfolio!')),
              );
            },
            child: const Text('Buy'),
          ),
        ],
      ),
    );
  }
}
