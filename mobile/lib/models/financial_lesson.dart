class FinancialLesson {
  final String id;
  final String title;
  final String category;
  final String difficulty; // beginner, intermediate, advanced
  final int durationMinutes;
  final String description;
  final List<String> topics;
  final List<LessonSection> sections;
  final Quiz? quiz;
  final bool isCompleted;
  final int progress; // 0-100

  FinancialLesson({
    required this.id,
    required this.title,
    required this.category,
    required this.difficulty,
    required this.durationMinutes,
    required this.description,
    required this.topics,
    required this.sections,
    this.quiz,
    this.isCompleted = false,
    this.progress = 0,
  });

  factory FinancialLesson.fromJson(Map<String, dynamic> json) {
    return FinancialLesson(
      id: json['id'].toString(),
      title: json['title'] ?? '',
      category: json['category'] ?? '',
      difficulty: json['difficulty'] ?? 'beginner',
      durationMinutes: json['duration_minutes'] ?? 0,
      description: json['description'] ?? '',
      topics: List<String>.from(json['topics'] ?? []),
      sections: (json['sections'] as List?)
              ?.map((x) => LessonSection.fromJson(x))
              .toList() ??
          [],
      quiz: json['quiz'] != null ? Quiz.fromJson(json['quiz']) : null,
      isCompleted: json['is_completed'] ?? false,
      progress: json['progress'] ?? 0,
    );
  }
}

class LessonSection {
  final String title;
  final String content;
  final String? videoUrl;
  final List<String> keyPoints;

  LessonSection({
    required this.title,
    required this.content,
    this.videoUrl,
    required this.keyPoints,
  });

  factory LessonSection.fromJson(Map<String, dynamic> json) {
    return LessonSection(
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      videoUrl: json['video_url'],
      keyPoints: List<String>.from(json['key_points'] ?? []),
    );
  }
}

class Quiz {
  final List<QuizQuestion> questions;
  final int passingScore;

  Quiz({
    required this.questions,
    required this.passingScore,
  });

  factory Quiz.fromJson(Map<String, dynamic> json) {
    return Quiz(
      questions: (json['questions'] as List?)
              ?.map((x) => QuizQuestion.fromJson(x))
              .toList() ??
          [],
      passingScore: json['passing_score'] ?? 70,
    );
  }
}

class QuizQuestion {
  final String question;
  final List<String> options;
  final int correctAnswer;
  final String explanation;

  QuizQuestion({
    required this.question,
    required this.options,
    required this.correctAnswer,
    required this.explanation,
  });

  factory QuizQuestion.fromJson(Map<String, dynamic> json) {
    return QuizQuestion(
      question: json['question'] ?? '',
      options: List<String>.from(json['options'] ?? []),
      correctAnswer: json['correct_answer'] ?? 0,
      explanation: json['explanation'] ?? '',
    );
  }
}
