class NotificationModel {
  final int id;
  final String title;
  final String message;
  final String type;
  final String severity;
  final bool isRead;
  final DateTime createdAt;
  final String? actionUrl;

  NotificationModel({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.severity,
    required this.isRead,
    required this.createdAt,
    this.actionUrl,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) =>
      NotificationModel(
        id: json['id'],
        title: json['title'] ?? '',
        message: json['message'] ?? '',
        type: json['type'] ?? 'INFO',
        severity: json['severity'] ?? 'INFO',
        isRead: json['isRead'] ?? false,
        createdAt: json['createdAt'] != null
            ? DateTime.parse(json['createdAt'])
            : DateTime.now(),
        actionUrl: json['actionUrl'],
      );
}
