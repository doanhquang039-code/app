import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:path/path.dart' as p;

class AIDocumentAnalyzerScreen extends StatefulWidget {
  const AIDocumentAnalyzerScreen({super.key});

  @override
  State<AIDocumentAnalyzerScreen> createState() => _AIDocumentAnalyzerScreenState();
}

class _AIDocumentAnalyzerScreenState extends State<AIDocumentAnalyzerScreen> {
  final List<String> _roles = ['Học sinh', 'Sinh viên', 'Người đi làm'];
  final List<String> _fileTypes = ['PDF (.pdf)', 'Word (.docx)', 'Excel (.xlsx)', 'Video ngắn (.mp4)'];

  String _selectedRole = 'Sinh viên';
  String _selectedFileType = 'PDF (.pdf)';
  String _simulatedFileName = '';
  File? _pickedFile; // real file from device
  int? _fileSizeKB;
  bool _isAnalyzing = false;
  int _analysisStep = 0;
  Map<String, dynamic>? _analysisResult;
  final TextEditingController _chatController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<Map<String, String>> _followUpChat = [];

  final List<String> _analysisSteps = [
    'Đang tải tệp tin và trích xuất dữ liệu...',
    'Gia sư AI đang đọc nội dung...',
    'Đang phân tích các ý chính...',
    'Đang sắp xếp kiến thức phù hợp đối tượng...',
    'Hoàn tất cấu trúc bài học!'
  ];

  Future<void> _pickFile() async {
    // Build allowed extensions based on selected type dropdown
    List<String> allowedExtensions;
    if (_selectedFileType.contains('PDF')) {
      allowedExtensions = ['pdf'];
    } else if (_selectedFileType.contains('Word')) {
      allowedExtensions = ['docx', 'doc'];
    } else if (_selectedFileType.contains('Excel')) {
      allowedExtensions = ['xlsx', 'xls', 'csv'];
    } else {
      allowedExtensions = ['mp4', 'mov', 'avi'];
    }

    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: allowedExtensions,
      allowMultiple: false,
    );

    if (result != null && result.files.single.path != null) {
      final file = File(result.files.single.path!);
      setState(() {
        _pickedFile = file;
        _simulatedFileName = p.basename(file.path);
        _fileSizeKB = (result.files.single.size / 1024).round();
        _analysisResult = null;
        _followUpChat.clear();
      });
    }
  }

  void _startAnalysis() {
    if (_pickedFile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng chọn tệp tin từ máy của bạn trước!'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() {
      _isAnalyzing = true;
      _analysisStep = 0;
    });

    // Simulate analysis steps
    Timer.periodic(const Duration(milliseconds: 1500), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (_analysisStep < _analysisSteps.length - 1) {
        setState(() {
          _analysisStep++;
        });
      } else {
        timer.cancel();
        setState(() {
          _isAnalyzing = false;
          _analysisResult = _generateAnalysisData(_selectedFileType, _selectedRole);
        });
      }
    });
  }

  Map<String, dynamic> _generateAnalysisData(String fileType, String role) {
    String summary = '';
    List<String> keyPoints = [];
    List<Map<String, String>> structure = [];
    List<String> actionPlan = [];
    List<String> quiz = [];

    final isStudent = role == 'Học sinh';
    final isUni = role == 'Sinh viên';
    
    if (fileType.contains('PDF') || fileType.contains('Word')) {
      if (isStudent) {
        summary = 'Tài liệu tóm tắt các khái niệm nền tảng về Khoa học Máy tính & Thuật toán cơ bản một cách sinh động, dễ nhớ.';
        keyPoints = [
          'Thuật toán là gì? Hiểu đơn giản là các bước giải quyết một bài toán giống như công thức nấu ăn.',
          'Biến số: Là những "chiếc hộp" dùng để lưu trữ dữ liệu (ví dụ: điểm số, tên nhân vật).',
          'Vòng lặp (Loops): Giúp lặp lại các hành động mà không cần viết lại nhiều lần.'
        ];
        structure = [
          {'title': 'Phần 1: Khám phá Thuật toán', 'desc': 'Giải thích trực quan bằng hình ảnh và các ví dụ thực tế hàng ngày.'},
          {'title': 'Phần 2: Các khối lệnh cơ bản', 'desc': 'Làm quen với Điều kiện (If-Else) và Vòng lặp thông qua trò chơi.'},
          {'title': 'Phần 3: Bài tập thực hành', 'desc': 'Giải câu đố logic để rèn luyện tư duy lập trình.'}
        ];
        actionPlan = [
          '📚 Đọc kỹ Phần 1 và vẽ lại sơ đồ các bước giải toán.',
          '💻 Thực hành viết thuật toán đun nước pha trà bằng lời văn của bạn.',
          '✍️ Làm bài tập đố vui ở cuối tài liệu.'
        ];
        quiz = [
          'Vòng lặp dùng để làm gì trong lập trình?',
          'Lấy một ví dụ thực tế về cấu trúc điều kiện "Nếu... Thì...".'
        ];
      } else if (isUni) {
        summary = 'Tài liệu chuyên sâu phân tích cấu trúc dữ liệu tuyến tính và phi tuyến tính, ứng dụng trong tối ưu hóa tài nguyên phần mềm.';
        keyPoints = [
          'Độ phức tạp thuật toán (Big O): Đo lường hiệu năng về thời gian và không gian chạy của phần mềm.',
          'Cây (Trees) & Đồ thị (Graphs): Cấu trúc dữ liệu phi tuyến tính mô phỏng các mối quan hệ mạng phức tạp.',
          'Giải thuật Tìm kiếm/Sắp xếp: Phân tích so sánh QuickSort, MergeSort về độ ổn định bộ nhớ.'
        ];
        structure = [
          {'title': 'Chương 1: Phân tích Hiệu năng Thuật toán', 'desc': 'Lý thuyết tiệm cận Big O, Omega, Theta và đánh giá mã nguồn.'},
          {'title': 'Chương 2: Cấu trúc dữ liệu nâng cao', 'desc': 'Cách cài đặt cây nhị phân tìm kiếm, AVL tree và bảng băm.'},
          {'title': 'Chương 3: Nghiên cứu điển hình (Case Studies)', 'desc': 'Ứng dụng thuật toán đồ thị Dijkstra trong định tuyến mạng thực tế.'}
        ];
        actionPlan = [
          '📖 Ôn tập kỹ các chứng minh toán học về giới hạn tiệm cận Big O.',
          '⚙️ Cài đặt thủ công một cây tìm kiếm nhị phân bằng ngôn ngữ lập trình của bạn học trên lớp.',
          '🧪 So sánh benchmark thực nghiệm thời gian chạy giữa MergeSort và QuickSort.'
        ];
        quiz = [
          'Độ phức tạp thời gian trung bình của giải thuật QuickSort là gì?',
          'Bảng băm (Hash Table) xử lý xung đột bằng các phương pháp nào?'
        ];
      } else { // Người đi làm
        summary = 'Tài liệu định hướng kiến trúc hệ thống và giải pháp áp dụng thuật toán tối ưu hóa chi phí vận hành máy chủ cloud.';
        keyPoints = [
          'Tối ưu hóa tài nguyên: Giảm 30% hóa đơn đám mây (AWS/GCP) bằng giải thuật phân bổ động.',
          'Caching strategies: Áp dụng thuật toán LRU (Least Recently Used) để cải thiện tốc độ API.',
          'Hệ thống phân tán: Sử dụng thuật toán đồng thuận Raft để bảo đảm tính toàn vẹn dữ liệu.'
        ];
        structure = [
          {'title': '1. Tóm tắt cho cấp quản lý (Executive Summary)', 'desc': 'Đánh giá ROI và tác động tài chính khi cải tiến thuật toán tối ưu.'},
          {'title': '2. Giải pháp kỹ thuật khả thi (Technical Viability)', 'desc': 'Kiến trúc triển khai, đo đạc Latency và Throughput trước/sau tối ưu.'},
          {'title': '3. Kế hoạch triển khai dự án', 'desc': 'Chiến lược Migration không gây gián đoạn dịch vụ (Zero-downtime deployment).'}
        ];
        actionPlan = [
          '📊 Lập báo cáo tóm tắt các chỉ số hiệu năng (KPIs) cần tối ưu gửi cho quản lý.',
          '🧑‍💻 Chạy thử nghiệm thuật toán LRU Cache trên môi trường Staging.',
          '💸 Đánh giá mức tiết kiệm chi phí hạ tầng máy chủ hàng tháng.'
        ];
        quiz = [
          'Thuật toán tối ưu này sẽ giúp giảm bao nhiêu phần trăm chi phí hạ tầng?',
          'Các bước giảm thiểu rủi ro khi triển khai giải pháp mới vào hệ thống production là gì?'
        ];
      }
    } else if (fileType.contains('Excel')) {
      if (isStudent) {
        summary = 'Phân tích bảng điểm và thống kê học tập cá nhân học kỳ vừa qua.';
        keyPoints = [
          'Điểm trung bình (GPA): Đạt mức khá giỏi. Cần cải thiện môn Toán.',
          'Sự tiến bộ: Điểm số có xu hướng tăng vào cuối kỳ ở các môn tự nhiên.',
          'Điểm số cao nhất: Môn Tiếng Anh và Ngữ văn.'
        ];
        structure = [
          {'title': 'Phần 1: Bảng điểm chi tiết', 'desc': 'Danh sách điểm số từng môn học.'},
          {'title': 'Phần 2: Xếp loại học lực', 'desc': 'Đánh giá điểm mạnh và điểm yếu tổng thể.'}
        ];
        actionPlan = [
          '🎯 Lập kế hoạch học bù môn Toán 2 buổi/tuần.',
          '📝 Duy trì phong độ học tiếng Anh bằng cách nghe nhạc/xem phim mỗi ngày.'
        ];
        quiz = ['Môn học nào cần cải thiện điểm số nhiều nhất?'];
      } else if (isUni) {
        summary = 'Phân tích dữ liệu khảo sát nghiên cứu khoa học và thống kê biến số SPSS.';
        keyPoints = [
          'Cơ mẫu: Tổng cộng 250 phiếu khảo sát hợp lệ.',
          'Tương quan Pearson: Phát hiện mối liên hệ chặt chẽ giữa giờ tự học và điểm kiểm tra.',
          'Độ tin cậy Alpha Cronbach: Đạt 0.82 (Đạt chuẩn nghiên cứu).'
        ];
        structure = [
          {'title': 'Phần 1: Thống kê mô tả', 'desc': 'Biểu đồ phân phối tần số đối tượng khảo sát.'},
          {'title': 'Phần 2: Phân tích tương quan', 'desc': 'Đánh giá các giả thuyết nghiên cứu đề ra.'}
        ];
        actionPlan = [
          '🖋️ Viết chương thảo luận kết quả nghiên cứu dựa trên các số liệu tương quan.',
          '📊 Trích xuất các biểu đồ phân phối sang file slide báo cáo.'
        ];
        quiz = ['Hệ số tương quan Pearson có ý nghĩa gì đối với giả thuyết đề tài?'];
      } else { // Người đi làm
        summary = 'Báo cáo hiệu năng kinh doanh, doanh thu và biên lợi nhuận của các phòng ban.';
        keyPoints = [
          'Tăng trưởng doanh thu: Đạt 15% so với quý trước, dẫn đầu bởi phòng sản phẩm A.',
          'Chi phí vận hành: Tăng nhẹ do tăng ngân sách marketing thương hiệu.',
          'Biên lợi nhuận ròng: Giữ vững ở mức ổn định 22%.'
        ];
        structure = [
          {'title': '1. Tổng quan tài chính', 'desc': 'Các chỉ số doanh thu, chi phí, lợi nhuận quý.'},
          {'title': '2. Đóng góp của phòng ban', 'desc': 'So sánh hiệu suất doanh số giữa các nhóm kinh doanh.'}
        ];
        actionPlan = [
          '📈 Tối ưu ngân sách marketing ở các kênh có tỷ lệ chuyển đổi thấp.',
          '📞 Tổ chức họp tổng kết với trưởng phòng sản phẩm A để nhân rộng mô hình bán hàng.'
        ];
        quiz = ['Phòng ban nào có mức đóng góp doanh thu cao nhất quý này?'];
      }
    } else { // Video ngắn (.mp4)
      if (isStudent) {
        summary = 'Tóm tắt bài giảng video ngắn giải thích về lực vạn vật hấp dẫn của Newton.';
        keyPoints = [
          'Lực hấp dẫn: Mọi vật có khối lượng đều hút nhau (Ví dụ trái táo rơi xuống đất).',
          'Khối lượng càng lớn, lực hút càng mạnh.',
          'Khoảng cách càng xa, lực hút càng yếu.'
        ];
        structure = [
          {'title': 'Cảnh 1: Quả táo rơi', 'desc': 'Newton phát hiện ra lực hấp dẫn như thế nào.'},
          {'title': 'Cảnh 2: Lực hút vũ trụ', 'desc': 'Tại sao Trái Đất quay quanh Mặt Trời.'}
        ];
        actionPlan = [
          '🍎 Tự làm thí nghiệm thả rơi quả bóng và tờ giấy để quan sát.',
          '📽️ Xem thêm video hoạt họa mô phỏng hệ mặt trời.'
        ];
        quiz = ['Yếu tố nào làm tăng lực hấp dẫn giữa hai vật thể?'];
      } else if (isUni) {
        summary = 'Phân tích video bài giảng Ted Talk về sự thay đổi khí hậu toàn cầu và chính sách kinh tế carbon.';
        keyPoints = [
          'Cơ chế Thuế Carbon: Giải pháp kinh tế buộc doanh nghiệp chịu trách nhiệm về khí thải.',
          'Năng lượng tái tạo: Phân tích xu hướng giảm giá thành của pin mặt trời và tuabin gió.',
          'Hiệu ứng domino sinh thái: Sự tan băng ở hai cực ảnh hưởng đến dòng hải lưu toàn cầu.'
        ];
        structure = [
          {'title': 'Phần 1: Thực trạng biến đổi khí hậu', 'desc': 'Các số liệu nhiệt độ toàn cầu tăng kỷ lục.'},
          {'title': 'Phần 2: Giải pháp chính sách kinh tế', 'desc': 'So sánh Cap-and-Trade với Thuế Carbon trực tiếp.'}
        ];
        actionPlan = [
          '📰 Đọc thêm bài nghiên cứu của IPCC về tác động kinh tế xanh.',
          '✍️ Soạn thảo bài tiểu luận phân tích chính sách carbon tại các nước đang phát triển.'
        ];
        quiz = ['Sự khác biệt cốt lõi giữa hệ thống Cap-and-Trade và Thuế Carbon là gì?'];
      } else { // Người đi làm
        summary = 'Tóm tắt video phỏng vấn chuyên gia về xu hướng áp dụng AI tạo sinh (Generative AI) vào tự động hóa doanh nghiệp.';
        keyPoints = [
          'Tăng năng suất: Tự động hóa 40% tác vụ văn phòng cơ bản (viết email, báo cáo số liệu).',
          'Bảo mật thông tin: Rủi ro rò rỉ mã nguồn/dữ liệu khách hàng khi dùng AI công cộng.',
          'Mô hình nội bộ (On-premise): Xu hướng xây dựng LLM riêng bảo mật cho tổ chức lớn.'
        ];
        structure = [
          {'title': '1. Tác động của Generative AI', 'desc': 'Thay đổi mô hình làm việc của nhân viên văn phòng.'},
          {'title': '2. Thách thức bảo mật', 'desc': 'Các quy định tuân thủ dữ liệu doanh nghiệp.'}
        ];
        actionPlan = [
          '🛡️ Ban hành hướng dẫn sử dụng AI an toàn cho nhân viên trong công ty.',
          '🛠️ Khảo sát các công cụ AI hỗ trợ viết code để thử nghiệm nội bộ.'
        ];
        quiz = ['Doanh nghiệp cần lưu ý những rủi ro bảo mật nào khi nhân viên sử dụng ChatGPT?'];
      }
    }

    return {
      'summary': summary,
      'keyPoints': keyPoints,
      'structure': structure,
      'actionPlan': actionPlan,
      'quiz': quiz
    };
  }

  void _sendChatMessage() {
    final text = _chatController.text.trim();
    if (text.isEmpty) return;

    _chatController.clear();
    setState(() {
      _followUpChat.add({'sender': 'user', 'text': text});
    });
    _scrollToBottom();

    // Generate AI response to document context
    Future.delayed(const Duration(milliseconds: 1000), () {
      if (!mounted) return;
      String aiResponse = 'Đối với câu hỏi về "${text}", gia sư AI khuyên bạn nên tập trung vào kế hoạch hành động đã đề xuất. ';
      
      if (_selectedRole == 'Học sinh') {
        aiResponse += 'Hãy nhớ học thật thoải mái, làm bài tập đầy đủ là sẽ nhớ bài rất nhanh đó!';
      } else if (_selectedRole == 'Sinh viên') {
        aiResponse += 'Bạn nên liên hệ thêm với các tài liệu tham khảo trong giáo trình đại học để viết luận chính xác hơn.';
      } else {
        aiResponse += 'Đây là kiến thức thực chiến ứng dụng ngay vào công việc hàng ngày để tối ưu năng suất làm việc của bạn.';
      }

      setState(() {
        _followUpChat.add({'sender': 'ai', 'text': aiResponse});
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

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFF6C63FF);
    const secondaryColor = Color(0xFF14B8A6);

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E2E),
        title: const Text('Phân tích tài liệu AI', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: ListView(
        controller: _scrollController,
        padding: const EdgeInsets.all(16),
        children: [
          // Header Introduction
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [primaryColor, Color(0xFF8E2DE2)]),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Row(
              children: [
                Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 38),
                SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Học tập & Làm việc Thông minh',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Tải lên tệp tin bất kỳ để AI phân tích ý chính, cấu trúc hóa kiến thức phù hợp với đối tượng học tập.',
                        style: TextStyle(color: Colors.white70, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // File Settings Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: const Color(0xFF2A2A3E), borderRadius: BorderRadius.circular(16)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Cấu hình Phân tích', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                
                // File Type Dropdown
                _buildDropdown(
                  label: 'Loại tệp tin',
                  value: _selectedFileType,
                  items: _fileTypes,
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedFileType = val);
                  },
                ),
                const SizedBox(height: 12),

                // Audience Role Dropdown
                _buildDropdown(
                  label: 'Đối tượng phù hợp',
                  value: _selectedRole,
                  items: _roles,
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedRole = val);
                  },
                ),
                const SizedBox(height: 16),

                // Real File Picker button
                InkWell(
                  onTap: _pickFile,
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E1E2E),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: _pickedFile != null ? secondaryColor : Colors.white24,
                        style: BorderStyle.solid,
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          _pickedFile != null ? Icons.insert_drive_file_rounded : Icons.upload_file_rounded,
                          color: _pickedFile != null ? secondaryColor : Colors.grey,
                          size: 26,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _simulatedFileName.isEmpty
                                    ? 'Nhấp để chọn tệp từ máy của bạn'
                                    : _simulatedFileName,
                                style: TextStyle(
                                  color: _simulatedFileName.isEmpty ? Colors.grey : Colors.white,
                                  fontSize: 13,
                                  fontWeight: _simulatedFileName.isEmpty ? FontWeight.normal : FontWeight.bold,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              if (_fileSizeKB != null)
                                Text(
                                  '$_fileSizeKB KB  •  ${_selectedFileType}',
                                  style: const TextStyle(color: Colors.grey, fontSize: 11),
                                ),
                            ],
                          ),
                        ),
                        if (_pickedFile != null)
                          IconButton(
                            icon: const Icon(Icons.close, color: Colors.grey, size: 18),
                            onPressed: () => setState(() {
                              _pickedFile = null;
                              _simulatedFileName = '';
                              _fileSizeKB = null;
                              _analysisResult = null;
                              _followUpChat.clear();
                            }),
                          ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Analyze button
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _isAnalyzing ? null : _startAnalysis,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryColor,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: _isAnalyzing
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                          )
                        : const Text('Bắt đầu phân tích AI', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Loading/Analyzing state
          if (_isAnalyzing)
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(color: const Color(0xFF2A2A3E), borderRadius: BorderRadius.circular(16)),
              child: Column(
                children: [
                  const LinearProgressIndicator(color: primaryColor, backgroundColor: Colors.white12),
                  const SizedBox(height: 16),
                  Text(
                    _analysisSteps[_analysisStep],
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),

          // Analysis result card
          if (_analysisResult != null && !_isAnalyzing) ...[
            _buildResultCard(),
            const SizedBox(height: 20),
            _buildFollowUpChatWidget(),
          ],
        ],
      ),
    );
  }

  Widget _buildDropdown({
    required String label,
    required String value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 11)),
        const SizedBox(height: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: const Color(0xFF1E1E2E),
            borderRadius: BorderRadius.circular(10),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: value,
              isExpanded: true,
              dropdownColor: const Color(0xFF1E1E2E),
              style: const TextStyle(color: Colors.white),
              items: items.map((String item) {
                return DropdownMenuItem<String>(
                  value: item,
                  child: Text(item),
                );
              }).toList(),
              onChanged: onChanged,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildResultCard() {
    final res = _analysisResult!;
    const primaryColor = Color(0xFF6C63FF);
    const secondaryColor = Color(0xFF14B8A6);

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(color: const Color(0xFF2A2A3E), borderRadius: BorderRadius.circular(18)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.analytics_rounded, color: secondaryColor),
              const SizedBox(width: 8),
              Text(
                'KẾT QUẢ PHÂN TÍCH (${_selectedRole.toUpperCase()})',
                style: const TextStyle(color: secondaryColor, fontWeight: FontWeight.bold, fontSize: 13),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // 1. Summary
          const Text('1. Tóm tắt ý chính', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 6),
          Text(res['summary'] as String, style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.3)),
          const Divider(color: Colors.white12, height: 24),

          // 2. Key Points
          const Text('2. Kiến thức cốt lõi', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 8),
          ...(res['keyPoints'] as List<String>).map((point) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('• ', style: TextStyle(color: primaryColor, fontWeight: FontWeight.bold)),
                    Expanded(child: Text(point, style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.3))),
                  ],
                ),
              )),
          const Divider(color: Colors.white12, height: 24),

          // 3. Structure
          const Text('3. Bản đồ cấu trúc kiến thức', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 8),
          ...(res['structure'] as List<Map<String, String>>).map((part) => Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: const Color(0xFF1E1E2E), borderRadius: BorderRadius.circular(10)),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(part['title']!, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 4),
                    Text(part['desc']!, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                  ],
                ),
              )),
          const Divider(color: Colors.white12, height: 24),

          // 4. Action Plan
          const Text('4. Lộ trình thực hành / Học tập', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 8),
          ...(res['actionPlan'] as List<String>).map((act) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.check_circle_outline_rounded, color: Colors.greenAccent, size: 16),
                    const SizedBox(width: 8),
                    Expanded(child: Text(act, style: const TextStyle(color: Colors.white70, fontSize: 13))),
                  ],
                ),
              )),
          const Divider(color: Colors.white12, height: 24),

          // 5. Quiz questions
          const Text('5. Câu hỏi tự ôn tập nhanh', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 8),
          ...(res['quiz'] as List<String>).asMap().entries.map((entry) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Text(
                  'Q${entry.key + 1}: ${entry.value}',
                  style: const TextStyle(color: Colors.white70, fontSize: 13, fontStyle: FontStyle.italic),
                ),
              )),
        ],
      ),
    );
  }

  Widget _buildFollowUpChatWidget() {
    const primaryColor = Color(0xFF6C63FF);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: const Color(0xFF2A2A3E), borderRadius: BorderRadius.circular(18)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.chat_bubble_outline_rounded, color: primaryColor),
              const SizedBox(width: 8),
              Text(
                'Hỏi đáp chuyên sâu về tài liệu',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
              ),
            ],
          ),
          const SizedBox(height: 12),
          
          if (_followUpChat.isNotEmpty)
            Container(
              height: 180,
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF1E1E2E),
                borderRadius: BorderRadius.circular(12),
              ),
              child: ListView.builder(
                itemCount: _followUpChat.length,
                itemBuilder: (context, index) {
                  final msg = _followUpChat[index];
                  final isUser = msg['sender'] == 'user';
                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: isUser ? primaryColor : Colors.white.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        msg['text']!,
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                      ),
                    ),
                  );
                },
              ),
            ),

          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _chatController,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    hintText: 'Hỏi thêm gia sư AI về tài liệu...',
                    hintStyle: const TextStyle(color: Colors.grey, fontSize: 13),
                    filled: true,
                    fillColor: const Color(0xFF1E1E2E),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide.none),
                  ),
                  onSubmitted: (_) => _sendChatMessage(),
                ),
              ),
              const SizedBox(width: 8),
              CircleAvatar(
                backgroundColor: primaryColor,
                radius: 18,
                child: IconButton(
                  icon: const Icon(Icons.send, color: Colors.white, size: 14),
                  onPressed: _sendChatMessage,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
