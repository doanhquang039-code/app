# AI Analysis & Subscription Management Documentation

## 🚀 Tổng quan
2 tính năng mới được thêm vào ứng dụng Expense Tracker:

1. **AI-Powered Spending Analysis** - Phân tích chi tiêu thông minh
2. **Subscription Management** - Quản lý đăng ký định kỳ

---

## 1️⃣ AI-POWERED SPENDING ANALYSIS

### Mục đích
Sử dụng thuật toán AI/ML để phân tích mẫu chi tiêu, phát hiện bất thường và dự đoán chi tiêu tương lai.

### Tính năng chính
- ✅ Phát hiện mẫu chi tiêu (Recurring, Seasonal, Trend)
- ✅ Phát hiện giao dịch bất thường (Anomaly Detection)
- ✅ Dự đoán chi tiêu tương lai
- ✅ Phân tích xu hướng theo danh mục
- ✅ Đề xuất thông minh dựa trên AI
- ✅ Tính toán độ tin cậy (Confidence Score)

### Các loại Pattern Detection

#### 1. Recurring Pattern (Mẫu định kỳ)
Phát hiện chi tiêu lặp lại đều đặn:
- Chi tiêu hàng ngày (DAILY)
- Chi tiêu hàng tuần (WEEKLY)
- Chi tiêu hàng tháng (MONTHLY)
- Chi tiêu hàng quý (QUARTERLY)

**Ví dụ:**
- Tiền điện hàng tháng: ~500,000đ vào ngày 15
- Tiền cà phê hàng ngày: ~30,000đ
- Tiền gym hàng tháng: 1,000,000đ

#### 2. Seasonal Pattern (Mẫu theo mùa)
Phát hiện chi tiêu thay đổi theo mùa:
- Chi tiêu tăng vào dịp lễ
- Chi tiêu giảm vào mùa thấp điểm
- Biến động theo tháng trong năm

**Ví dụ:**
- Chi tiêu quần áo tăng vào tháng 1, 4, 9 (đầu mùa)
- Chi tiêu du lịch tăng vào tháng 4, 8, 12

#### 3. Trend Pattern (Xu hướng)
Phát hiện xu hướng tăng/giảm dần:
- Chi tiêu tăng dần theo thời gian
- Chi tiêu giảm dần theo thời gian
- Tính toán tốc độ thay đổi

**Ví dụ:**
- Chi tiêu ăn uống tăng 5% mỗi tháng
- Chi tiêu giải trí giảm 10% mỗi tháng

### Anomaly Detection (Phát hiện bất thường)

#### Các loại Anomaly:
- **UNUSUAL_AMOUNT** - Số tiền bất thường
- **UNUSUAL_FREQUENCY** - Tần suất bất thường
- **UNUSUAL_TIME** - Thời gian bất thường
- **UNUSUAL_CATEGORY** - Danh mục bất thường

#### Mức độ nghiêm trọng:
- **LOW** - Lệch < 50%
- **MEDIUM** - Lệch 50-100%
- **HIGH** - Lệch 100-200%
- **CRITICAL** - Lệch > 200%

#### Thuật toán:
```
1. Tính trung bình chi tiêu 6 tháng gần nhất
2. Tính độ lệch chuẩn (Standard Deviation)
3. So sánh giao dịch mới với trung bình
4. Nếu lệch > 2 SD hoặc > 50% → Anomaly
5. Tính mức độ nghiêm trọng
6. Tạo cảnh báo và đề xuất
```

### AI Predictions (Dự đoán)

#### Các loại dự đoán:
- **SPENDING** - Dự đoán chi tiêu
- **SAVINGS** - Dự đoán tiết kiệm
- **BUDGET_RISK** - Rủi ro vượt ngân sách
- **GOAL_ACHIEVEMENT** - Khả năng đạt mục tiêu

#### Thuật toán dự đoán:
```
1. Phân tích dữ liệu lịch sử (6-12 tháng)
2. Phát hiện patterns và trends
3. Áp dụng Linear Regression
4. Tính toán confidence score
5. Tạo dự đoán cho 1-3 tháng tới
6. Đưa ra recommendations
```

### API Endpoints

#### Phân tích patterns
```http
POST /ai-analysis/patterns/analyze?months=6
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Đã phát hiện 8 mẫu chi tiêu",
  "patterns": [
    {
      "id": 1,
      "patternType": "RECURRING",
      "category": "Điện nước",
      "averageAmount": 500000,
      "frequency": 1,
      "timePattern": "MONTHLY",
      "dayOfMonth": 15,
      "confidence": 95,
      "insights": {
        "message": "Chi tiêu định kỳ 1 lần/tháng",
        "nextExpectedDate": "2026-05-15"
      }
    }
  ]
}
```

#### Lấy patterns đã phát hiện
```http
GET /ai-analysis/patterns
Authorization: Bearer {token}
```

#### Phát hiện anomalies
```http
POST /ai-analysis/anomalies/detect
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Phát hiện 3 giao dịch bất thường",
  "anomalies": [
    {
      "id": 1,
      "anomalyType": "UNUSUAL_AMOUNT",
      "severity": "HIGH",
      "amount": 5000000,
      "expectedAmount": 1500000,
      "deviationPercentage": 233,
      "category": "Mua sắm",
      "description": "Chi tiêu Mua sắm cao hơn 233% so với trung bình",
      "status": "UNREVIEWED"
    }
  ]
}
```

#### Lấy anomalies
```http
GET /ai-analysis/anomalies?status=UNREVIEWED
Authorization: Bearer {token}
```

#### Cập nhật trạng thái anomaly
```http
PUT /ai-analysis/anomalies/:anomalyId/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "ACKNOWLEDGED",
  "note": "Đây là chi tiêu đặc biệt cho dịp lễ"
}
```

#### Tạo predictions
```http
POST /ai-analysis/predictions/generate
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Đã tạo 5 dự đoán",
  "predictions": [
    {
      "id": 1,
      "predictionType": "SPENDING",
      "category": "Ăn uống",
      "targetDate": "2026-05-31",
      "predictedAmount": 3500000,
      "confidence": 85,
      "recommendations": [
        {
          "type": "INFO",
          "message": "Dự kiến chi tiêu Ăn uống: 3.500.000đ"
        }
      ]
    }
  ]
}
```

#### Lấy predictions
```http
GET /ai-analysis/predictions
Authorization: Bearer {token}
```

#### Lấy tổng hợp insights
```http
GET /ai-analysis/insights
Authorization: Bearer {token}

Response:
{
  "summary": {
    "patternsDetected": 8,
    "anomaliesFound": 3,
    "predictionsGenerated": 5
  },
  "patterns": [...],
  "recentAnomalies": [...],
  "upcomingPredictions": [...],
  "recommendations": [
    {
      "type": "ALERT",
      "priority": "HIGH",
      "message": "Phát hiện 2 giao dịch bất thường cần xem xét",
      "action": "Kiểm tra chi tiết trong mục Anomalies"
    }
  ]
}
```

### Use Cases

**1. Phát hiện chi tiêu định kỳ:**
```bash
curl -X POST http://localhost:3000/ai-analysis/patterns/analyze?months=6 \
  -H "Authorization: Bearer TOKEN"
```

**2. Cảnh báo chi tiêu bất thường:**
```bash
curl -X POST http://localhost:3000/ai-analysis/anomalies/detect \
  -H "Authorization: Bearer TOKEN"
```

**3. Dự đoán chi tiêu tháng tới:**
```bash
curl -X POST http://localhost:3000/ai-analysis/predictions/generate \
  -H "Authorization: Bearer TOKEN"
```

---

## 2️⃣ SUBSCRIPTION MANAGEMENT

### Mục đích
Quản lý các dịch vụ đăng ký định kỳ (Netflix, Spotify, Gym, etc.) để theo dõi chi phí và tránh quên gia hạn.

### Tính năng chính
- ✅ Quản lý đăng ký (CRUD)
- ✅ Nhiều chu kỳ thanh toán (Daily, Weekly, Monthly, Quarterly, Yearly)
- ✅ Tự động tính toán ngày gia hạn tiếp theo
- ✅ Nhắc nhở trước khi đến hạn
- ✅ Theo dõi lịch sử thanh toán
- ✅ Thống kê chi phí (tháng/năm)
- ✅ Tạm dừng/Hủy đăng ký
- ✅ Tự động gia hạn

### Chu kỳ thanh toán

| Chu kỳ | Mô tả | Ví dụ |
|--------|-------|-------|
| DAILY | Hàng ngày | Báo online |
| WEEKLY | Hàng tuần | Gói tập gym tuần |
| MONTHLY | Hàng tháng | Netflix, Spotify |
| QUARTERLY | Hàng quý | Gói VIP 3 tháng |
| YEARLY | Hàng năm | Domain, Hosting |

### Trạng thái đăng ký

| Trạng thái | Mô tả |
|------------|-------|
| ACTIVE | Đang hoạt động |
| PAUSED | Tạm dừng |
| CANCELLED | Đã hủy |
| EXPIRED | Hết hạn |

### API Endpoints

#### Tạo đăng ký
```http
POST /subscriptions
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Netflix Premium",
  "description": "Gói gia đình 4 màn hình",
  "amount": 260000,
  "currency": "VND",
  "billingCycle": "MONTHLY",
  "categoryId": 5,
  "startDate": "2026-04-01T00:00:00Z",
  "provider": "Netflix",
  "website": "https://netflix.com",
  "icon": "🎬",
  "autoRenew": true,
  "reminderEnabled": true,
  "reminderDaysBefore": 3
}
```

#### Lấy danh sách đăng ký
```http
GET /subscriptions?status=ACTIVE
Authorization: Bearer {token}
```

#### Lấy thống kê
```http
GET /subscriptions/stats
Authorization: Bearer {token}

Response:
{
  "total": 8,
  "active": 6,
  "paused": 1,
  "cancelled": 1,
  "monthlyCost": 1500000,
  "yearlyCost": 18000000,
  "upcomingRenewals": 3,
  "byCategory": [
    {
      "category": "Giải trí",
      "count": 3,
      "totalCost": 800000
    }
  ],
  "topSubscriptions": [
    {
      "id": 1,
      "name": "Netflix Premium",
      "amount": 260000,
      "billingCycle": "MONTHLY"
    }
  ]
}
```

#### Lấy đăng ký sắp gia hạn
```http
GET /subscriptions/upcoming?days=30
Authorization: Bearer {token}

Response:
[
  {
    "id": 1,
    "name": "Netflix Premium",
    "amount": 260000,
    "nextBillingDate": "2026-05-01T00:00:00Z",
    "daysUntilRenewal": 4
  }
]
```

#### Cập nhật đăng ký
```http
PUT /subscriptions/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 280000,
  "reminderDaysBefore": 5
}
```

#### Hủy đăng ký
```http
PUT /subscriptions/:id/cancel
Authorization: Bearer {token}
```

#### Tạm dừng đăng ký
```http
PUT /subscriptions/:id/pause
Authorization: Bearer {token}
```

#### Tiếp tục đăng ký
```http
PUT /subscriptions/:id/resume
Authorization: Bearer {token}
```

#### Xóa đăng ký
```http
DELETE /subscriptions/:id
Authorization: Bearer {token}
```

#### Ghi nhận thanh toán
```http
POST /subscriptions/:id/payments
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 260000,
  "paymentDate": "2026-04-01T00:00:00Z",
  "paymentMethod": "Thẻ tín dụng",
  "transactionId": 123,
  "notes": "Thanh toán tự động"
}
```

#### Lấy lịch sử thanh toán
```http
GET /subscriptions/:id/payments
Authorization: Bearer {token}

Response:
[
  {
    "id": 1,
    "amount": 260000,
    "paymentDate": "2026-04-01T00:00:00Z",
    "dueDate": "2026-04-01T00:00:00Z",
    "status": "PAID",
    "paymentMethod": "Thẻ tín dụng"
  }
]
```

### Tự động hóa

#### Cron Job 1: Xử lý gia hạn (Chạy hàng ngày lúc 00:00)
```typescript
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
async processRenewals() {
  // Tìm các đăng ký đến hạn
  // Tạo payment pending
  // Gửi thông báo
}
```

#### Cron Job 2: Gửi nhắc nhở (Chạy hàng ngày lúc 09:00)
```typescript
@Cron(CronExpression.EVERY_DAY_AT_9AM)
async sendReminders() {
  // Tìm đăng ký sắp đến hạn
  // Gửi email/notification
  // Đánh dấu đã gửi
}
```

### Use Cases

**1. Thêm đăng ký Netflix:**
```bash
curl -X POST http://localhost:3000/subscriptions \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "Netflix Premium",
    "amount": 260000,
    "billingCycle": "MONTHLY",
    "startDate": "2026-04-01"
  }'
```

**2. Xem tổng chi phí đăng ký:**
```bash
curl http://localhost:3000/subscriptions/stats \
  -H "Authorization: Bearer TOKEN"
```

**3. Kiểm tra đăng ký sắp hết hạn:**
```bash
curl http://localhost:3000/subscriptions/upcoming?days=7 \
  -H "Authorization: Bearer TOKEN"
```

---

## 📊 Database Migration

Chạy migration:

```bash
sqlcmd -S localhost -U sa -P your_password -d ExpenseTrackerDB -i migration_ai_subscriptions.sql
```

### Các bảng được tạo:

**AI Analysis:**
- `SpendingPatterns` - Mẫu chi tiêu
- `AIPredictions` - Dự đoán AI
- `SpendingAnomalies` - Chi tiêu bất thường

**Subscription Management:**
- `Subscriptions` - Đăng ký
- `SubscriptionPayments` - Thanh toán đăng ký

---

## 🔄 Tích hợp

### Tự động phân tích khi có giao dịch mới
```typescript
// Trong transaction.service.ts
async createTransaction(userId: number, data: any) {
  const transaction = await this.save(data);
  
  // Trigger AI analysis
  await this.aiAnalysisService.detectAnomalies(userId);
  
  return transaction;
}
```

### Tự động tạo giao dịch từ subscription
```typescript
// Trong subscriptions.service.ts
async processRenewals() {
  // Tạo transaction tự động
  await this.transactionService.create({
    type: 'EXPENSE',
    amount: subscription.amount,
    description: `Gia hạn ${subscription.name}`,
    categoryId: subscription.categoryId
  });
}
```

---

## 💡 Best Practices

### AI Analysis:
1. Chạy phân tích patterns mỗi tuần
2. Kiểm tra anomalies hàng ngày
3. Tạo predictions đầu mỗi tháng
4. Review và acknowledge anomalies

### Subscriptions:
1. Bật reminder cho tất cả đăng ký
2. Review chi phí đăng ký hàng tháng
3. Hủy đăng ký không sử dụng
4. Ghi nhận thanh toán đúng hạn

---

**Ngày tạo:** 27/04/2026  
**Phiên bản:** 1.0.0
