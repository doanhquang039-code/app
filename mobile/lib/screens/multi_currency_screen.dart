import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/currency.dart';
import '../services/api_service.dart';

class MultiCurrencyScreen extends StatefulWidget {
  const MultiCurrencyScreen({super.key});

  @override
  State<MultiCurrencyScreen> createState() => _MultiCurrencyScreenState();
}

class _MultiCurrencyScreenState extends State<MultiCurrencyScreen> {
  final ApiService _api = ApiService();
  List<Currency> _currencies = [];
  bool _isLoading = true;
  
  // Converter
  String _fromCurrency = 'USD';
  String _toCurrency = 'VND';
  final TextEditingController _amountCtrl = TextEditingController(text: '1');
  double? _convertedAmount;
  bool _isConverting = false;

  @override
  void initState() {
    super.initState();
    _loadCurrencies();
  }

  Future<void> _loadCurrencies() async {
    setState(() => _isLoading = true);
    try {
      final data = await _api.getCurrencies();
      _currencies = data.map((e) => Currency.fromJson(e)).toList();
    } catch (_) {
      // Default currencies if API fails
      _currencies = [
        Currency(id: 1, code: 'VND', name: 'Việt Nam Đồng', symbol: '₫', exchangeRate: 24500, isActive: true),
        Currency(id: 2, code: 'USD', name: 'US Dollar', symbol: '\$', exchangeRate: 1, isActive: true),
        Currency(id: 3, code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 0.92, isActive: true),
        Currency(id: 4, code: 'JPY', name: 'Japanese Yen', symbol: '¥', exchangeRate: 154, isActive: true),
        Currency(id: 5, code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 0.79, isActive: true),
        Currency(id: 6, code: 'KRW', name: 'Korean Won', symbol: '₩', exchangeRate: 1380, isActive: true),
        Currency(id: 7, code: 'CNY', name: 'Chinese Yuan', symbol: '¥', exchangeRate: 7.25, isActive: true),
        Currency(id: 8, code: 'THB', name: 'Thai Baht', symbol: '฿', exchangeRate: 35.5, isActive: true),
      ];
    }
    setState(() => _isLoading = false);
  }

  Future<void> _convert() async {
    setState(() => _isConverting = true);
    try {
      final amount = double.tryParse(_amountCtrl.text) ?? 0;
      final result = await _api.convertCurrency(_fromCurrency, _toCurrency, amount);
      _convertedAmount = double.tryParse(result['convertedAmount']?.toString() ?? '0');
    } catch (_) {
      // Local fallback conversion
      final amount = double.tryParse(_amountCtrl.text) ?? 0;
      final fromRate = _currencies.firstWhere((c) => c.code == _fromCurrency, orElse: () => _currencies.first).exchangeRate;
      final toRate = _currencies.firstWhere((c) => c.code == _toCurrency, orElse: () => _currencies.first).exchangeRate;
      if (fromRate > 0) {
        _convertedAmount = amount / fromRate * toRate;
      }
    }
    setState(() => _isConverting = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2E),
        title: const Text('Đa tiền tệ', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Currency converter
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(22),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1A2980), Color(0xFF26D0CE)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF1A2980).withOpacity(0.4),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        const Text('💱 Quy đổi tiền tệ',
                            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 20),
                        // Amount input
                        TextField(
                          controller: _amountCtrl,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                          textAlign: TextAlign.center,
                          decoration: InputDecoration(
                            hintText: 'Nhập số tiền',
                            hintStyle: TextStyle(color: Colors.white.withOpacity(0.3)),
                            filled: true,
                            fillColor: Colors.white.withOpacity(0.1),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                          ),
                        ),
                        const SizedBox(height: 16),
                        // From / To
                        Row(
                          children: [
                            Expanded(
                              child: _currencyDropdown(_fromCurrency, (v) => setState(() => _fromCurrency = v!)),
                            ),
                            const SizedBox(width: 10),
                            GestureDetector(
                              onTap: () {
                                setState(() {
                                  final temp = _fromCurrency;
                                  _fromCurrency = _toCurrency;
                                  _toCurrency = temp;
                                });
                              },
                              child: Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.2),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.swap_horiz, color: Colors.white, size: 22),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _currencyDropdown(_toCurrency, (v) => setState(() => _toCurrency = v!)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          height: 48,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                            onPressed: _isConverting ? null : _convert,
                            child: _isConverting
                                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                                : const Text('Quy đổi', style: TextStyle(color: Color(0xFF1A2980), fontWeight: FontWeight.bold, fontSize: 16)),
                          ),
                        ),
                        if (_convertedAmount != null) ...[
                          const SizedBox(height: 16),
                          Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              children: [
                                Text(
                                  '${_amountCtrl.text} $_fromCurrency =',
                                  style: const TextStyle(color: Colors.white70, fontSize: 14),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${NumberFormat('#,##0.##').format(_convertedAmount)} $_toCurrency',
                                  style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Exchange rates
                  const Text('📈 Tỷ giá hiện tại (so với USD)',
                      style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  ..._currencies.map((c) => _currencyRateCard(c)),
                ],
              ),
            ),
    );
  }

  Widget _currencyDropdown(String value, ValueChanged<String?> onChanged) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: DropdownButton<String>(
        value: _currencies.any((c) => c.code == value) ? value : (_currencies.isNotEmpty ? _currencies.first.code : null),
        dropdownColor: const Color(0xFF2A2A3E),
        isExpanded: true,
        underline: const SizedBox(),
        style: const TextStyle(color: Colors.white, fontSize: 16),
        items: _currencies.map((c) => DropdownMenuItem(
          value: c.code,
          child: Text('${c.symbol} ${c.code}', style: const TextStyle(color: Colors.white)),
        )).toList(),
        onChanged: onChanged,
      ),
    );
  }

  Widget _currencyRateCard(Currency currency) {
    final flagEmojis = {
      'VND': '🇻🇳', 'USD': '🇺🇸', 'EUR': '🇪🇺', 'JPY': '🇯🇵',
      'GBP': '🇬🇧', 'KRW': '🇰🇷', 'CNY': '🇨🇳', 'THB': '🇹🇭',
      'SGD': '🇸🇬', 'AUD': '🇦🇺', 'CAD': '🇨🇦',
    };
    final flag = flagEmojis[currency.code] ?? '💰';

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3E),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Text(flag, style: const TextStyle(fontSize: 28)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(currency.code, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                Text(currency.name, style: const TextStyle(color: Colors.grey, fontSize: 12)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${currency.symbol} ${NumberFormat('#,##0.####').format(currency.exchangeRate)}',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
              ),
              const Text('/ 1 USD', style: TextStyle(color: Colors.grey, fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _amountCtrl.dispose();
    super.dispose();
  }
}
