import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../models/transaction.dart' as model;

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final ApiService _api = ApiService();
  final _searchCtrl = TextEditingController();
  List<model.Transaction> _results = [];
  bool _isLoading = false;
  bool _hasSearched = false;
  String _filterType = 'all'; // all, income, expense
  DateTimeRange? _dateRange;

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _search() async {
    if (_searchCtrl.text.trim().isEmpty && _filterType == 'all' && _dateRange == null) return;
    setState(() { _isLoading = true; _hasSearched = true; });
    try {
      final data = await _api.getTransactions(
        type: _filterType == 'all' ? null : _filterType,
        startDate: _dateRange?.start.toIso8601String(),
        endDate: _dateRange?.end.toIso8601String(),
      );
      var results = data.map((e) => model.Transaction.fromJson(e)).toList();
      // Filter by keyword locally
      final kw = _searchCtrl.text.trim().toLowerCase();
      if (kw.isNotEmpty) {
        results = results.where((t) =>
          (t.categoryName?.toLowerCase().contains(kw) ?? false) ||
          (t.note?.toLowerCase().contains(kw) ?? false)
        ).toList();
      }
      setState(() { _results = results; _isLoading = false; });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
    final totalIncome = _results.where((t) => t.type == 'income').fold(0.0, (s, t) => s + t.amount);
    final totalExpense = _results.where((t) => t.type == 'expense').fold(0.0, (s, t) => s + t.amount);

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2E),
        title: const Text('Tìm kiếm giao dịch', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                TextField(
                  controller: _searchCtrl,
                  style: const TextStyle(color: Colors.white),
                  onSubmitted: (_) => _search(),
                  decoration: InputDecoration(
                    hintText: 'Tìm theo danh mục, ghi chú...',
                    hintStyle: const TextStyle(color: Colors.grey),
                    prefixIcon: const Icon(Icons.search, color: Color(0xFF6C63FF)),
                    suffixIcon: _searchCtrl.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, color: Colors.grey),
                            onPressed: () { _searchCtrl.clear(); setState(() {}); },
                          )
                        : null,
                    filled: true,
                    fillColor: const Color(0xFF2A2A3E),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 10),
                // Filters row
                Row(
                  children: [
                    // Type filter
                    Expanded(
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            _filterChip('Tất cả', 'all'),
                            const SizedBox(width: 8),
                            _filterChip('Thu nhập', 'income'),
                            const SizedBox(width: 8),
                            _filterChip('Chi tiêu', 'expense'),
                          ],
                        ),
                      ),
                    ),
                    // Date range
                    IconButton(
                      icon: Icon(Icons.date_range,
                          color: _dateRange != null ? const Color(0xFF6C63FF) : Colors.grey),
                      onPressed: () async {
                        final range = await showDateRangePicker(
                          context: context,
                          firstDate: DateTime(2020),
                          lastDate: DateTime.now(),
                          initialDateRange: _dateRange,
                          builder: (ctx, child) => Theme(
                            data: ThemeData.dark().copyWith(
                              colorScheme: const ColorScheme.dark(primary: Color(0xFF6C63FF)),
                            ),
                            child: child!,
                          ),
                        );
                        if (range != null) setState(() => _dateRange = range);
                      },
                    ),
                    // Search button
                    ElevatedButton(
                      onPressed: _search,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6C63FF),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                      child: const Text('Tìm', style: TextStyle(color: Colors.white)),
                    ),
                  ],
                ),
                if (_dateRange != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Row(
                      children: [
                        Icon(Icons.calendar_today, size: 12, color: const Color(0xFF6C63FF)),
                        const SizedBox(width: 4),
                        Text(
                          '${DateFormat('dd/MM/yyyy').format(_dateRange!.start)} - ${DateFormat('dd/MM/yyyy').format(_dateRange!.end)}',
                          style: const TextStyle(color: Color(0xFF6C63FF), fontSize: 12),
                        ),
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: () => setState(() => _dateRange = null),
                          child: const Icon(Icons.close, size: 14, color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),

          // Results summary
          if (_hasSearched && !_isLoading && _results.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF2A2A3E),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _resultStat('${_results.length} kết quả', Colors.white, Icons.list),
                    _resultStat(formatter.format(totalIncome), Colors.greenAccent, Icons.arrow_upward),
                    _resultStat(formatter.format(totalExpense), Colors.redAccent, Icons.arrow_downward),
                  ],
                ),
              ),
            ),

          // Results list
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF)))
                : !_hasSearched
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.search, size: 80, color: Colors.white.withOpacity(0.1)),
                            const SizedBox(height: 16),
                            const Text('Nhập từ khóa để tìm kiếm', style: TextStyle(color: Colors.grey)),
                          ],
                        ),
                      )
                    : _results.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.search_off, size: 64, color: Colors.white.withOpacity(0.15)),
                                const SizedBox(height: 16),
                                const Text('Không tìm thấy kết quả', style: TextStyle(color: Colors.grey)),
                              ],
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: _results.length,
                            itemBuilder: (_, i) => _transactionItem(_results[i], formatter),
                          ),
          ),
        ],
      ),
    );
  }

  Widget _filterChip(String label, String value) {
    final isSelected = _filterType == value;
    return GestureDetector(
      onTap: () => setState(() => _filterType = value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF6C63FF) : const Color(0xFF2A2A3E),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? const Color(0xFF6C63FF) : Colors.transparent),
        ),
        child: Text(label, style: TextStyle(
          color: isSelected ? Colors.white : Colors.grey,
          fontSize: 13,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        )),
      ),
    );
  }

  Widget _resultStat(String value, Color color, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: color, size: 14),
        const SizedBox(width: 4),
        Text(value, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _transactionItem(model.Transaction t, NumberFormat formatter) {
    final isIncome = t.type == 'income';
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3E),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: isIncome ? Colors.green.withOpacity(0.15) : Colors.red.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              isIncome ? Icons.arrow_upward_rounded : Icons.arrow_downward_rounded,
              color: isIncome ? Colors.greenAccent : Colors.redAccent,
              size: 18,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(t.categoryName ?? 'Không rõ',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
                if (t.note != null && t.note!.isNotEmpty)
                  Text(t.note!, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                Text(DateFormat('dd/MM/yyyy').format(t.date),
                    style: const TextStyle(color: Colors.grey, fontSize: 11)),
              ],
            ),
          ),
          Text(
            '${isIncome ? '+' : '-'}${formatter.format(t.amount)}',
            style: TextStyle(
              color: isIncome ? Colors.greenAccent : Colors.redAccent,
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }
}
