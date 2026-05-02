import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/receipt.dart';

class ReceiptScannerScreen extends StatefulWidget {
  const ReceiptScannerScreen({super.key});

  @override
  State<ReceiptScannerScreen> createState() => _ReceiptScannerScreenState();
}

class _ReceiptScannerScreenState extends State<ReceiptScannerScreen> {
  bool _isScanning = false;

  final List<Receipt> _receipts = [
    Receipt(
      id: '1',
      merchantName: 'Walmart Supercenter',
      date: DateTime.now().subtract(const Duration(days: 2)),
      totalAmount: 156.78,
      currency: 'USD',
      items: [
        ReceiptItem(name: 'Milk', quantity: 2, price: 3.99, total: 7.98),
        ReceiptItem(name: 'Bread', quantity: 3, price: 2.50, total: 7.50),
        ReceiptItem(name: 'Eggs', quantity: 1, price: 4.99, total: 4.99),
        ReceiptItem(name: 'Chicken Breast', quantity: 2, price: 12.99, total: 25.98),
        ReceiptItem(name: 'Vegetables', quantity: 1, price: 15.50, total: 15.50),
      ],
      category: 'Groceries',
      paymentMethod: 'Credit Card',
      imagePath: '/receipts/receipt_001.jpg',
      isProcessed: true,
    ),
    Receipt(
      id: '2',
      merchantName: 'Shell Gas Station',
      date: DateTime.now().subtract(const Duration(days: 5)),
      totalAmount: 45.00,
      currency: 'USD',
      items: [
        ReceiptItem(name: 'Gasoline', quantity: 12, price: 3.75, total: 45.00),
      ],
      category: 'Transportation',
      paymentMethod: 'Debit Card',
      imagePath: '/receipts/receipt_002.jpg',
      isProcessed: true,
    ),
    Receipt(
      id: '3',
      merchantName: 'Amazon.com',
      date: DateTime.now().subtract(const Duration(days: 7)),
      totalAmount: 89.99,
      currency: 'USD',
      items: [
        ReceiptItem(name: 'Wireless Mouse', quantity: 1, price: 29.99, total: 29.99),
        ReceiptItem(name: 'USB Cable', quantity: 2, price: 15.00, total: 30.00),
        ReceiptItem(name: 'Phone Case', quantity: 1, price: 30.00, total: 30.00),
      ],
      category: 'Shopping',
      paymentMethod: 'Credit Card',
      imagePath: '/receipts/receipt_003.jpg',
      isProcessed: true,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: '\$');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Receipt Scanner'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterOptions,
          ),
        ],
      ),
      body: _isScanning
          ? _buildScanningView()
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Summary card
                  _buildSummaryCard(formatter),
                  const SizedBox(height: 24),

                  // Scan buttons
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: _scanFromCamera,
                          icon: const Icon(Icons.camera_alt),
                          label: const Text('Take Photo'),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.all(16),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: _scanFromGallery,
                          icon: const Icon(Icons.photo_library),
                          label: const Text('From Gallery'),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.all(16),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Receipts list
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Scanned Receipts',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '${_receipts.length} receipts',
                        style: const TextStyle(
                          color: Colors.grey,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ..._receipts.map((receipt) => _buildReceiptCard(receipt, formatter)),
                ],
              ),
            ),
    );
  }

  Widget _buildScanningView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 20),
          const Text(
            'Scanning Receipt...',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Text(
            'Please wait while we extract the information',
            style: TextStyle(color: Colors.grey),
          ),
          const SizedBox(height: 40),
          TextButton(
            onPressed: () {
              setState(() {
                _isScanning = false;
              });
            },
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCard(NumberFormat formatter) {
    final totalAmount = _receipts.fold<double>(0, (sum, r) => sum + r.totalAmount);
    final thisMonth = _receipts.where((r) {
      final now = DateTime.now();
      return r.date.year == now.year && r.date.month == now.month;
    }).length;

    return Card(
      color: const Color(0xFF6C63FF),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const Text(
              'Total Scanned',
              style: TextStyle(
                color: Colors.white70,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              formatter.format(totalAmount),
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
                _buildSummaryItem('This Month', '$thisMonth'),
                _buildSummaryItem('Total', '${_receipts.length}'),
                _buildSummaryItem('Processed', '${_receipts.where((r) => r.isProcessed).length}'),
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

  Widget _buildReceiptCard(Receipt receipt, NumberFormat formatter) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: const Color(0xFF6C63FF).withValues(alpha: 0.2),
          child: const Icon(Icons.receipt, color: Color(0xFF6C63FF)),
        ),
        title: Text(
          receipt.merchantName,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(DateFormat('MMM dd, yyyy').format(receipt.date)),
            Text(
              formatter.format(receipt.totalAmount),
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.blue.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    receipt.category,
                    style: const TextStyle(
                      color: Colors.blue,
                      fontSize: 11,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                if (receipt.isProcessed)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.green.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      'Processed',
                      style: TextStyle(
                        color: Colors.green,
                        fontSize: 11,
                      ),
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
                // Receipt details
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildDetailItem('Items', '${receipt.items.length}'),
                    _buildDetailItem('Payment', receipt.paymentMethod),
                    _buildDetailItem('Currency', receipt.currency),
                  ],
                ),
                const SizedBox(height: 16),

                // Items list
                const Text(
                  'Items',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                ...receipt.items.map((item) => Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text('${item.quantity}x ${item.name}'),
                          ),
                          Text(
                            formatter.format(item.total),
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    )),
                const Divider(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Total',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    Text(
                      formatter.format(receipt.totalAmount),
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Actions
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton.icon(
                      onPressed: () => _viewReceiptImage(receipt),
                      icon: const Icon(Icons.image),
                      label: const Text('View Image'),
                    ),
                    const SizedBox(width: 8),
                    TextButton.icon(
                      onPressed: () => _editReceipt(receipt),
                      icon: const Icon(Icons.edit),
                      label: const Text('Edit'),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton.icon(
                      onPressed: () => _addToTransactions(receipt),
                      icon: const Icon(Icons.add),
                      label: const Text('Add to Transactions'),
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

  void _scanFromCamera() {
    setState(() {
      _isScanning = true;
    });

    // Simulate scanning
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() {
          _isScanning = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Receipt scanned successfully!')),
        );
      }
    });
  }

  void _scanFromGallery() {
    setState(() {
      _isScanning = true;
    });

    // Simulate scanning
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _isScanning = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Receipt imported successfully!')),
        );
      }
    });
  }

  void _showFilterOptions() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Filter Receipts'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('All Receipts'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              title: const Text('This Month'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              title: const Text('By Category'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              title: const Text('Unprocessed'),
              onTap: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }

  void _viewReceiptImage(Receipt receipt) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(receipt.merchantName),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              height: 300,
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Center(
                child: Icon(Icons.receipt_long, size: 100, color: Colors.grey),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              receipt.imagePath,
              style: const TextStyle(fontSize: 11, color: Colors.grey),
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

  void _editReceipt(Receipt receipt) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Receipt'),
        content: const Text('Receipt editing form would go here'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Receipt updated!')),
              );
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _addToTransactions(Receipt receipt) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add to Transactions'),
        content: Text(
          'Add ${receipt.merchantName} receipt (${NumberFormat.currency(locale: 'vi_VN', symbol: '\$').format(receipt.totalAmount)}) to your transactions?',
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
                const SnackBar(content: Text('Added to transactions!')),
              );
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }
}
