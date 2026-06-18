import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/language_learning_provider.dart';

class LanguageChatScreen extends StatefulWidget {
  const LanguageChatScreen({super.key, required this.lesson});

  final LanguageLesson lesson;

  @override
  State<LanguageChatScreen> createState() => _LanguageChatScreenState();
}

class _LanguageChatScreenState extends State<LanguageChatScreen> {
  final List<Map<String, dynamic>> _messages = [];
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isTutorTyping = false;
  late int _secondsElapsed;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _secondsElapsed = 0;
    _startTimer();
    _initTutorGreeting();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _secondsElapsed++;
      });
    });
  }

  String get _formattedDuration {
    final minutes = _secondsElapsed ~/ 60;
    final seconds = _secondsElapsed % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  void _initTutorGreeting() {
    setState(() {
      _isTutorTyping = true;
    });

    Future.delayed(const Duration(milliseconds: 1500), () {
      if (!mounted) return;
      String greeting = '';
      switch (widget.lesson.language.toLowerCase()) {
        case 'japanese':
          greeting = 'Konnichiwa! 🌸 Mình là ${widget.lesson.tutor}, gia sư tiếng Nhật của bạn hôm nay. '
              'Chúng ta sẽ cùng luyện tập kỹ năng ${widget.lesson.skill} ở trình độ ${widget.lesson.level} nhé. '
              'Bạn đã sẵn sàng chưa? Hãy chào mình bằng tiếng Nhật nào!';
          break;
        case 'korean':
          greeting = 'Annyeonghaseyo! 🇰🇷 Mình là ${widget.lesson.tutor}, gia sư tiếng Hàn của bạn. '
              'Hôm nay chúng ta sẽ học kỹ năng ${widget.lesson.skill} (${widget.lesson.level}). '
              'Hãy cùng bắt đầu bằng một lời chào tiếng Hàn nhé!';
          break;
        case 'chinese':
          greeting = 'Nǐ hǎo! 🇨🇳 Chào mừng bạn đến với buổi học tiếng Trung cùng ${widget.lesson.tutor}. '
              'Hôm nay chúng ta sẽ luyện tập kỹ năng ${widget.lesson.skill} (${widget.lesson.level}). '
              'Hãy gõ lời chào để chúng ta bắt đầu bài học nhé!';
          break;
        case 'french':
          greeting = 'Bonjour! 🇨🇵 Mình là ${widget.lesson.tutor}, gia sư tiếng Pháp của bạn. '
              'Buổi học hôm nay tập trung vào kỹ năng ${widget.lesson.skill} ở cấp độ ${widget.lesson.level}. '
              'Comment ça va? Hãy bắt đầu trò chuyện nhé!';
          break;
        default: // English
          greeting = 'Hello! 👋 I am ${widget.lesson.tutor}, your AI English tutor today. '
              'We will practice your ${widget.lesson.skill} skills at the ${widget.lesson.level} level. '
              'How are you doing today? Let\'s start our conversation!';
      }

      setState(() {
        _messages.add({
          'sender': 'tutor',
          'text': greeting,
          'time': DateTime.now(),
        });
        _isTutorTyping = false;
      });
      _scrollToBottom();
    });
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _sendMessage() {
    final text = _inputController.text.trim();
    if (text.isEmpty) return;

    _inputController.clear();
    setState(() {
      _messages.add({
        'sender': 'user',
        'text': text,
        'time': DateTime.now(),
      });
      _isTutorTyping = true;
    });
    _scrollToBottom();

    // Generate smart mock AI response based on language, level, and skill
    Future.delayed(const Duration(milliseconds: 2000), () {
      if (!mounted) return;
      final response = _generateTutorResponse(text);
      setState(() {
        _messages.add({
          'sender': 'tutor',
          'text': response,
          'time': DateTime.now(),
        });
        _isTutorTyping = false;
      });
      _scrollToBottom();
    });
  }

  String _generateTutorResponse(String userText) {
    final lang = widget.lesson.language.toLowerCase();
    final skill = widget.lesson.skill.toLowerCase();
    final level = widget.lesson.level.toLowerCase();

    // Check if the user is just saying hello/ready
    final lowerText = userText.toLowerCase();
    final isGreeting = lowerText.contains('hello') ||
        lowerText.contains('hi') ||
        lowerText.contains('chào') ||
        lowerText.contains('xin chào') ||
        lowerText.contains('ready') ||
        lowerText.contains('sẵn sàng') ||
        lowerText.contains('konnichiwa') ||
        lowerText.contains('annyeong') ||
        lowerText.contains('bonjour');

    if (lang == 'japanese') {
      if (isGreeting) {
        return 'Tuyệt vời! 👍 Hãy bắt đầu bằng cách giới thiệu bản thân một chút bằng tiếng Nhật nhé (tên, tuổi hoặc sở thích của bạn).';
      }
      if (skill.contains('vocabulary')) {
        return 'Rất tốt! 🌟 Bạn có thể liệt kê 3 từ vựng tiếng Nhật liên quan đến chủ đề "Thời tiết" (O-tenki) không? Mình sẽ sửa cách phát âm và giải nghĩa cho bạn.';
      }
      if (skill.contains('speaking') || skill.contains('listening')) {
        return 'Hay lắm! 👏 Mình xin đặt câu hỏi phản xạ: 「お休みの日は何をしますか？」(Vào ngày nghỉ bạn thường làm gì?). Hãy thử trả lời bằng tiếng Nhật nhé.';
      }
      return 'Tiến bộ lắm! 📝 Hãy thử dịch câu này sang tiếng Nhật: "Hôm nay thời tiết rất đẹp."';
    }

    if (lang == 'korean') {
      if (isGreeting) {
        return 'Chính xác! 👏 Bây giờ bạn hãy viết một câu giới thiệu bản thân đơn giản (ví dụ: Tên, quốc tịch) bằng tiếng Hàn xem sao nhé.';
      }
      if (skill.contains('vocabulary')) {
        return 'Giỏi quá! 🌟 Hãy thử kể tên 3 món ăn Hàn Quốc mà bạn biết bằng tiếng Hàn (ví dụ: 김치 - Kimchi).';
      }
      return 'Đúng rồi! 👍 Hãy luyện tập phản xạ với câu hỏi: 「오늘 날씨가 어때요?」(Hôm nay thời tiết thế nào?). Hãy viết câu trả lời bên dưới nhé.';
    }

    if (lang == 'chinese') {
      if (isGreeting) {
        return '太好了 (Tốt quá)! 🇨🇳 Bây giờ, bạn hãy thử giới thiệu tên mình bằng tiếng Trung xem sao nhé (ví dụ: 我叫...)';
      }
      if (skill.contains('vocabulary')) {
        return 'Rất xuất sắc! 🌟 Thử thách từ vựng: Bạn hãy viết 3 từ tiếng Trung về chủ đề "Gia đình" kèm theo phiên âm Pinyin nhé.';
      }
      return 'Rất chuẩn! 👍 Hãy trả lời câu hỏi giao tiếp sau: “你今天忙吗？” (Hôm nay bạn có bận không?)';
    }

    if (lang == 'french') {
      if (isGreeting) {
        return 'Excellent! 🇨🇵 Commençons par une question simple: Comment tu t\'appelles et d\'où viens-tu? (Bạn tên gì và đến từ đâu?)';
      }
      if (skill.contains('vocabulary')) {
        return 'Super! 🌟 Connaissez-vous les fruits en français? Pouvez-vous citer 3 fruits en français?';
      }
      return 'Très bien! 👍 Répondez à cette question: Quel temps fait-il aujourd\'hui chez vous?';
    }

    // Default: English
    if (isGreeting) {
      if (level.contains('beginner') || level.contains('elementary')) {
        return 'Great! Let\'s start with a simple question. What is your favorite hobby, and why do you like it?';
      } else {
        return 'Fantastic! Let\'s dive into our topic today. In your opinion, what are the key benefits and challenges of remote work in the modern world?';
      }
    }

    if (skill.contains('vocabulary')) {
      return 'Excellent usage of words! 🌟 Let\'s build on that. Can you think of 3 synonyms for the word "IMPACT"? Using varied vocabulary is key to improving your level.';
    }

    if (skill.contains('grammar')) {
      return 'Your grammar looks correct! 📝 Let\'s practice conditional sentences. Complete this sentence: "If I had one million dollars, I would..."';
    }

    if (skill.contains('speaking')) {
      return 'That is a very interesting point! 💬 How would you explain this concept to someone who has never heard of it before? Try to expand your answer with examples.';
    }

    return 'I see! That is correct. 👍 Let\'s continue practicing. Tell me more about your daily routine or what you plan to do after this class.';
  }

  void _finishLesson() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF2A2A3E),
        title: const Text('Hoàn thành buổi học', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Chúc mừng bạn đã hoàn thành buổi học!', style: TextStyle(color: Colors.white70)),
            const SizedBox(height: 14),
            Text('⏱️ Thời gian học: $_formattedDuration', style: const TextStyle(color: Colors.white)),
            const SizedBox(height: 6),
            Text('📚 Ngôn ngữ: ${widget.lesson.language}', style: const TextStyle(color: Colors.white)),
            const SizedBox(height: 6),
            Text('🧠 Kỹ năng luyện tập: ${widget.lesson.skill}', style: const TextStyle(color: Colors.white)),
            const SizedBox(height: 12),
            const Text(
              'Lưu ý: Hệ thống sẽ ghi nhận buổi học hoàn thành, cộng thêm điểm rèn luyện và tăng chuỗi Streak của bạn!',
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Tiếp tục học', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx); // Close Dialog
              
              // Mark lesson completed
              await Provider.of<LanguageLearningProvider>(context, listen: false)
                  .toggleCompleted(widget.lesson.id);
              
              if (mounted) {
                Navigator.pop(context); // Return to Lang Learning Screen
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('🎉 Chúc mừng bạn đã hoàn thành bài học ${widget.lesson.language}!'),
                    backgroundColor: const Color(0xFF34D399),
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF34D399),
              foregroundColor: Colors.white,
            ),
            child: const Text('Xác nhận'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final accentColor = const Color(0xFF6C63FF);

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF2A2A3E),
        elevation: 1,
        title: Row(
          children: [
            CircleAvatar(
              backgroundColor: accentColor.withOpacity(0.2),
              child: Text(
                widget.lesson.language[0] + (widget.lesson.language.length > 1 ? widget.lesson.language[1] : ''),
                style: TextStyle(color: accentColor, fontWeight: FontWeight.bold, fontSize: 13),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.lesson.tutor,
                    style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '${widget.lesson.language} • ${widget.lesson.skill} (${widget.lesson.level})',
                    style: const TextStyle(color: Colors.grey, fontSize: 11),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            margin: const EdgeInsets.only(right: 8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.08),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                const Icon(Icons.timer_outlined, color: Colors.grey, size: 14),
                const SizedBox(width: 4),
                Text(
                  _formattedDuration,
                  style: const TextStyle(color: Colors.grey, fontSize: 12, fontFamily: 'monospace'),
                ),
              ],
            ),
          ),
          IconButton(
            tooltip: 'Hoàn thành học',
            icon: const Icon(Icons.check_box_rounded, color: Color(0xFF34D399)),
            onPressed: _finishLesson,
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: _messages.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(color: accentColor),
                        const SizedBox(height: 12),
                        const Text('Đang kết nối với gia sư...', style: TextStyle(color: Colors.grey)),
                      ],
                    ),
                  )
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: _messages.length + (_isTutorTyping ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == _messages.length) {
                        return _buildTypingIndicator();
                      }
                      final message = _messages[index];
                      final isUser = message['sender'] == 'user';
                      return _buildMessageBubble(message['text'] as String, isUser);
                    },
                  ),
          ),
          _buildInputBar(),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(String text, bool isUser) {
    final alignment = isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start;
    final bgColor = isUser ? const Color(0xFF6C63FF) : const Color(0xFF2A2A3E);
    final textColor = Colors.white;
    final borderRadius = isUser
        ? const BorderRadius.only(
            topLeft: Radius.circular(16),
            topRight: Radius.circular(16),
            bottomLeft: Radius.circular(16),
          )
        : const BorderRadius.only(
            topLeft: Radius.circular(16),
            topRight: Radius.circular(16),
            bottomRight: Radius.circular(16),
          );

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: alignment,
        children: [
          Container(
            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: borderRadius,
              border: isUser ? null : Border.all(color: Colors.white12),
            ),
            child: Text(
              text,
              style: TextStyle(color: textColor, fontSize: 14, height: 1.3),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      alignment: Alignment.centerLeft,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: const Color(0xFF2A2A3E),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white12),
        ),
        child: const SizedBox(
          width: 32,
          child: LinearProgressIndicator(
            backgroundColor: Colors.transparent,
            color: Color(0xFF6C63FF),
          ),
        ),
      ),
    );
  }

  Widget _buildInputBar() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: const BoxDecoration(
        color: Color(0xFF2A2A3E),
        border: Border(top: BorderSide(color: Colors.white12)),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _inputController,
              textCapitalization: TextCapitalization.sentences,
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Nhập câu trả lời của bạn...',
                hintStyle: const TextStyle(color: Colors.grey, fontSize: 14),
                filled: true,
                fillColor: const Color(0xFF1E1E2E),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: BorderSide.none,
                ),
              ),
              onSubmitted: (_) => _sendMessage(),
            ),
          ),
          const SizedBox(width: 8),
          CircleAvatar(
            backgroundColor: const Color(0xFF6C63FF),
            child: IconButton(
              icon: const Icon(Icons.send_rounded, color: Colors.white, size: 18),
              onPressed: _sendMessage,
            ),
          ),
        ],
      ),
    );
  }
}
