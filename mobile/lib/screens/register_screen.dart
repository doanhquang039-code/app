import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/social_auth_buttons.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: SingleChildScrollView(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.person_add,
                  size: 80,
                  color: Color(0xFF6C63FF),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Tạo tài khoản',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 28),
                const SocialAuthButtons(actionLabel: 'Đăng ký'),
                const SizedBox(height: 22),
                TextField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                  style: const TextStyle(color: Colors.white),
                  decoration: _inputDecoration('Email', Icons.email),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _passwordController,
                  obscureText: true,
                  textInputAction: TextInputAction.done,
                  onSubmitted: (_) => _register(),
                  style: const TextStyle(color: Colors.white),
                  decoration: _inputDecoration('Mật khẩu', Icons.lock),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _register,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6C63FF),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: _isLoading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text(
                            'Đăng ký',
                            style: TextStyle(fontSize: 16, color: Colors.white),
                          ),
                  ),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text(
                    'Đã có tài khoản? Đăng nhập',
                    style: TextStyle(color: Color(0xFF6C63FF)),
                  ),
                ),
              ],
            ),
          ),
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
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
    );
  }

  Future<void> _register() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();
    final validationError = _validate(email, password);
    if (validationError != null) {
      _showMessage(validationError, Colors.red);
      return;
    }

    setState(() => _isLoading = true);
    final auth = context.read<AuthProvider>();
    final success = await auth.register(email, password);
    if (!mounted) return;
    setState(() => _isLoading = false);
    if (success) {
      _showMessage('Đăng ký thành công!', Colors.green);
      Navigator.pop(context);
    } else {
      _showMessage(auth.lastError ?? 'Đăng ký thất bại!', Colors.red);
    }
  }

  String? _validate(String email, String password) {
    if (email.isEmpty) return 'Vui lòng nhập email';
    final emailRegex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
    if (!emailRegex.hasMatch(email)) return 'Email không hợp lệ';
    if (password.isEmpty) return 'Vui lòng nhập mật khẩu';
    if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
    return null;
  }

  void _showMessage(String message, Color color) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message), backgroundColor: color));
  }
}
