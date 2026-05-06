# ⚡ QUICK START - AI Expense Tracker

## 🚀 Chạy Ngay (5 phút)

### 1. Backend
```bash
cd c:\Users\admoi\app\backend
npm run start:dev
```
✅ Backend chạy tại: http://localhost:3000

### 2. Frontend
```bash
cd c:\Users\admoi\app\frontend
npm run dev
```
✅ Frontend chạy tại: http://localhost:5173

### 3. Test AI
1. Mở: http://localhost:5173
2. Click nút **AI** (🤖) ở góc phải
3. Chat: "Chi tiêu tháng này?"

---

## 🤖 Cấu Hình AI (Optional)

### Lấy OpenAI API Key
1. Truy cập: https://platform.openai.com/api-keys
2. Đăng ký/Đăng nhập
3. Tạo API key mới
4. Copy key

### Thêm vào Backend
```bash
cd c:\Users\admoi\app\backend
echo OPENAI_API_KEY=sk-your-key-here >> .env
```

### Restart Backend
```bash
npm run start:dev
```

**Lưu ý:** Không có key vẫn hoạt động (dùng rule-based)!

---

## 📚 Documentation

### Đọc Ngay
- **Tóm tắt:** `✅_AI_TICH_HOP_HOAN_TAT.md`
- **Chi tiết:** `AI_INTEGRATION_GUIDE.md`
- **Test:** `TEST_AI.md`
- **Tổng kết:** `🎉_SUMMARY.md`

### API Docs
- Swagger: http://localhost:3000/api

---

## 💬 AI Chat Examples

### Câu hỏi mẫu:
```
"Chi tiêu tháng này như thế nào?"
"Tôi nên tiết kiệm bao nhiêu?"
"Phân tích ngân sách của tôi"
"Dự đoán chi tiêu tương lai"
```

---

## 🎯 Features

### ✅ Có sẵn:
- 💬 AI Chatbot
- 📊 AI Insights
- 🎯 Smart Predictions
- 💰 Expense Tracking
- 📈 Budget Management
- 🎯 Savings Goals

---

## 🐛 Troubleshooting

### Backend không chạy?
```bash
# Check port
netstat -ano | findstr :3000

# Kill process nếu cần
taskkill /PID <PID> /F

# Restart
npm run start:dev
```

### Frontend không hiển thị?
```bash
# Clear cache
npm run build
npm run dev
```

### AI không trả lời?
1. Check backend đang chạy
2. Check console (F12)
3. Verify token authentication

---

## 📞 Quick Help

### Commands
```bash
# Backend
npm run start:dev    # Development
npm run build        # Build
npm run start:prod   # Production

# Frontend
npm run dev          # Development
npm run build        # Build
npm run preview      # Preview build
```

### Ports
```
Backend: 3000
Frontend: 5173
Database: 1433
```

### URLs
```
Frontend: http://localhost:5173
Backend: http://localhost:3000
Swagger: http://localhost:3000/api
```

---

## 🎉 That's It!

**Bạn đã sẵn sàng sử dụng AI Expense Tracker!**

Đọc thêm: `AI_INTEGRATION_GUIDE.md`
