import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../providers/net_worth_provider.dart';

class NetWorthScreen extends StatefulWidget {
  const NetWorthScreen({super.key});

  @override
  State<NetWorthScreen> createState() => _NetWorthScreenState();
}

class _NetWorthScreenState extends State<NetWorthScreen> {
  final _noteCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NetWorthProvider>().loadAll();
    });
  }

  @override
  void dispose() {
    _noteCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final fmt = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2E),
        title: const Text('Tài sản ròng', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFF6C63FF),
        icon: const Icon(Icons.camera_alt_outlined, color: Colors.white),
        label: const Text('Lưu snapshot', style: TextStyle(color: Colors.white)),
        onPressed: () => _confirmSnapshot(context),
      ),
      body: Consumer<NetWorthProvider>(
        builder: (context, nw, _) {
          if (nw.isLoading && nw.currentBreakdown == null) {
            return const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF)));
          }
          final c = nw.currentBreakdown;
          if (c == null) {
            return RefreshIndicator(
              color: const Color(0xFF6C63FF),
              onRefresh: nw.loadAll,
              child: ListView(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: Text(
                      nw.lastError ?? 'Không tải được dữ liệu. Kéo để thử lại.',
                      style: const TextStyle(color: Colors.grey),
                    ),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            color: const Color(0xFF6C63FF),
            onRefresh: nw.loadAll,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
              children: [
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF11998E), Color(0xFF38EF7D)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Hiện tại', style: TextStyle(color: Colors.white70, fontSize: 13)),
                      const SizedBox(height: 6),
                      Text(
                        fmt.format(nw.netWorth),
                        style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                const Text('Chi tiết', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                const SizedBox(height: 10),
                _breakRow('Ví', c['walletTotal'], fmt, Colors.blueAccent),
                _breakRow('Ngân hàng', c['bankTotal'], fmt, Colors.cyanAccent),
                _breakRow('Đầu tư', c['investmentTotal'], fmt, Colors.purpleAccent),
                _breakRow('Phải thu (cho vay)', c['receivablesTotal'], fmt, Colors.lightGreenAccent),
                _breakRow('Phải trả (vay)', c['borrowingsTotal'], fmt, Colors.orangeAccent),
                _breakRow('Dư nợ thẻ', c['creditCardDebtTotal'], fmt, Colors.redAccent),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Lịch sử snapshot', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                    Text('${nw.snapshots.length} điểm', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                  ],
                ),
                const SizedBox(height: 12),
                if (nw.snapshots.length < 2)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF2A2A3E),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Text(
                      'Lưu snapshot mỗi ngày hoặc cuối tuần để xem biểu đồ xu hướng tài sản ròng.',
                      style: TextStyle(color: Colors.grey, height: 1.4),
                    ),
                  )
                else
                  SizedBox(
                    height: 220,
                    child: Builder(
                      builder: (context) {
                        final ys = nw.snapshots.map((e) => e.netWorth).toList();
                        var minY = ys.reduce((a, b) => a < b ? a : b);
                        var maxY = ys.reduce((a, b) => a > b ? a : b);
                        if (maxY == minY) {
                          minY -= 1;
                          maxY += 1;
                        }
                        final pad = (maxY - minY) * 0.15;
                        return LineChart(
                      LineChartData(
                        minY: minY - pad,
                        maxY: maxY + pad,
                        gridData: const FlGridData(show: true, drawVerticalLine: false),
                        titlesData: FlTitlesData(
                          leftTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              reservedSize: 44,
                              getTitlesWidget: (v, m) => Text(
                                NumberFormat.compact(locale: 'vi').format(v),
                                style: const TextStyle(color: Colors.grey, fontSize: 10),
                              ),
                            ),
                          ),
                          bottomTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              interval: 1,
                              getTitlesWidget: (v, m) {
                                final i = v.toInt();
                                if (i < 0 || i >= nw.snapshots.length) {
                                  return const SizedBox.shrink();
                                }
                                final d = nw.snapshots[i].snapshotDate;
                                return Padding(
                                  padding: const EdgeInsets.only(top: 8),
                                  child: Text(
                                    DateFormat('M/d').format(d),
                                    style: const TextStyle(color: Colors.grey, fontSize: 10),
                                  ),
                                );
                              },
                            ),
                          ),
                          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        ),
                        borderData: FlBorderData(show: false),
                        lineBarsData: [
                          LineChartBarData(
                            spots: List.generate(
                              nw.snapshots.length,
                              (i) => FlSpot(i.toDouble(), nw.snapshots[i].netWorth),
                            ),
                            isCurved: true,
                            color: const Color(0xFF6C63FF),
                            barWidth: 3,
                            dotData: const FlDotData(show: true),
                            belowBarData: BarAreaData(
                              show: true,
                              color: const Color(0xFF6C63FF).withOpacity(0.12),
                            ),
                          ),
                        ],
                          ),
                        );
                      },
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _breakRow(String label, dynamic value, NumberFormat fmt, Color color) {
    final n = double.tryParse(value?.toString() ?? '0') ?? 0;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: const Color(0xFF2A2A3E),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Container(width: 4, height: 28, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2))),
            const SizedBox(width: 12),
            Expanded(child: Text(label, style: const TextStyle(color: Colors.white))),
            Text(fmt.format(n), style: TextStyle(color: color, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }

  Future<void> _confirmSnapshot(BuildContext context) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF2A2A3E),
        title: const Text('Lưu snapshot hôm nay?', style: TextStyle(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Ghi đè nếu đã có snapshot cùng ngày.', style: TextStyle(color: Colors.grey, fontSize: 13)),
            const SizedBox(height: 12),
            TextField(
              controller: _noteCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Ghi chú (tuỳ chọn)',
                hintStyle: const TextStyle(color: Colors.grey),
                filled: true,
                fillColor: const Color(0xFF1E1E2E),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Huỷ')),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Lưu'),
          ),
        ],
      ),
    );
    if (ok != true || !context.mounted) return;
    final messenger = ScaffoldMessenger.of(context);
    final nw = context.read<NetWorthProvider>();
    final success = await nw.captureSnapshot(note: _noteCtrl.text.trim().isEmpty ? null : _noteCtrl.text.trim());
    _noteCtrl.clear();
    messenger.showSnackBar(
      SnackBar(
        content: Text(success ? 'Đã lưu snapshot.' : 'Lưu thất bại.'),
        backgroundColor: success ? const Color(0xFF6C63FF) : Colors.red,
      ),
    );
  }
}
