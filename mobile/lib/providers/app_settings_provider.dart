import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppSettingsProvider extends ChangeNotifier {
  static const _themeKey = 'app_theme';
  static const _languageKey = 'app_language';

  String _theme = 'midnight';
  String _language = 'vi';

  String get theme => _theme;
  String get language => _language;

  Color get backgroundColor {
    switch (_theme) {
      case 'ocean':
        return const Color(0xFF102A43);
      case 'forest':
        return const Color(0xFF10261F);
      case 'rose':
        return const Color(0xFF2A1C2D);
      default:
        return const Color(0xFF1E1E2E);
    }
  }

  String text(String key) {
    final vi = _localizedVi[key];
    final en = _localizedEn[key];
    return _language == 'en' ? en ?? vi ?? key : vi ?? en ?? key;
  }

  Color get surfaceColor {
    switch (_theme) {
      case 'ocean':
        return const Color(0xFF1B3A57);
      case 'forest':
        return const Color(0xFF1C3A31);
      case 'rose':
        return const Color(0xFF3A2A42);
      default:
        return const Color(0xFF2A2A3E);
    }
  }

  List<Color> get accentGradient {
    switch (_theme) {
      case 'ocean':
        return const [Color(0xFF2563EB), Color(0xFF38BDF8)];
      case 'forest':
        return const [Color(0xFF059669), Color(0xFF34D399)];
      case 'rose':
        return const [Color(0xFFDB2777), Color(0xFFF97316)];
      default:
        return const [Color(0xFF6C63FF), Color(0xFF9C88FF)];
    }
  }

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    _theme = prefs.getString(_themeKey) ?? _theme;
    _language = prefs.getString(_languageKey) ?? _language;
    notifyListeners();
  }

  Future<void> setTheme(String value) async {
    _theme = value;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_themeKey, value);
    notifyListeners();
  }

  Future<void> setLanguage(String value) async {
    _language = value;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_languageKey, value);
    notifyListeners();
  }
}

const _localizedVi = {
  'hello': 'Xin chào! 👋',
  'expenseManagement': 'Quản lý chi tiêu',
  'features': 'Tính năng',
  'recentTransactions': 'Giao dịch gần đây',
  'myWallets': 'Ví của tôi',
  'settings': 'Cài đặt',
  'notifications': 'Thông báo',
  'display': 'Hiển thị',
  'interface': 'Giao diện',
  'personalData': 'Dữ liệu cá nhân',
  'aboutApp': 'Về ứng dụng',
  'language': 'Ngôn ngữ',
  'currency': 'Tiền tệ',
  'appBackground': 'Nền ứng dụng',
};

const _localizedEn = {
  'hello': 'Hello! 👋',
  'expenseManagement': 'Expense management',
  'features': 'Features',
  'recentTransactions': 'Recent transactions',
  'myWallets': 'My wallets',
  'settings': 'Settings',
  'notifications': 'Notifications',
  'display': 'Display',
  'interface': 'Interface',
  'personalData': 'Personal data',
  'aboutApp': 'About app',
  'language': 'Language',
  'currency': 'Currency',
  'appBackground': 'App background',
};
