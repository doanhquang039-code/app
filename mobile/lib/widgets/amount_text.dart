import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

/// Widget hiển thị số tiền với format VND
class AmountText extends StatelessWidget {
  final double amount;
  final bool isIncome;
  final bool showSign;
  final double fontSize;
  final FontWeight fontWeight;
  final bool compact;

  const AmountText({
    super.key,
    required this.amount,
    this.isIncome = true,
    this.showSign = false,
    this.fontSize = 14,
    this.fontWeight = FontWeight.bold,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final formatter = compact
        ? NumberFormat.compactCurrency(locale: 'vi_VN', symbol: 'đ')
        : NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');

    final color = isIncome ? Colors.greenAccent : Colors.redAccent;
    final sign = showSign ? (isIncome ? '+' : '-') : '';

    return Text(
      '$sign${formatter.format(amount.abs())}',
      style: TextStyle(color: color, fontSize: fontSize, fontWeight: fontWeight),
    );
  }
}

/// Progress bar với label
class LabeledProgressBar extends StatelessWidget {
  final String label;
  final double value;
  final double max;
  final Color color;
  final NumberFormat? formatter;

  const LabeledProgressBar({
    super.key,
    required this.label,
    required this.value,
    required this.max,
    required this.color,
    this.formatter,
  });

  @override
  Widget build(BuildContext context) {
    final pct = max > 0 ? (value / max).clamp(0.0, 1.0) : 0.0;
    final fmt = formatter ?? NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(color: Colors.white, fontSize: 13)),
            Text(fmt.format(value), style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13)),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: pct,
            backgroundColor: Colors.white.withOpacity(0.08),
            valueColor: AlwaysStoppedAnimation<Color>(color),
            minHeight: 6,
          ),
        ),
        const SizedBox(height: 4),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('${(pct * 100).toStringAsFixed(0)}%', style: TextStyle(color: color, fontSize: 11)),
            Text('/ ${fmt.format(max)}', style: const TextStyle(color: Colors.grey, fontSize: 11)),
          ],
        ),
      ],
    );
  }
}
