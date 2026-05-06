# 🤖 AI Integration Guide - Expense Tracker App

## Tổng Quan

Dự án đã được tích hợp AI với các tính năng:

### ✨ Tính Năng AI

1. **💬 AI Chatbot**
   - Chat với AI advisor về tài chính
   - Hỏi đáp về chi tiêu, tiết kiệm, ngân sách
   - Phân tích tài chính cá nhân
   - Gợi ý tiết kiệm thông minh

2. **📊 AI Insights**
   - Phân tích chi tiêu tự động
   - Cảnh báo ngân sách vượt mức
   - Phát hiện chi tiêu bất thường
   - Dự đoán chi tiêu tương lai
   - Theo dõi mục tiêu tiết kiệm

3. **🎯 Smart Recommendations**
   - Gợi ý tiết kiệm dựa trên thói quen
   - Phân tích xu hướng chi tiêu
   - Tối ưu hóa ngân sách

---

## 🚀 Cài Đặt

### Backend

#### 1. Cài đặt dependencies
```bash
cd backend
npm install --legacy-peer-deps
```

#### 2. Cấu hình OpenAI API Key

Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

Thêm OpenAI API key vào file `.env`:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Lấy API key:**
1. Truy cập: https://platform.openai.com/api-keys
2. Đăng nhập/Đăng ký tài khoản OpenAI
3. Tạo API key mới
4. Copy và paste vào file `.env`

**Lưu ý:** 
- OpenAI API key là **OPTIONAL**
- Nếu không có key, hệ thống sẽ dùng rule-based chatbot
- Rule-based chatbot vẫn hoạt động tốt cho các câu hỏi cơ bản

#### 3. Build và chạy
```bash
npm run build
npm run start:dev
```

### Frontend

#### 1. Import AI components

Trong file `App.tsx` hoặc `Dashboard.tsx`:

```typescript
import { FloatingAIButton } from './components/AI/AIChatbot';
import { AIInsights } from './components/AI/AIInsights';

function App() {
  return (
    <div>
      {/* Your existing components */}
      
      {/* AI Insights - hiển thị trong dashboard */}
      <AIInsights />
      
      {/* Floating AI Button - nút chat nổi */}
      <FloatingAIButton />
    </div>
  );
}
```

#### 2. Build và chạy
```bash
cd frontend
npm run build
npm run dev
```

---

## 📡 API Endpoints

### 1. Get AI Insights
```http
GET /api/ai-advisor/insights
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "type": "warning",
    "title": "Chi tiêu cao trong danh mục",
    "message": "Bạn đã chi 5,000,000đ cho danh mục này...",
    "priority": "high",
    "actionable": true,
    "action": "Xem chi tiết"
  }
]
```

### 2. Chat with AI
```http
POST /api/ai-advisor/chat
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Chi tiêu tháng này như thế nào?"
}
```

**Response:**
```json
{
  "response": "💰 Tháng này bạn đã chi 8,500,000đ qua 45 giao dịch. Chi tiêu đang ở mức trung bình so với các tháng trước."
}
```

---

## 🎨 UI Components

### 1. AIChatbot Component

**Props:**
- `onClose?: () => void` - Callback khi đóng chat

**Features:**
- Chat interface đẹp mắt
- Quick questions (câu hỏi gợi ý)
- Real-time typing indicator
- Message history
- Responsive design

**Usage:**
```tsx
import { AIChatbot } from './components/AI/AIChatbot';

<AIChatbot onClose={() => console.log('Closed')} />
```

### 2. FloatingAIButton Component

**Features:**
- Floating button ở góc phải màn hình
- Click để mở/đóng chatbot
- Smooth animation
- Mobile-friendly

**Usage:**
```tsx
import { FloatingAIButton } from './components/AI/AIChatbot';

<FloatingAIButton />
```

### 3. AIInsights Component

**Features:**
- Hiển thị insights từ AI
- Color-coded theo mức độ ưu tiên
- Auto-refresh
- Actionable insights với buttons

**Usage:**
```tsx
import { AIInsights } from './components/AI/AIInsights';

<AIInsights />
```

---

## 🧠 AI Logic

### Rule-Based Chatbot (Không cần OpenAI)

Chatbot cơ bản sử dụng pattern matching:

```typescript
// Ví dụ patterns:
"chi tiêu" → Hiển thị tổng chi tiêu tháng này
"tiết kiệm" → Hiển thị mục tiêu tiết kiệm
"ngân sách" → Hiển thị trạng thái ngân sách
"phân tích" → Hiển thị insights
```

### OpenAI-Powered Chatbot (Cần API key)

Sử dụng GPT-4o-mini để:
- Hiểu ngữ cảnh câu hỏi
- Phân tích dữ liệu tài chính
- Đưa ra lời khuyên cá nhân hóa
- Trả lời tự nhiên bằng tiếng Việt

**System Prompt:**
```
Bạn là một trợ lý tài chính AI thông minh, chuyên nghiệp và thân thiện.
Nhiệm vụ của bạn là giúp người dùng quản lý tài chính cá nhân...
```

---

## 💡 Insights Logic

### 1. Spending Pattern Analysis
- Phân tích chi tiêu theo category
- Phát hiện category chi tiêu cao (>30% tổng)
- Cảnh báo chi tiêu tăng đột biến (>150% trung bình)
- Khen ngợi khi tiết kiệm tốt

### 2. Budget Analysis
- Kiểm tra % sử dụng ngân sách
- Cảnh báo khi ≥90% (high priority)
- Nhắc nhở khi ≥70% (medium priority)

### 3. Savings Goals Analysis
- Theo dõi tiến độ mục tiêu
- Khen ngợi khi đạt ≥75%
- Tính toán số tiền cần tiết kiệm mỗi ngày
- Cảnh báo khi gần deadline

### 4. Future Spending Prediction
- Tính trung bình chi tiêu hàng ngày
- Dự đoán tổng chi tiêu cuối tháng
- Dựa trên xu hướng hiện tại

---

## 🔧 Customization

### Thay đổi AI Model

Trong `ai-advisor.service.ts`:

```typescript
const completion = await this.openai.chat.completions.create({
  model: 'gpt-4o-mini', // Đổi thành 'gpt-4' hoặc 'gpt-3.5-turbo'
  temperature: 0.7,     // 0-1: creativity level
  max_tokens: 300,      // Độ dài response
});
```

### Thêm Quick Questions

Trong `AIChatbot.tsx`:

```typescript
const quickQuestions = [
  { text: 'Câu hỏi mới', icon: <YourIcon /> },
  // ... thêm câu hỏi khác
];
```

### Thêm Insight Rules

Trong `ai-advisor.service.ts`:

```typescript
private analyzeSpendingPatterns(transactions: Transaction[]): AIInsight[] {
  // Thêm logic phân tích mới
  if (yourCondition) {
    insights.push({
      type: 'warning',
      title: 'Tiêu đề',
      message: 'Nội dung',
      priority: 'high',
    });
  }
}
```

---

## 📊 Chi Phí OpenAI

### Pricing (tính đến 2026)

**GPT-4o-mini:**
- Input: $0.15 / 1M tokens
- Output: $0.60 / 1M tokens

**Ước tính:**
- 1 chat message ≈ 500 tokens
- 1000 messages ≈ $0.50
- Chi phí rất thấp cho personal use

**Mẹo tiết kiệm:**
- Dùng rule-based cho câu hỏi đơn giản
- Cache responses phổ biến
- Giới hạn max_tokens
- Dùng gpt-4o-mini thay vì gpt-4

---

## 🐛 Troubleshooting

### 1. OpenAI API Error

**Lỗi:** `OpenAI API error: 401 Unauthorized`

**Giải pháp:**
- Kiểm tra API key trong `.env`
- Đảm bảo key còn valid
- Kiểm tra credit balance: https://platform.openai.com/usage

### 2. Backend không build

**Lỗi:** `Cannot find module 'openai'`

**Giải pháp:**
```bash
npm install openai --save --legacy-peer-deps
```

### 3. Frontend không hiển thị AI components

**Giải pháp:**
- Kiểm tra import paths
- Đảm bảo backend đang chạy
- Kiểm tra token authentication
- Xem console logs

### 4. Chatbot không trả lời

**Giải pháp:**
- Kiểm tra network tab trong DevTools
- Verify API endpoint: `/api/ai-advisor/chat`
- Kiểm tra Authorization header
- Xem backend logs

---

## 🚀 Next Steps

### Tính năng có thể thêm:

1. **Voice Input** 🎤
   - Nói chuyện với AI bằng giọng nói
   - Speech-to-text integration

2. **Smart Categorization** 🏷️
   - AI tự động phân loại giao dịch
   - Học từ lịch sử người dùng

3. **Anomaly Detection** 🔍
   - Phát hiện giao dịch bất thường
   - Cảnh báo gian lận

4. **Investment Advice** 📈
   - Gợi ý đầu tư dựa trên profile
   - Phân tích rủi ro

5. **Multi-language Support** 🌍
   - Hỗ trợ nhiều ngôn ngữ
   - Auto-detect user language

6. **Personalized Reports** 📄
   - AI tạo báo cáo tài chính
   - Export PDF với insights

---

## 📝 Notes

- ✅ Backend build thành công
- ✅ AI module đã được kích hoạt
- ✅ OpenAI SDK đã được cài đặt
- ✅ Frontend components đã sẵn sàng
- ⚠️ Cần cấu hình OPENAI_API_KEY để dùng AI thực
- ✅ Rule-based chatbot hoạt động mà không cần API key

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Backend logs: `npm run start:dev`
2. Frontend console: F12 → Console
3. Network requests: F12 → Network
4. OpenAI status: https://status.openai.com/

---

**Chúc bạn thành công với AI integration! 🎉**
