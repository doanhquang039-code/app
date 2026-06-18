import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../providers/language_learning_provider.dart';

class LanguageLearningScreen extends StatefulWidget {
  const LanguageLearningScreen({super.key});

  @override
  State<LanguageLearningScreen> createState() => _LanguageLearningScreenState();
}

class _LanguageLearningScreenState extends State<LanguageLearningScreen> {
  final _languages = ['English', 'Japanese', 'Korean', 'Chinese', 'French'];
  final _levels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced'];
  final _skills = ['Speaking', 'Listening', 'Vocabulary', 'Grammar', 'Exam prep'];
  final _times = ['07:30', '09:00', '10:30', '13:30', '15:00', '18:30', '20:00'];
  final _durations = [30, 45, 60];
  final _tutors = ['AI Tutor', 'Emma Wilson', 'Mika Tanaka', 'Daniel Park'];

  String _language = 'English';
  String _level = 'Intermediate';
  String _skill = 'Speaking';
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  String _time = '18:30';
  int _duration = 45;
  String _tutor = 'AI Tutor';

  String _getVietnameseDayOfWeek(DateTime date) {
    switch (date.weekday) {
      case DateTime.monday:
        return 'T2';
      case DateTime.tuesday:
        return 'T3';
      case DateTime.wednesday:
        return 'T4';
      case DateTime.thursday:
        return 'T5';
      case DateTime.friday:
        return 'T6';
      case DateTime.saturday:
        return 'T7';
      case DateTime.sunday:
        return 'CN';
      default:
        return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<LanguageLearningProvider>(
      builder: (context, learning, _) {
        final nextLesson = learning.nextLesson;
        return Scaffold(
          backgroundColor: const Color(0xFF1E1E2E),
          appBar: AppBar(
            backgroundColor: const Color(0xFF1E1E2E),
            title: const Text('Học ngoại ngữ', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            iconTheme: const IconThemeData(color: Colors.white),
          ),
          body: !learning.loaded
              ? const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF)))
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    _heroCard(nextLesson),
                    const SizedBox(height: 18),
                    Row(
                      children: [
                        Expanded(child: _metricCard('${learning.bookedCount}', 'Lịch đã đặt', Icons.event_available_rounded, const Color(0xFF38BDF8))),
                        const SizedBox(width: 12),
                        Expanded(child: _metricCard('${learning.completedCount}', 'Buổi hoàn thành', Icons.check_circle_rounded, const Color(0xFF34D399))),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(child: _metricCard('${learning.plannedMinutes}', 'Phút đã lên lịch', Icons.timer_rounded, const Color(0xFFF97316))),
                        const SizedBox(width: 12),
                        Expanded(child: _metricCard('${learning.streakDays}', 'Streak ngày', Icons.local_fire_department_rounded, const Color(0xFFEB5757))),
                      ],
                    ),
                    const SizedBox(height: 18),
                    const Text('Đặt lịch học', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    _bookingCard(learning),
                    const SizedBox(height: 22),
                    const Text('Lịch đã đặt', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    if (learning.lessons.isEmpty)
                      _emptyState()
                    else
                      ...learning.lessons.map((lesson) => _lessonTile(learning, lesson)),
                  ],
                ),
        );
      },
    );
  }

  Widget _heroCard(LanguageLesson? nextLesson) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF2563EB), Color(0xFF14B8A6)]),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.language_rounded, color: Colors.white, size: 34),
          const SizedBox(height: 14),
          const Text('Chọn ngày trước, học đúng nhịp', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          Text(
            nextLesson == null
                ? 'Chưa có buổi sắp tới. Đặt lịch để hệ thống nhắc và lưu tiến độ.'
                : 'Buổi tiếp theo: ${nextLesson.language} lúc ${nextLesson.time}, ${DateFormat('dd/MM').format(nextLesson.date)}.',
            style: const TextStyle(color: Colors.white70),
          ),
        ],
      ),
    );
  }

  Widget _bookingCard(LanguageLearningProvider learning) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: const Color(0xFF2A2A3E), borderRadius: BorderRadius.circular(18)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _select('Ngôn ngữ', _language, _languages, (value) => setState(() => _language = value)),
          const SizedBox(height: 10),
          _select('Trình độ', _level, _levels, (value) => setState(() => _level = value)),
          const SizedBox(height: 10),
          _select('Kỹ năng', _skill, _skills, (value) => setState(() => _skill = value)),
          const SizedBox(height: 10),
          _select('Gia sư', _tutor, _tutors, (value) => setState(() => _tutor = value)),
          const SizedBox(height: 14),
          const Text('Ngày học', style: TextStyle(color: Colors.grey, fontSize: 12)),
          const SizedBox(height: 8),
          SizedBox(
            height: 70,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: 14,
              itemBuilder: (_, index) {
                final date = DateTime.now().add(Duration(days: index));
                final selected = DateUtils.isSameDay(date, _selectedDate);
                return GestureDetector(
                  onTap: () => setState(() => _selectedDate = date),
                  child: Container(
                    width: 72,
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: selected ? const Color(0xFF6C63FF) : const Color(0xFF1E1E2E),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: selected ? const Color(0xFF9C88FF) : Colors.white12),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(index == 0 ? 'Hôm nay' : _getVietnameseDayOfWeek(date), style: const TextStyle(color: Colors.white, fontSize: 11)),
                        Text(DateFormat('dd/MM').format(date), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _times.map((slot) {
              final selected = slot == _time;
              return ChoiceChip(
                label: Text(slot),
                selected: selected,
                onSelected: (_) => setState(() => _time = slot),
                selectedColor: const Color(0xFF6C63FF),
                backgroundColor: const Color(0xFF1E1E2E),
                labelStyle: const TextStyle(color: Colors.white),
              );
            }).toList(),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            children: _durations.map((minutes) {
              return ChoiceChip(
                label: Text('$minutes phút'),
                selected: _duration == minutes,
                onSelected: (_) => setState(() => _duration = minutes),
                selectedColor: const Color(0xFF14B8A6),
                backgroundColor: const Color(0xFF1E1E2E),
                labelStyle: const TextStyle(color: Colors.white),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () => _bookLesson(learning),
              icon: const Icon(Icons.add_rounded),
              label: const Text('Đặt lịch học'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF6C63FF),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _select(String label, String value, List<String> options, ValueChanged<String> onChanged) {
    return DropdownButtonFormField<String>(
      initialValue: value,
      dropdownColor: const Color(0xFF1E1E2E),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.grey),
        filled: true,
        fillColor: const Color(0xFF1E1E2E),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
      ),
      style: const TextStyle(color: Colors.white),
      items: options.map((item) => DropdownMenuItem(value: item, child: Text(item))).toList(),
      onChanged: (value) {
        if (value != null) onChanged(value);
      },
    );
  }

  Widget _metricCard(String value, String label, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: const Color(0xFF2A2A3E), borderRadius: BorderRadius.circular(16)),
      child: Row(
        children: [
          Icon(icon, color: color),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(value, style: TextStyle(color: color, fontSize: 20, fontWeight: FontWeight.bold)),
                Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _lessonTile(LanguageLearningProvider learning, LanguageLesson lesson) {
    final isPast = lesson.startsAt.isBefore(DateTime.now());
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: lesson.completed ? const Color(0xFF34D399).withOpacity(0.5) : Colors.transparent),
      ),
      child: InkWell(
        onTap: lesson.completed
            ? null
            : () {
                Navigator.pushNamed(
                  context,
                  '/language-chat',
                  arguments: lesson,
                );
              },
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: const Color(0xFF38BDF8).withOpacity(0.15), borderRadius: BorderRadius.circular(12)),
                child: Icon(lesson.completed ? Icons.check_rounded : Icons.school_rounded, color: const Color(0xFF38BDF8)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('${lesson.language} - ${lesson.skill}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    Text(
                      '${DateFormat('dd/MM').format(lesson.date)} lúc ${lesson.time} • ${lesson.durationMinutes} phút • ${lesson.level} • ${lesson.tutor}',
                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                    if (isPast && !lesson.completed)
                      const Text('Đã đến giờ, đánh dấu hoàn thành nếu bạn đã học.', style: TextStyle(color: Color(0xFFF97316), fontSize: 11)),
                    if (!lesson.completed)
                      const Padding(
                        padding: EdgeInsets.only(top: 4),
                        child: Text('👉 Bấm để vào lớp học AI', style: TextStyle(color: Color(0xFF34D399), fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                  ],
                ),
              ),
              IconButton(
                tooltip: lesson.completed ? 'Bỏ hoàn thành' : 'Hoàn thành',
                onPressed: () => learning.toggleCompleted(lesson.id),
                icon: Icon(lesson.completed ? Icons.undo_rounded : Icons.check_circle_outline_rounded, color: const Color(0xFF34D399)),
              ),
              IconButton(
                tooltip: 'Hủy lịch',
                onPressed: () => learning.cancelLesson(lesson.id),
                icon: const Icon(Icons.close_rounded, color: Colors.grey),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _emptyState() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: const Color(0xFF2A2A3E), borderRadius: BorderRadius.circular(16)),
      child: const Column(
        children: [
          Icon(Icons.event_busy_rounded, color: Colors.grey, size: 34),
          SizedBox(height: 10),
          Text('Chưa có lịch học nào', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          SizedBox(height: 4),
          Text('Chọn ngày trước rồi đặt buổi học đầu tiên.', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }

  Future<void> _bookLesson(LanguageLearningProvider learning) async {
    final error = await learning.bookLesson(
      language: _language,
      level: _level,
      skill: _skill,
      date: _selectedDate,
      time: _time,
      durationMinutes: _duration,
      tutor: _tutor,
    );

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(error ?? 'Đã đặt lịch $_language lúc $_time'),
        backgroundColor: error == null ? const Color(0xFF6C63FF) : const Color(0xFFEB5757),
      ),
    );
  }
}
