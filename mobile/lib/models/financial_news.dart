class FinancialNews {
  final String id;
  final String title;
  final String summary;
  final String content;
  final String category; // market, crypto, stocks, economy, personal_finance
  final String source;
  final String author;
  final DateTime publishedAt;
  final String? imageUrl;
  final String url;
  final List<String> tags;
  final bool isBookmarked;

  FinancialNews({
    required this.id,
    required this.title,
    required this.summary,
    required this.content,
    required this.category,
    required this.source,
    required this.author,
    required this.publishedAt,
    this.imageUrl,
    required this.url,
    required this.tags,
    this.isBookmarked = false,
  });

  factory FinancialNews.fromJson(Map<String, dynamic> json) {
    return FinancialNews(
      id: json['id'].toString(),
      title: json['title'] ?? '',
      summary: json['summary'] ?? '',
      content: json['content'] ?? '',
      category: json['category'] ?? 'market',
      source: json['source'] ?? '',
      author: json['author'] ?? '',
      publishedAt: DateTime.parse(json['published_at'] ?? DateTime.now().toIso8601String()),
      imageUrl: json['image_url'],
      url: json['url'] ?? '',
      tags: List<String>.from(json['tags'] ?? []),
      isBookmarked: json['is_bookmarked'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'summary': summary,
      'content': content,
      'category': category,
      'source': source,
      'author': author,
      'published_at': publishedAt.toIso8601String(),
      'image_url': imageUrl,
      'url': url,
      'tags': tags,
      'is_bookmarked': isBookmarked,
    };
  }
}
