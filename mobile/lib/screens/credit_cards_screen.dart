import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/credit_card.dart';
import '../services/api_service.dart';

class CreditCardsScreen extends StatefulWidget {
  const CreditCardsScreen({super.key});

  @override
  State<CreditCardsScreen> createState() => _CreditCardsScreenState();
}

class _CreditCardsScreenState extends State<CreditCardsScreen> {
  final ApiService _api = ApiService();
  List<CreditCardModel> _cards = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCards();
  }

  Future<void> _loadCards() async {
    setState(() => _isLoading = true);
    try {
      final data = await _api.getCreditCards();
      _cards = data.map((e) => CreditCardModel.fromJson(e)).toList();
    } catch (_) {}
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
    final totalLimit = _cards.fold(0.0, (s, c) => s + c.creditLimit);
    final totalUsed = _cards.fold(0.0, (s, c) => s + c.currentBalance);

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2E),
        title: const Text('Thẻ tín dụng', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF)))
          : RefreshIndicator(
              onRefresh: _loadCards,
              color: const Color(0xFF6C63FF),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Summary card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(22),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF2C3E50), Color(0xFFFD746C), Color(0xFFFF9068)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFFD746C).withOpacity(0.35),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Hạn mức tổng', style: TextStyle(color: Colors.white70, fontSize: 12)),
                                  Text(formatter.format(totalLimit),
                                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                                ],
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  const Text('Đã sử dụng', style: TextStyle(color: Colors.white70, fontSize: 12)),
                                  Text(formatter.format(totalUsed),
                                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: LinearProgressIndicator(
                              value: totalLimit > 0 ? (totalUsed / totalLimit).clamp(0.0, 1.0) : 0,
                              backgroundColor: Colors.white.withOpacity(0.3),
                              valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                              minHeight: 8,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Còn lại: ${formatter.format(totalLimit - totalUsed)}',
                                style: const TextStyle(color: Colors.white, fontSize: 13),
                              ),
                              Text(
                                totalLimit > 0 ? '${(totalUsed / totalLimit * 100).toStringAsFixed(0)}%' : '0%',
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    const Text('Danh sách thẻ', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),

                    if (_cards.isEmpty)
                      _emptyState()
                    else
                      ..._cards.map((card) => _creditCardWidget(card, formatter)),
                  ],
                ),
              ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFF6C63FF),
        onPressed: () => _showAddDialog(),
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Thêm thẻ', style: TextStyle(color: Colors.white)),
      ),
    );
  }

  Widget _emptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 60),
        child: Column(
          children: [
            Icon(Icons.credit_card_outlined, size: 64, color: Colors.white.withOpacity(0.2)),
            const SizedBox(height: 16),
            const Text('Chưa có thẻ tín dụng nào', style: TextStyle(color: Colors.grey, fontSize: 16)),
          ],
        ),
      ),
    );
  }

  Widget _creditCardWidget(CreditCardModel card, NumberFormat formatter) {
    final gradients = {
      'Visa': [const Color(0xFF1A1A2E), const Color(0xFF16213E), const Color(0xFF0F3460)],
      'MasterCard': [const Color(0xFF2C3E50), const Color(0xFFE74C3C), const Color(0xFFF39C12)],
      'AmEx': [const Color(0xFF1D4350), const Color(0xFFA43931)],
      'Discover': [const Color(0xFF0F2027), const Color(0xFFF97316)],
    };
    final colors = gradients[card.cardType] ?? [const Color(0xFF2C3E50), const Color(0xFF4CA1AF)];

    Color utilColor = Colors.greenAccent;
    if (card.utilizationPercent > 80) {
      utilColor = Colors.redAccent;
    } else if (card.utilizationPercent > 50) {
      utilColor = Colors.orangeAccent;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: colors, begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(18),
        boxShadow: [BoxShadow(color: colors.first.withOpacity(0.4), blurRadius: 12, offset: const Offset(0, 6))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(card.issuingBank, style: const TextStyle(color: Colors.white70, fontSize: 13)),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(card.cardType, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                  ),
                  const SizedBox(width: 4),
                  PopupMenuButton<String>(
                    icon: const Icon(Icons.more_vert, color: Colors.white70, size: 20),
                    color: const Color(0xFF2A2A3E),
                    onSelected: (val) {
                      if (val == 'delete') _confirmDelete(card);
                    },
                    itemBuilder: (_) => [
                      const PopupMenuItem(value: 'delete', child: Text('Xóa', style: TextStyle(color: Colors.redAccent))),
                    ],
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 20),
          Text(
            card.cardNumber.length >= 4 ? '•••• •••• •••• ${card.cardNumber.substring(card.cardNumber.length - 4)}' : card.cardNumber,
            style: const TextStyle(color: Colors.white, fontSize: 20, letterSpacing: 2, fontWeight: FontWeight.w300),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('CHỦ THẺ', style: TextStyle(color: Colors.white54, fontSize: 10)),
                  Text(card.cardholderName, style: const TextStyle(color: Colors.white, fontSize: 13)),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text('HẾT HẠN', style: TextStyle(color: Colors.white54, fontSize: 10)),
                  Text('${card.expiryMonth.toString().padLeft(2, '0')}/${card.expiryYear}',
                      style: const TextStyle(color: Colors.white, fontSize: 13)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.2),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Sử dụng: ${formatter.format(card.currentBalance)}', style: const TextStyle(color: Colors.white, fontSize: 13)),
                    Text('Hạn mức: ${formatter.format(card.creditLimit)}', style: const TextStyle(color: Colors.white70, fontSize: 13)),
                  ],
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: (card.utilizationPercent / 100).clamp(0.0, 1.0),
                    backgroundColor: Colors.white.withOpacity(0.15),
                    valueColor: AlwaysStoppedAnimation<Color>(utilColor),
                    minHeight: 5,
                  ),
                ),
                const SizedBox(height: 4),
                Align(
                  alignment: Alignment.centerRight,
                  child: Text(
                    '${card.utilizationPercent.toStringAsFixed(1)}% sử dụng',
                    style: TextStyle(color: utilColor, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showAddDialog() {
    final holderCtrl = TextEditingController();
    final cardNumCtrl = TextEditingController();
    final bankCtrl = TextEditingController();
    final limitCtrl = TextEditingController();
    final balanceCtrl = TextEditingController(text: '0');
    String selectedType = 'Visa';
    int expiryMonth = DateTime.now().month;
    int expiryYear = DateTime.now().year + 2;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF2A2A3E),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) {
        return StatefulBuilder(builder: (ctx, setStateModal) {
          return Padding(
            padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Thêm thẻ tín dụng',
                      style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 20),
                  _buildTextField(holderCtrl, 'Tên chủ thẻ', Icons.person),
                  const SizedBox(height: 12),
                  _buildTextField(cardNumCtrl, 'Số thẻ', Icons.credit_card),
                  const SizedBox(height: 12),
                  _buildTextField(bankCtrl, 'Ngân hàng phát hành', Icons.account_balance),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: selectedType,
                    dropdownColor: const Color(0xFF1E1E2E),
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      labelText: 'Loại thẻ',
                      labelStyle: const TextStyle(color: Colors.grey),
                      prefixIcon: const Icon(Icons.style, color: Color(0xFF6C63FF)),
                      filled: true,
                      fillColor: const Color(0xFF1E1E2E),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    ),
                    items: ['Visa', 'MasterCard', 'AmEx', 'Discover'].map((t) =>
                        DropdownMenuItem(value: t, child: Text(t, style: const TextStyle(color: Colors.white)))).toList(),
                    onChanged: (v) => setStateModal(() => selectedType = v!),
                  ),
                  const SizedBox(height: 12),
                  _buildTextField(limitCtrl, 'Hạn mức tín dụng', Icons.attach_money, isNumber: true),
                  const SizedBox(height: 12),
                  _buildTextField(balanceCtrl, 'Số dư hiện tại', Icons.money, isNumber: true),
                  const SizedBox(height: 20),
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
                          await _api.createCreditCard({
                            'cardholderName': holderCtrl.text,
                            'cardNumber': cardNumCtrl.text,
                            'cardType': selectedType,
                            'issuingBank': bankCtrl.text,
                            'expiryMonth': expiryMonth,
                            'expiryYear': expiryYear,
                            'cvv': '***',
                            'creditLimit': double.tryParse(limitCtrl.text) ?? 0,
                            'currentBalance': double.tryParse(balanceCtrl.text) ?? 0,
                          });
                          if (ctx.mounted) Navigator.pop(ctx);
                          _loadCards();
                        } catch (_) {
                          if (ctx.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Thêm thất bại!'), backgroundColor: Colors.red),
                            );
                          }
                        }
                      },
                      child: const Text('Thêm thẻ', style: TextStyle(color: Colors.white, fontSize: 16)),
                    ),
                  ),
                ],
              ),
            ),
          );
        });
      },
    );
  }

  void _confirmDelete(CreditCardModel card) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF2A2A3E),
        title: const Text('Xóa thẻ', style: TextStyle(color: Colors.white)),
        content: Text('Bạn có chắc muốn xóa thẻ "${card.cardholderName}"?', style: const TextStyle(color: Colors.grey)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Hủy')),
          TextButton(
            onPressed: () async {
              await _api.deleteCreditCard(card.id);
              if (context.mounted) Navigator.pop(context);
              _loadCards();
            },
            child: const Text('Xóa', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField(TextEditingController ctrl, String label, IconData icon, {bool isNumber = false}) {
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
