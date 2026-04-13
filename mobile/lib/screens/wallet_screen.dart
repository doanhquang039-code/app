import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../providers/wallet_provider.dart';
import '../models/wallet.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<WalletProvider>().loadWallets();
    });
  }

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2E),
        title: const Text('Ví của tôi', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: Color(0xFF6C63FF)),
            onPressed: () => _showWalletDialog(context),
          ),
        ],
      ),
      body: Consumer<WalletProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF)));
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Total balance card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF6C63FF), Color(0xFF9C88FF)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF6C63FF).withOpacity(0.4),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      const Text('Tổng tài sản', style: TextStyle(color: Colors.white70, fontSize: 14)),
                      const SizedBox(height: 8),
                      Text(
                        formatter.format(provider.totalBalance),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 30,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${provider.wallets.length} ví',
                        style: const TextStyle(color: Colors.white54, fontSize: 13),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                const Text(
                  'Danh sách ví',
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),

                if (provider.wallets.isEmpty)
                  _emptyState()
                else
                  ...provider.wallets.map((wallet) => _walletCard(context, wallet, formatter, provider)),
              ],
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFF6C63FF),
        onPressed: () => _showWalletDialog(context),
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Thêm ví', style: TextStyle(color: Colors.white)),
      ),
    );
  }

  Widget _emptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 60),
        child: Column(
          children: [
            Icon(Icons.account_balance_wallet_outlined, size: 64, color: Colors.white.withOpacity(0.2)),
            const SizedBox(height: 16),
            const Text('Chưa có ví nào', style: TextStyle(color: Colors.grey, fontSize: 16)),
            const SizedBox(height: 8),
            const Text('Nhấn + để tạo ví mới', style: TextStyle(color: Colors.grey, fontSize: 13)),
          ],
        ),
      ),
    );
  }

  Widget _walletCard(
    BuildContext context,
    Wallet wallet,
    NumberFormat formatter,
    WalletProvider provider,
  ) {
    final colors = [
      [const Color(0xFF6C63FF), const Color(0xFF9C88FF)],
      [const Color(0xFF11998E), const Color(0xFF38EF7D)],
      [const Color(0xFFEB5757), const Color(0xFFF9A825)],
      [const Color(0xFF2980B9), const Color(0xFF6DD5FA)],
    ];
    final colorPair = colors[wallet.id % colors.length];

    return GestureDetector(
      onTap: () => provider.selectWallet(wallet),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: colorPair, begin: Alignment.topLeft, end: Alignment.bottomRight),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(color: colorPair[0].withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4)),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                _getWalletIcon(wallet.icon),
                color: Colors.white,
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        wallet.name,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      if (wallet.isDefault) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.25),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Text('Mặc định', style: TextStyle(color: Colors.white, fontSize: 10)),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(wallet.currency, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  formatter.format(wallet.balance),
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                ),
                PopupMenuButton<String>(
                  icon: const Icon(Icons.more_vert, color: Colors.white70, size: 20),
                  color: const Color(0xFF2A2A3E),
                  onSelected: (val) {
                    if (val == 'edit') _showWalletDialog(context, wallet: wallet);
                    if (val == 'delete') _confirmDelete(context, wallet, provider);
                  },
                  itemBuilder: (_) => [
                    const PopupMenuItem(value: 'edit', child: Text('Chỉnh sửa', style: TextStyle(color: Colors.white))),
                    const PopupMenuItem(value: 'delete', child: Text('Xóa', style: TextStyle(color: Colors.redAccent))),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  IconData _getWalletIcon(String? icon) {
    switch (icon) {
      case 'bank': return Icons.account_balance;
      case 'cash': return Icons.money;
      case 'card': return Icons.credit_card;
      case 'savings': return Icons.savings;
      default: return Icons.account_balance_wallet;
    }
  }

  void _showWalletDialog(BuildContext context, {Wallet? wallet}) {
    final nameCtrl = TextEditingController(text: wallet?.name);
    final balanceCtrl = TextEditingController(text: wallet?.balance.toString() ?? '0');
    String selectedIcon = wallet?.icon ?? 'wallet';
    bool isDefault = wallet?.isDefault ?? false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF2A2A3E),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) {
        return StatefulBuilder(builder: (ctx, setStateModal) {
          return Padding(
            padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  wallet == null ? 'Thêm ví mới' : 'Chỉnh sửa ví',
                  style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 20),
                _buildTextField(nameCtrl, 'Tên ví', Icons.account_balance_wallet),
                const SizedBox(height: 12),
                _buildTextField(balanceCtrl, 'Số dư ban đầu', Icons.attach_money, isNumber: true),
                const SizedBox(height: 12),
                // Icon selector
                const Text('Loại ví', style: TextStyle(color: Colors.grey, fontSize: 13)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    for (final icon in ['wallet', 'bank', 'cash', 'card', 'savings'])
                      GestureDetector(
                        onTap: () => setStateModal(() => selectedIcon = icon),
                        child: Container(
                          margin: const EdgeInsets.only(right: 10),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: selectedIcon == icon
                                ? const Color(0xFF6C63FF).withOpacity(0.3)
                                : const Color(0xFF1E1E2E),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: selectedIcon == icon ? const Color(0xFF6C63FF) : Colors.transparent,
                            ),
                          ),
                          child: Icon(_getWalletIcon(icon), color: Colors.white, size: 22),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                SwitchListTile(
                  value: isDefault,
                  activeColor: const Color(0xFF6C63FF),
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Đặt làm ví mặc định', style: TextStyle(color: Colors.white)),
                  onChanged: (v) => setStateModal(() => isDefault = v),
                ),
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
                      final data = {
                        'name': nameCtrl.text,
                        'balance': double.tryParse(balanceCtrl.text) ?? 0,
                        'icon': selectedIcon,
                        'currency': 'VND',
                        'isDefault': isDefault,
                      };
                      final provider = context.read<WalletProvider>();
                      bool ok;
                      if (wallet == null) {
                        ok = await provider.createWallet(data);
                      } else {
                        ok = await provider.updateWallet(wallet.id, data);
                      }
                      if (ctx.mounted) Navigator.pop(ctx);
                      if (!ok && context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Thao tác thất bại!'), backgroundColor: Colors.red),
                        );
                      }
                    },
                    child: Text(
                      wallet == null ? 'Tạo ví' : 'Cập nhật',
                      style: const TextStyle(color: Colors.white, fontSize: 16),
                    ),
                  ),
                ),
              ],
            ),
          );
        });
      },
    );
  }

  void _confirmDelete(BuildContext context, Wallet wallet, WalletProvider provider) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF2A2A3E),
        title: const Text('Xóa ví', style: TextStyle(color: Colors.white)),
        content: Text(
          'Bạn có chắc muốn xóa ví "${wallet.name}"?',
          style: const TextStyle(color: Colors.grey),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Hủy')),
          TextButton(
            onPressed: () async {
              await provider.deleteWallet(wallet.id);
              if (context.mounted) Navigator.pop(context);
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
