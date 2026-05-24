import 'dart:async';
import 'dart:convert';

import 'package:app_links/app_links.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';

final GlobalKey<NavigatorState> oauthNavigatorKey = GlobalKey<NavigatorState>();

class OAuthDeepLinkHandler extends StatefulWidget {
  const OAuthDeepLinkHandler({super.key, required this.child});

  final Widget child;

  @override
  State<OAuthDeepLinkHandler> createState() => _OAuthDeepLinkHandlerState();
}

class _OAuthDeepLinkHandlerState extends State<OAuthDeepLinkHandler> {
  final AppLinks _appLinks = AppLinks();
  StreamSubscription<Uri>? _subscription;

  @override
  void initState() {
    super.initState();
    _listenForLinks();
  }

  Future<void> _listenForLinks() async {
    _subscription = _appLinks.uriLinkStream.listen(_handleLink);

    final initialUri = await _appLinks.getInitialLink();
    if (initialUri != null) {
      _handleLink(initialUri);
    }
  }

  Future<void> _handleLink(Uri uri) async {
    if (uri.scheme != 'expensetracker' || uri.host != 'auth' || uri.path != '/callback') {
      return;
    }

    final error = uri.queryParameters['error'];
    if (error != null && error.isNotEmpty) {
      _showMessage(Uri.decodeComponent(error));
      return;
    }

    final payload = uri.queryParameters['payload'];
    if (payload == null || payload.isEmpty) {
      _showMessage('Không nhận được dữ liệu đăng nhập');
      return;
    }

    try {
      final normalizedPayload = payload.replaceAll('-', '+').replaceAll('_', '/');
      final paddedPayload = normalizedPayload.padRight(
        normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
        '=',
      );
      final decoded = jsonDecode(utf8.decode(base64Decode(paddedPayload))) as Map<String, dynamic>;
      final token = decoded['access_token'] as String?;
      if (token == null || token.isEmpty) {
        throw const FormatException('Missing token');
      }

      if (!mounted) return;
      await context.read<AuthProvider>().completeSocialLogin(token);
      oauthNavigatorKey.currentState?.pushNamedAndRemoveUntil('/home', (_) => false);
    } catch (_) {
      _showMessage('Dữ liệu đăng nhập không hợp lệ');
    }
  }

  void _showMessage(String message) {
    final currentContext = oauthNavigatorKey.currentContext ?? context;
    ScaffoldMessenger.of(currentContext).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
