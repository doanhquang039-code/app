import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class SocialAuthButtons extends StatelessWidget {
  const SocialAuthButtons({
    super.key,
    required this.actionLabel,
  });

  final String actionLabel;

  static const _providers = [
    _SocialProvider('google', 'Google', 'G', Color(0xFFFFFFFF), Color(0xFF4285F4)),
    _SocialProvider('facebook', 'Facebook', 'f', Color(0xFF1877F2), Colors.white),
    _SocialProvider('microsoft', 'Microsoft', 'MS', Color(0xFFF25022), Colors.white),
    _SocialProvider('zalo', 'Zalo', 'Z', Color(0xFF0068FF), Colors.white),
    _SocialProvider('tiktok', 'TikTok', '♪', Color(0xFF000000), Colors.white),
    _SocialProvider('instagram', 'Instagram', 'IG', Color(0xFFE1306C), Colors.white),
  ];

  static const _oauthBaseUrl = 'http://localhost:3000';

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Wrap(
          alignment: WrapAlignment.center,
          spacing: 12,
          runSpacing: 12,
          children: _providers
              .map(
                (provider) => _SocialButton(
                  provider: provider,
                  actionLabel: actionLabel,
                  onPressed: () => _openSocialAuth(context, provider.id),
                ),
              )
              .toList(),
        ),
        const SizedBox(height: 22),
        Row(
          children: const [
            Expanded(child: Divider(color: Color(0xFF34344A))),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 12),
              child: Text(
                'Hoặc dùng email',
                style: TextStyle(color: Colors.grey, fontSize: 13),
              ),
            ),
            Expanded(child: Divider(color: Color(0xFF34344A))),
          ],
        ),
      ],
    );
  }

  Future<void> _openSocialAuth(BuildContext context, String provider) async {
    final uri = Uri.parse('$_oauthBaseUrl/auth/social/$provider?target=mobile');
    final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!opened && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Không mở được trình duyệt đăng nhập'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}

class _SocialButton extends StatelessWidget {
  const _SocialButton({
    required this.provider,
    required this.actionLabel,
    required this.onPressed,
  });

  final _SocialProvider provider;
  final String actionLabel;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 136,
      height: 48,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          foregroundColor: Colors.white,
          backgroundColor: const Color(0xFF2A2A3E),
          side: const BorderSide(color: Color(0xFF3A3A52)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          padding: const EdgeInsets.symmetric(horizontal: 10),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 28,
              height: 28,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: provider.backgroundColor,
                borderRadius: BorderRadius.circular(14),
                border: provider.id == 'google'
                    ? Border.all(color: const Color(0xFFE5E7EB))
                    : null,
              ),
              child: Text(
                provider.icon,
                style: TextStyle(
                  color: provider.foregroundColor,
                  fontSize: provider.icon.length > 1 ? 10 : 17,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Flexible(
              child: Text(
                provider.label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SocialProvider {
  const _SocialProvider(
    this.id,
    this.label,
    this.icon,
    this.backgroundColor,
    this.foregroundColor,
  );

  final String id;
  final String label;
  final String icon;
  final Color backgroundColor;
  final Color foregroundColor;
}
