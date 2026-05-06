# 🧪 Test AI Features

## Quick Test Guide

### 1. Start Backend
```bash
cd backend
npm run start:dev
```

**Expected output:**
```
✅ OpenAI initialized successfully
# hoặc
⚠️  OpenAI API key not found, using rule-based responses
```

### 2. Test API với curl/Postman

#### Get AI Insights
```bash
curl -X GET http://localhost:3000/api/ai-advisor/insights \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected response:**
```json
[
  {
    "type": "warning",
    "title": "Chi tiêu cao trong danh mục",
    "message": "Bạn đã chi 5,000,000đ...",
    "priority": "high",
    "actionable": true,
    "action": "Xem chi tiết"
  }
]
```

#### Chat with AI
```bash
curl -X POST http://localhost:3000/api/ai-advisor/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Chi tiêu tháng này?"}'
```

**Expected response (with OpenAI):**
```json
{
  "response": "💰 Tháng này bạn đã chi 8,500,000đ qua 45 giao dịch. Chi tiêu đang ở mức trung bình so với các tháng trước. 📊"
}
```

**Expected response (rule-based):**
```json
{
  "response": "💰 Tháng này bạn đã chi 8,500,000đ qua 45 giao dịch."
}
```

### 3. Test Frontend

1. Start frontend:
```bash
cd frontend
npm run dev
```

2. Open: http://localhost:5173

3. Test checklist:
- [ ] Floating AI button hiển thị ở góc phải
- [ ] Click button mở chat interface
- [ ] Chat interface hiển thị đẹp
- [ ] Quick questions hiển thị
- [ ] Gửi message hoạt động
- [ ] AI response hiển thị
- [ ] Loading indicator hoạt động
- [ ] Close button hoạt động
- [ ] AI Insights component hiển thị
- [ ] Insights có color-coding đúng
- [ ] Refresh button hoạt động

### 4. Test Scenarios

#### Scenario 1: Chi tiêu
**Input:** "Chi tiêu tháng này như thế nào?"
**Expected:** Hiển thị tổng chi tiêu + số giao dịch

#### Scenario 2: Tiết kiệm
**Input:** "Tôi nên tiết kiệm bao nhiêu?"
**Expected:** Phân tích mục tiêu tiết kiệm

#### Scenario 3: Ngân sách
**Input:** "Phân tích ngân sách của tôi"
**Expected:** Hiển thị trạng thái ngân sách

#### Scenario 4: Dự đoán
**Input:** "Dự đoán chi tiêu tương lai"
**Expected:** Dự đoán chi tiêu cuối tháng

### 5. Error Handling Test

#### Test 1: No token
```bash
curl -X GET http://localhost:3000/api/ai-advisor/insights
```
**Expected:** 401 Unauthorized

#### Test 2: Invalid token
```bash
curl -X GET http://localhost:3000/api/ai-advisor/insights \
  -H "Authorization: Bearer invalid-token"
```
**Expected:** 401 Unauthorized

#### Test 3: Empty message
```bash
curl -X POST http://localhost:3000/api/ai-advisor/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": ""}'
```
**Expected:** Default response

### 6. Performance Test

#### Response Time
- AI Insights: < 500ms
- Chat (rule-based): < 200ms
- Chat (OpenAI): < 3s

#### Load Test
```bash
# Test 100 requests
for i in {1..100}; do
  curl -X GET http://localhost:3000/api/ai-advisor/insights \
    -H "Authorization: Bearer YOUR_TOKEN" &
done
```

### 7. OpenAI Integration Test

#### With API Key
1. Add to `.env`:
```env
OPENAI_API_KEY=sk-your-key
```

2. Restart backend

3. Check logs:
```
✅ OpenAI initialized successfully
```

4. Test chat - should get natural language response

#### Without API Key
1. Remove from `.env` or set to empty

2. Restart backend

3. Check logs:
```
⚠️  OpenAI API key not found, using rule-based responses
```

4. Test chat - should get rule-based response

### 8. UI/UX Test

#### Desktop
- [ ] Chat window size: 400px width
- [ ] Floating button position: bottom-right
- [ ] Smooth animations
- [ ] Scrolling works
- [ ] Messages aligned correctly

#### Mobile
- [ ] Chat window responsive
- [ ] Button accessible
- [ ] Touch interactions work
- [ ] Keyboard doesn't cover input

### 9. Integration Test

#### Full Flow
1. User opens app
2. Clicks AI button
3. Sees welcome message
4. Clicks quick question
5. Gets AI response
6. Types custom question
7. Gets AI response
8. Views AI Insights
9. Clicks refresh
10. Sees updated insights

### 10. Regression Test

After any changes, verify:
- [ ] Backend still builds
- [ ] Frontend still builds
- [ ] API endpoints work
- [ ] UI components render
- [ ] No console errors
- [ ] No TypeScript errors

---

## Test Results Template

```
Date: ___________
Tester: ___________

Backend:
[ ] Build successful
[ ] OpenAI initialized
[ ] API endpoints working
[ ] Error handling correct

Frontend:
[ ] Components render
[ ] Chat interface works
[ ] Insights display
[ ] Responsive design

Integration:
[ ] Backend ↔ Frontend
[ ] Authentication
[ ] Error handling
[ ] Performance acceptable

Issues Found:
1. ___________
2. ___________

Notes:
___________
```

---

## Automated Test Script

Create `test-ai.sh`:

```bash
#!/bin/bash

echo "🧪 Testing AI Features..."

# Test 1: Backend health
echo "1. Testing backend..."
curl -s http://localhost:3000/health || echo "❌ Backend not running"

# Test 2: AI Insights (need token)
echo "2. Testing AI Insights..."
# Add your token here
TOKEN="your-token"
curl -s -X GET http://localhost:3000/api/ai-advisor/insights \
  -H "Authorization: Bearer $TOKEN" | jq

# Test 3: AI Chat
echo "3. Testing AI Chat..."
curl -s -X POST http://localhost:3000/api/ai-advisor/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Chi tiêu tháng này?"}' | jq

echo "✅ Tests complete!"
```

Run:
```bash
chmod +x test-ai.sh
./test-ai.sh
```

---

## Troubleshooting

### Backend không start
```bash
# Check logs
npm run start:dev

# Common issues:
# - Port 3000 đã được dùng
# - Database không kết nối được
# - Missing dependencies
```

### Frontend không hiển thị AI
```bash
# Check console (F12)
# Common issues:
# - Import path sai
# - Component not exported
# - API endpoint sai
```

### OpenAI không hoạt động
```bash
# Check:
# 1. API key trong .env
# 2. Backend logs
# 3. OpenAI status: https://status.openai.com
# 4. Credit balance: https://platform.openai.com/usage
```

---

**Happy Testing! 🎉**
