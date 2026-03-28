import 'package:flutter/material.dart';
import '../models/category.dart';
import '../services/api_service.dart';

class AddTransactionScreen extends StatefulWidget {
  const AddTransactionScreen({super.key});

  @override
  State<AddTransactionScreen> createState() => _AddTransactionScreenState();
}

class _AddTransactionScreenState extends State<AddTransactionScreen> {
  final _amountController = TextEditingController();
  final _noteController = TextEditingController();
  final ApiService _api = ApiService();
  List<Category> _categories = [];
  Category? _selectedCategory;
  String _type = 'expense';
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadCategories();
  }

  Future<void> _loadCategories() async {
    try {
      final data = await _api.getCategories();
      setState(() {
        _categories = data.map((e) => Category.fromJson(e)).toList();
        _selectedCategory = _categories.isNotEmpty ? _categories.first : null;
      });
    } catch (e) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2E),
        title: const Text('Thêm giao dịch', style: TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Type selector
            Row(
              children: [
                _typeButton('expense', 'Chi tiêu', Colors.red),
                const SizedBox(width: 12),
                _typeButton('income', 'Thu nhập', Colors.green),
              ],
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              style: const TextStyle(color: Colors.white),
              decoration: _inputDecoration('Số tiền', Icons.attach_money),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<Category>(
              value: _selectedCategory,
              dropdownColor: const Color(0xFF2A2A3E),
              style: const TextStyle(color: Colors.white),
              decoration: _inputDecoration('Danh mục', Icons.category),
              items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c.name))).toList(),
              onChanged: (val) => setState(() => _selectedCategory = val),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _noteController,
              style: const TextStyle(color: Colors.white),
              decoration: _inputDecoration('Ghi chú', Icons.note),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _save,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6C63FF),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Lưu', style: TextStyle(fontSize: 16, color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _typeButton(String type, String label, Color color) {
    final isSelected = _type == type;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _type = type),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? color.withOpacity(0.2) : const Color(0xFF2A2A3E),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: isSelected ? color : Colors.transparent, width: 2),
          ),
          child: Text(label, textAlign: TextAlign.center, style: TextStyle(color: isSelected ? color : Colors.grey, fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(color: Colors.grey),
      prefixIcon: Icon(icon, color: const Color(0xFF6C63FF)),
      filled: true,
      fillColor: const Color(0xFF2A2A3E),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
    );
  }

  Future<void> _save() async {
    if (_amountController.text.isEmpty || _selectedCategory == null) return;
    setState(() => _isLoading = true);
    try {
      await _api.createTransaction({
        'amount': double.parse(_amountController.text),
        'type': _type,
        'categoryId': _selectedCategory!.id,
        'note': _noteController.text,
        'date': DateTime.now().toIso8601String(),
        'walletId': 1,
      });
      if (mounted) Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lưu thất bại!'), backgroundColor: Colors.red),
      );
    }
    setState(() => _isLoading = false);
  }
}