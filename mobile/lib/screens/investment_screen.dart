import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../models/investment.dart';

class InvestmentScreen extends StatefulWidget {
  const InvestmentScreen({super.key});

  @override
  State<InvestmentScreen> createState() => _InvestmentScreenState();
}

class _InvestmentScreenState extends State<InvestmentScreen> {
  final ApiService _api = ApiService();
  List<Investment> _investments = [];
  Map<String, dynamic> _portfolio = {};
  bool _isLoading = true;

  static const _typeIcons = {
    'stock': Icons.show_chart,
    'crypto': Icons.currency_bitcoin,
    'mutual_fund': Icons.pie_chart,
    'gold': Icons.star,
    'real_estate': Icons.home,
    'bond': Icons.account_balance,
    'savings_deposit': Icons.savings,
  };

  static const _typeLabels = {
    'stock': 'Cổ phiếu',
    'crypto': 'Crypto',
    'mutual_fund': 'Quỹ đầu tư',
    'gold': 'Vàng',
    'real_estate': 'Bất động sản',
    'bond': 'Trái phiếu',
    'savings_deposit': 'Tiết kiệm',
  };

  static const _typeColors = {
    'stock': Color(0xFF6C63FF),
    'crypto': Color(0xFFF97316),
    'mutual_fund': Color(0xFF11998E),
    'gold': Color(0xFFF9A825),
    'real_estate': Color(0xFF2C5364),
    'bond': Color(0xFF1A2980),
    'savings_deposit': Color(0xFF8E2DE2),
  };

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final results = await Future.wait([
        _api.getInvestments(),
        _api.getPortfolioSummary(),
      ]);
      setState(() {
        _investments = (results[0] as List).map((e) => Investment.fromJson(e)).toList();
        _portfolio = results[1] as Map<String, dynamic>;
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
    final totalInvested = _portfolio['totalInvested'] ?? 0.0;
    final currentValue = _portfolio['currentValue'] ?? 0.0;
    final profitLoss = _portfolio['totalProfitLoss'] ?? 0.0;
    final profitPct = _portfolio['totalProfitLossPercentage'] ?? 0.0;
    final isProfit = profitLoss >= 0;

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2E),
        title: const Text('Danh mục đầu tư', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF)))
          : RefreshIndicator(
              onRefresh: _loadData,
              color: const Color(0xFF6C63FF),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Portfolio summary card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(22),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: isProfit
                              ? [const Color(0xFF11998E), const Color(0xFF38EF7D)]
                              : [const Color(0xFFEB5757), const Color(0xFFF97316)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(22),
                        boxShadow: [
                          BoxShadow(
                            color: (isProfit ? const Color(0xFF11998E) : const Color(0xFFEB5757)).withOpacity(0.4),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          const Text('Giá trị danh mục', style: TextStyle(color: Colors.white70, fontSize: 13)),
                          const SizedBox(height: 8),
                          Text(
                            formatter.format(currentValue),
                            style: const TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              _portfolioItem('Đã đầu tư', formatter.format(totalInvested)),
                              Container(width: 1, height: 40, color: Colors.white30),
                              _portfolioItem(
                                isProfit ? '📈 Lãi' : '📉 Lỗ',
                                '${isProfit ? '+' : ''}${formatter.format(profitLoss)}',
                              ),
                              Container(width: 1, height: 40, color: Colors.white30),
                              _portfolioItem(
                                'Tỷ suất',
                                '${isProfit ? '+' : ''}${profitPct.toStringAsFixed(2)}%',
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Investments list
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Danh sách (${_investments.length})',
                            style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                        TextButton.icon(
                          onPressed: () => _showAddInvestmentSheet(),
                          icon: const Icon(Icons.add, color: Color(0xFF6C63FF), size: 18),
                          label: const Text('Thêm', style: TextStyle(color: Color(0xFF6C63FF))),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    if (_investments.isEmpty)
                      Center(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 60),
                          child: Column(
                            children: [
                              Icon(Icons.trending_up_outlined, size: 64, color: Colors.white.withOpacity(0.2)),
                              const SizedBox(height: 16),
                              const Text('Chưa có khoản đầu tư nào', style: TextStyle(color: Colors.grey)),
                            ],
                          ),
                        ),
                      )
                    else
                      ..._investments.map((inv) => _investmentCard(inv, formatter)),
                  ],
                ),
              ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFF6C63FF),
        onPressed: () => _showAddInvestmentSheet(),
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Đầu tư mới', style: TextStyle(color: Colors.white)),
      ),
    );
  }

  Widget _portfolioItem(String label, String value) {
    return Column(
      children: [
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
            overflow: TextOverflow.ellipsis),
      ],
    );
  }

  Widget _investmentCard(Investment inv, NumberFormat formatter) {
    final color = _typeColors[inv.type] ?? const Color(0xFF6C63FF);
    final icon = _typeIcons[inv.type] ?? Icons.trending_up;
    final label = _typeLabels[inv.type] ?? inv.type;
    final isProfit = (inv.profitLoss ?? 0) >= 0;
    final profitColor = isProfit ? Colors.greenAccent : Colors.redAccent;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(inv.name,
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                    ),
                    if (inv.symbol != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: color.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(inv.symbol!, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Text('Đầu tư: ${formatter.format(inv.totalInvested)}',
                        style: const TextStyle(color: Colors.grey, fontSize: 12)),
                    if (inv.currentValue != null) ...[
                      const Text(' → ', style: TextStyle(color: Colors.grey, fontSize: 12)),
                      Text(formatter.format(inv.currentValue!),
                          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                    ],
                  ],
                ),
              ],
            ),
          ),
          if (inv.profitLoss != null)
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '${isProfit ? '+' : ''}${formatter.format(inv.profitLoss!)}',
                  style: TextStyle(color: profitColor, fontWeight: FontWeight.bold, fontSize: 14),
                ),
                if (inv.profitLossPercentage != null)
                  Text(
                    '${isProfit ? '+' : ''}${inv.profitLossPercentage!.toStringAsFixed(2)}%',
                    style: TextStyle(color: profitColor, fontSize: 12),
                  ),
              ],
            ),
        ],
      ),
    );
  }

  void _showAddInvestmentSheet() {
    final nameCtrl = TextEditingController();
    final amountCtrl = TextEditingController();
    final symbolCtrl = TextEditingController();
    String type = 'stock';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF2A2A3E),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModal) => Padding(
          padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Thêm khoản đầu tư', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              // Type selector
              SizedBox(
                height: 80,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: _typeLabels.entries.map((e) {
                    final isSelected = type == e.key;
                    final color = _typeColors[e.key] ?? const Color(0xFF6C63FF);
                    return GestureDetector(
                      onTap: () => setModal(() => type = e.key),
                      child: Container(
                        margin: const EdgeInsets.only(right: 10),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: isSelected ? color.withOpacity(0.2) : const Color(0xFF1E1E2E),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: isSelected ? color : Colors.transparent),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(_typeIcons[e.key], color: color, size: 20),
                            const SizedBox(height: 4),
                            Text(e.value, style: TextStyle(color: color, fontSize: 11)),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 12),
              _field(nameCtrl, 'Tên khoản đầu tư', Icons.label),
              const SizedBox(height: 10),
              _field(symbolCtrl, 'Mã (VD: VNM, BTC)', Icons.tag),
              const SizedBox(height: 10),
              _field(amountCtrl, 'Số tiền đầu tư', Icons.attach_money, isNumber: true),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6C63FF),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: () async {
                    try {
                      await _api.createInvestment({
                        'name': nameCtrl.text,
                        'type': type,
                        'symbol': symbolCtrl.text.isNotEmpty ? symbolCtrl.text : null,
                        'totalInvested': double.tryParse(amountCtrl.text) ?? 0,
                        'buyPrice': double.tryParse(amountCtrl.text) ?? 0,
                        'buyDate': DateTime.now().toIso8601String(),
                      });
                      Navigator.pop(ctx);
                      _loadData();
                    } catch (_) {}
                  },
                  child: const Text('Thêm đầu tư', style: TextStyle(color: Colors.white, fontSize: 16)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _field(TextEditingController ctrl, String label, IconData icon, {bool isNumber = false}) {
    return TextField(
      controller: ctrl,
      keyboardType: isNumber ? const TextInputType.numberWithOptions(decimal: true) : TextInputType.text,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.grey),
        prefixIcon: Icon(icon, color: const Color(0xFF6C63FF)),
        filled: true,
        fillColor: const Color(0xFF1E1E2E),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
      ),
    );
  }
}
