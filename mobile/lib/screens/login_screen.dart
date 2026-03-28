import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.account_balance_wallet, size: 80, color: Color(0xFF6C63FF)),
              const SizedBox(height: 16),
              const Text('Quản lý Chi tiêu', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 8),
              const Text('Đăng nhập để tiếp tục', style: TextStyle(color: Colors.grey)),
              const SizedBox(height: 40),
              TextField(
                controller: _emailController,
                style: const TextStyle(color: Colors.white),
                decoration: _inputDecoration('Email', Icons.email),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                obscureText: true,
                style: const TextStyle(color: Colors.white),
                decoration: _inputDecoration('Mật khẩu', Icons.lock),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _login,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6C63FF),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('Đăng nhập', style: TextStyle(fontSize: 16, color: Colors.white)),
                ),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () => Navigator.pushNamed(context, '/register'),
                child: const Text('Chưa có tài khoản? Đăng ký', style: TextStyle(color: Color(0xFF6C63FF))),
              ),
            ],
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
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
    );
  }

  Future<void> _login() async {
    setState(() => _isLoading = true);
    final success = await context.read<AuthProvider>().login(
      _emailController.text.trim(),
      _passwordController.text.trim(),
    );
    setState(() => _isLoading = false);
    if (success && mounted) {
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Email hoặc mật khẩu không đúng'), backgroundColor: Colors.red),
      );
    }
  }
}