import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LanguageLesson {
  const LanguageLesson({
    required this.id,
    required this.language,
    required this.level,
    required this.skill,
    required this.date,
    required this.time,
    required this.durationMinutes,
    required this.tutor,
    this.completed = false,
  });

  final String id;
  final String language;
  final String level;
  final String skill;
  final DateTime date;
  final String time;
  final int durationMinutes;
  final String tutor;
  final bool completed;

  DateTime get startsAt {
    final parts = time.split(':');
    return DateTime(
      date.year,
      date.month,
      date.day,
      int.parse(parts[0]),
      int.parse(parts[1]),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'language': language,
        'level': level,
        'skill': skill,
        'date': date.toIso8601String(),
        'time': time,
        'durationMinutes': durationMinutes,
        'tutor': tutor,
        'completed': completed,
      };

  factory LanguageLesson.fromJson(Map<String, dynamic> json) {
    return LanguageLesson(
      id: json['id']?.toString() ?? DateTime.now().microsecondsSinceEpoch.toString(),
      language: json['language']?.toString() ?? 'English',
      level: json['level']?.toString() ?? 'Beginner',
      skill: json['skill']?.toString() ?? 'Speaking',
      date: DateTime.tryParse(json['date']?.toString() ?? '') ?? DateTime.now(),
      time: json['time']?.toString() ?? '18:30',
      durationMinutes: int.tryParse(json['durationMinutes']?.toString() ?? '45') ?? 45,
      tutor: json['tutor']?.toString() ?? 'AI Tutor',
      completed: json['completed'] == true,
    );
  }

  LanguageLesson copyWith({bool? completed}) {
    return LanguageLesson(
      id: id,
      language: language,
      level: level,
      skill: skill,
      date: date,
      time: time,
      durationMinutes: durationMinutes,
      tutor: tutor,
      completed: completed ?? this.completed,
    );
  }
}

class LanguageLearningProvider extends ChangeNotifier {
  static const _storageKey = 'language_lessons';

  final List<LanguageLesson> _lessons = [];
  bool _loaded = false;

  List<LanguageLesson> get lessons => List.unmodifiable(_sortedLessons());
  bool get loaded => _loaded;
  int get completedCount => _lessons.where((lesson) => lesson.completed).length;
  int get bookedCount => _lessons.length;
  int get plannedMinutes => _lessons.fold(0, (sum, lesson) => sum + lesson.durationMinutes);

  LanguageLesson? get nextLesson {
    final now = DateTime.now();
    final upcoming = _lessons.where((lesson) => !lesson.completed && lesson.startsAt.isAfter(now)).toList()
      ..sort((a, b) => a.startsAt.compareTo(b.startsAt));
    return upcoming.isEmpty ? null : upcoming.first;
  }

  int get streakDays {
    final completedDays = _lessons
        .where((lesson) => lesson.completed)
        .map((lesson) => DateTime(lesson.date.year, lesson.date.month, lesson.date.day))
        .toSet();
    var streak = 0;
    var cursor = DateTime.now();
    while (completedDays.contains(DateTime(cursor.year, cursor.month, cursor.day))) {
      streak++;
      cursor = cursor.subtract(const Duration(days: 1));
    }
    return streak;
  }

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_storageKey);
    _lessons
      ..clear()
      ..addAll(_decodeLessons(raw));

    if (_lessons.isEmpty) {
      _lessons.addAll(_seedLessons());
      await _save();
    }

    _loaded = true;
    notifyListeners();
  }

  Future<String?> bookLesson({
    required String language,
    required String level,
    required String skill,
    required DateTime date,
    required String time,
    required int durationMinutes,
    required String tutor,
  }) async {
    final day = DateTime(date.year, date.month, date.day);
    final duplicate = _lessons.any((lesson) =>
        DateUtils.isSameDay(lesson.date, day) && lesson.time == time && !lesson.completed);
    if (duplicate) return 'Khung giờ này đã có lịch học.';

    final lesson = LanguageLesson(
      id: DateTime.now().microsecondsSinceEpoch.toString(),
      language: language,
      level: level,
      skill: skill,
      date: day,
      time: time,
      durationMinutes: durationMinutes,
      tutor: tutor,
    );

    _lessons.add(lesson);
    await _save();
    notifyListeners();
    return null;
  }

  Future<void> toggleCompleted(String id) async {
    final index = _lessons.indexWhere((lesson) => lesson.id == id);
    if (index == -1) return;
    _lessons[index] = _lessons[index].copyWith(completed: !_lessons[index].completed);
    await _save();
    notifyListeners();
  }

  Future<void> cancelLesson(String id) async {
    _lessons.removeWhere((lesson) => lesson.id == id);
    await _save();
    notifyListeners();
  }

  Future<void> clearAll() async {
    _lessons.clear();
    await _save();
    notifyListeners();
  }

  List<LanguageLesson> _sortedLessons() {
    return [..._lessons]..sort((a, b) => a.startsAt.compareTo(b.startsAt));
  }

  List<LanguageLesson> _decodeLessons(String? raw) {
    if (raw == null || raw.isEmpty) return [];
    try {
      final decoded = jsonDecode(raw);
      if (decoded is! List) return [];
      return decoded
          .whereType<Map>()
          .map((item) => LanguageLesson.fromJson(Map<String, dynamic>.from(item)))
          .toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> _save() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_storageKey, jsonEncode(_lessons.map((lesson) => lesson.toJson()).toList()));
  }

  List<LanguageLesson> _seedLessons() {
    final today = DateTime.now();
    return [
      LanguageLesson(
        id: 'seed-english',
        language: 'English',
        level: 'Intermediate',
        skill: 'Speaking',
        date: DateTime(today.year, today.month, today.day),
        time: '18:30',
        durationMinutes: 45,
        tutor: 'Emma Wilson',
      ),
      LanguageLesson(
        id: 'seed-japanese',
        language: 'Japanese',
        level: 'Beginner',
        skill: 'Vocabulary',
        date: DateTime(today.year, today.month, today.day).add(const Duration(days: 2)),
        time: '20:00',
        durationMinutes: 30,
        tutor: 'Mika Tanaka',
      ),
    ];
  }
}
