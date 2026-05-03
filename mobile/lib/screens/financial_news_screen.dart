import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/financial_news.dart';

class FinancialNewsScreen extends StatefulWidget {
  const FinancialNewsScreen({super.key});

  @override
  State<FinancialNewsScreen> createState() => _FinancialNewsScreenState();
}

class _FinancialNewsScreenState extends State<FinancialNewsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  final List<FinancialNews> _allNews = [
    FinancialNews(
      id: '1',
      title: 'Stock Market Hits Record High Amid Economic Recovery',
      summary: 'Major indices reach all-time highs as investors show confidence in economic growth.',
      content: 'Full article content here...',
      category: 'market',
      source: 'Financial Times',
      author: 'John Smith',
      publishedAt: DateTime.now().subtract(const Duration(hours: 2)),
      imageUrl: 'https://example.com/image1.jpg',
      url: 'https://example.com/article1',
      tags: ['stocks', 'market', 'economy'],
    ),
    FinancialNews(
      id: '2',
      title: 'Bitcoin Surges Past \$50,000 Mark',
      summary: 'Cryptocurrency market sees significant gains as institutional adoption increases.',
      content: 'Full article content here...',
      category: 'crypto',
      source: 'CoinDesk',
      author: 'Jane Doe',
      publishedAt: DateTime.now().subtract(const Duration(hours: 5)),
      url: 'https://example.com/article2',
      tags: ['bitcoin', 'crypto', 'blockchain'],
    ),
    FinancialNews(
      id: '3',
      title: 'Fed Announces Interest Rate Decision',
      summary: 'Federal Reserve maintains current interest rates, signals cautious approach.',
      content: 'Full article content here...',
      category: 'economy',
      source: 'Bloomberg',
      author: 'Mike Johnson',
      publishedAt: DateTime.now().subtract(const Duration(hours: 8)),
      url: 'https://example.com/article3',
      tags: ['fed', 'interest rates', 'economy'],
    ),
    FinancialNews(
      id: '4',
      title: '5 Tips for Building Your Emergency Fund',
      summary: 'Financial experts share strategies for creating a solid financial safety net.',
      content: 'Full article content here...',
      category: 'personal_finance',
      source: 'Money Magazine',
      author: 'Sarah Williams',
      publishedAt: DateTime.now().subtract(const Duration(days: 1)),
      url: 'https://example.com/article4',
      tags: ['savings', 'emergency fund', 'personal finance'],
    ),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Financial News'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: const [
            Tab(text: 'All'),
            Tab(text: 'Market'),
            Tab(text: 'Crypto'),
            Tab(text: 'Economy'),
            Tab(text: 'Personal Finance'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.bookmark),
            onPressed: () {
              // Show bookmarked articles
            },
          ),
        ],
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildNewsList(_allNews),
          _buildNewsList(_allNews.where((n) => n.category == 'market').toList()),
          _buildNewsList(_allNews.where((n) => n.category == 'crypto').toList()),
          _buildNewsList(_allNews.where((n) => n.category == 'economy').toList()),
          _buildNewsList(_allNews.where((n) => n.category == 'personal_finance').toList()),
        ],
      ),
    );
  }

  Widget _buildNewsList(List<FinancialNews> news) {
    if (news.isEmpty) {
      return const Center(
        child: Text('No news available'),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        // Refresh news
        await Future.delayed(const Duration(seconds: 1));
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: news.length,
        itemBuilder: (context, index) {
          return _buildNewsCard(news[index]);
        },
      ),
    );
  }

  Widget _buildNewsCard(FinancialNews news) {
    final timeAgo = _getTimeAgo(news.publishedAt);

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: () => _showNewsDetail(news),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (news.imageUrl != null)
              Container(
                height: 200,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                ),
                child: const Center(
                  child: Icon(Icons.image, size: 50, color: Colors.grey),
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: _getCategoryColor(news.category).withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          news.category.replaceAll('_', ' ').toUpperCase(),
                          style: TextStyle(
                            color: _getCategoryColor(news.category),
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const Spacer(),
                      Text(
                        timeAgo,
                        style: const TextStyle(
                          fontSize: 12,
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    news.title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    news.summary,
                    style: const TextStyle(
                      fontSize: 14,
                      color: Colors.grey,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Icon(Icons.source, size: 14, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(
                        news.source,
                        style: const TextStyle(
                          fontSize: 12,
                          color: Colors.grey,
                        ),
                      ),
                      const Spacer(),
                      IconButton(
                        icon: Icon(
                          news.isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                          size: 20,
                        ),
                        onPressed: () {
                          // Toggle bookmark
                        },
                      ),
                      IconButton(
                        icon: const Icon(Icons.share, size: 20),
                        onPressed: () {
                          // Share article
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'market':
        return const Color(0xFF6C63FF);
      case 'crypto':
        return const Color(0xFFF97316);
      case 'stocks':
        return const Color(0xFF11998E);
      case 'economy':
        return const Color(0xFF8E2DE2);
      case 'personal_finance':
        return const Color(0xFF38EF7D);
      default:
        return const Color(0xFF2C5364);
    }
  }

  String _getTimeAgo(DateTime dateTime) {
    final difference = DateTime.now().difference(dateTime);
    
    if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }

  void _showNewsDetail(FinancialNews news) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.9,
        minChildSize: 0.5,
        maxChildSize: 0.9,
        builder: (context, scrollController) => Container(
          padding: const EdgeInsets.all(16),
          child: ListView(
            controller: scrollController,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Article Details',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                news.title,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'By ${news.author} • ${news.source}',
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                DateFormat('MMM dd, yyyy • HH:mm').format(news.publishedAt),
                style: const TextStyle(
                  fontSize: 12,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                news.summary,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                news.content,
                style: const TextStyle(fontSize: 14),
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                children: news.tags.map((tag) => Chip(
                  label: Text(tag),
                  backgroundColor: Colors.grey[200],
                )).toList(),
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () {
                  // Open full article in browser
                },
                icon: const Icon(Icons.open_in_new),
                label: const Text('Read Full Article'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
