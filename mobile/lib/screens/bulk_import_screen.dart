import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../models/category.dart';
import '../models/wallet.dart';
import '../providers/transaction_provider.dart';
import '../providers/wallet_provider.dart';
import '../services/api_service.dart';

class _RowModel {
  final TextEditingController amount = TextEditingController();
  String type = 'expense';
  DateTime date = DateTime.now();
  final TextEditingController note = TextEditingController();

  void dispose() {
    amount.dispose();
    note.dispose();
  }
}

class BulkImportScreen extends StatefulWidget {
  const BulkImportScreen({super.key});

  @override
  State<BulkImportScreen> createState() => _BulkImportScreenState();
}

class _BulkImportScreenState extends State<BulkImportScreen> {
  final ApiService _api = ApiService();
  List<Category> _categories = [];
  Wallet? _wallet;
  Category? _category;
  final List<_RowModel> _rows = List.generate(8, (_) => _RowModel());
  bool _loadingMeta = true;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await context.read<WalletProvider>().loadWallets();
      await _load();
    });
  }

  Future<void> _load() async {
    try {
      final catData = await _api.getCategories();
      _categories = catData.map((e) => Category.fromJson(e as Map<String, dynamic>)).toList();
      if (!mounted) return;
      final wallets = context.read<WalletProvider>().wallets;
      setState(() {
        _category = _categories.isNotEmpty ? _categories.first : null;
        _wallet = wallets.isNotEmpty ? wallets.first : null;
        _loadingMeta = false;
      });
    } catch (_) {
      setState(() => _loadingMeta = false);
    }
  }

  void _addRow() {
    setState(() => _rows.add(_RowModel()));
  }

  Future<void> _submit() async {
    if (_wallet == null || _category == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Chọn ví và danh mục.'), backgroundColor: Colors.orange),
      );
      return;
    }
    final items = <Map<String, dynamic>>[];
    for (final r in _rows) {
      final raw = r.amount.text.trim().replaceAll(',', '');
      if (raw.isEmpty) continue;
      final amt = double.tryParse(raw);
      if (amt == null || amt <= 0) continue;
      items.add({
        'walletId': _wallet!.id,
        'categoryId': _category!.id,
        'amount': amt,
        'type': r.type,
        'date': r.date.toIso8601String(),
        if (r.note.text.trim().isNotEmpty) 'note': r.note.text.trim(),
      });
    }
    if (items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Nhập ít nhất một số tiền hợp lệ.'), backgroundColor: Colors.orange),
      );
      return;
    }
    if (items.length > 500) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Tối đa 500 dòng mỗi lần.'), backgroundColor: Colors.orange),
      );
      return;
    }
    setState(() => _submitting = true);
    try {
      final res = await _api.bulkImportTransactions(items);
      final created = res['created'] ?? 0;
      final errors = res['errors'] as List<dynamic>? ?? [];
      if (!context.mounted) return;
      await context.read<TransactionProvider>().loadTransactions();
      if (!context.mounted) return;
      await context.read<WalletProvider>().loadWallets();
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Đã tạo $created giao dịch.${errors.isNotEmpty ? ' Có ${errors.length} lỗi.' : ''}'),
          backgroundColor: errors.isNotEmpty ? Colors.orange : const Color(0xFF6C63FF),
        ),
      );
      if (errors.isEmpty && context.mounted) Navigator.pop(context);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Gửi thất bại.'), backgroundColor: Colors.red),
        );
      }
    }
    if (mounted) setState(() => _submitting = false);
  }

  @override
  void dispose() {
    for (final r in _rows) {
      r.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final wallets = context.watch<WalletProvider>().wallets;
    if (_wallet == null && wallets.isNotEmpty) {
      _wallet = wallets.first;
    }

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2E),
        title: const Text('Nhập nhiều giao dịch', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _loadingMeta
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'Chung cho tất cả dòng: ví và danh mục. Mỗi dòng: số tiền, loại, ngày.',
                    style: TextStyle(color: Colors.grey, fontSize: 13, height: 1.35),
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<Wallet>(
                    value: _wallet,
                    dropdownColor: const Color(0xFF2A2A3E),
                    style: const TextStyle(color: Colors.white),
                    decoration: _fieldDeco('Ví'),
                    items: wallets
                        .map((w) => DropdownMenuItem(value: w, child: Text(w.name)))
                        .toList(),
                    onChanged: (v) => setState(() => _wallet = v),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<Category>(
                    value: _category,
                    dropdownColor: const Color(0xFF2A2A3E),
                    style: const TextStyle(color: Colors.white),
                    decoration: _fieldDeco('Danh mục'),
                    items: _categories
                        .map((c) => DropdownMenuItem(value: c, child: Text(c.name)))
                        .toList(),
                    onChanged: (v) => setState(() => _category = v),
                  ),
                  const SizedBox(height: 20),
                  const Text('Các dòng', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  ...List.generate(_rows.length, (i) => _rowTile(i)),
                  TextButton.icon(
                    onPressed: _addRow,
                    icon: const Icon(Icons.add, color: Color(0xFF6C63FF)),
                    label: const Text('Thêm dòng', style: TextStyle(color: Color(0xFF6C63FF))),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 52,
                    child: FilledButton(
                      onPressed: _submitting ? null : _submit,
                      style: FilledButton.styleFrom(
                        backgroundColor: const Color(0xFF6C63FF),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: _submitting
                          ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Text('Gửi hàng loạt', style: TextStyle(fontSize: 16, color: Colors.white)),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  InputDecoration _fieldDeco(String label) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(color: Colors.grey),
      filled: true,
      fillColor: const Color(0xFF2A2A3E),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
    );
  }

  Widget _rowTile(int i) {
    final r = _rows[i];
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3E),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Dòng ${i + 1}', style: const TextStyle(color: Colors.grey, fontSize: 11)),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                flex: 2,
                child: TextField(
                  controller: r.amount,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    hintText: 'Số tiền',
                    hintStyle: TextStyle(color: Colors.grey),
                    isDense: true,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'expense', label: Text('Chi', style: TextStyle(fontSize: 11))),
                  ButtonSegment(value: 'income', label: Text('Thu', style: TextStyle(fontSize: 11))),
                ],
                selected: {r.type},
                onSelectionChanged: (s) => setState(() => r.type = s.first),
                style: ButtonStyle(
                  visualDensity: VisualDensity.compact,
                  foregroundColor: MaterialStateProperty.resolveWith((states) {
                    if (states.contains(MaterialState.selected)) return Colors.white;
                    return Colors.grey;
                  }),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              TextButton.icon(
                onPressed: () async {
                  final d = await showDatePicker(
                    context: context,
                    initialDate: r.date,
                    firstDate: DateTime(2000),
                    lastDate: DateTime(2100),
                  );
                  if (d != null) setState(() => r.date = d);
                },
                icon: const Icon(Icons.calendar_today, size: 16, color: Color(0xFF6C63FF)),
                label: Text(
                  DateFormat('dd/MM/yyyy').format(r.date),
                  style: const TextStyle(color: Colors.white70),
                ),
              ),
              Expanded(
                child: TextField(
                  controller: r.note,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: const InputDecoration(
                    hintText: 'Ghi chú',
                    hintStyle: TextStyle(color: Colors.grey),
                    isDense: true,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
