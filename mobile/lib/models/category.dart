class Category {
  final int id;
  final String name;
  final String? icon;
  final String? color;
  final String type;
  final int? parentId;

  Category({
    required this.id,
    required this.name,
    this.icon,
    this.color,
    required this.type,
    this.parentId,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'],
      name: json['name'],
      icon: json['icon'],
      color: json['color'],
      type: json['type'],
      parentId: json['parentId'],
    );
  }
}