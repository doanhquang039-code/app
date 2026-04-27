# Advanced Features Documentation

## 🚀 Tổng quan
3 tính năng nâng cao mới đã được thêm vào ứng dụng Expense Tracker:

1. **Export/Import Data** - Xuất/nhập dữ liệu
2. **Gamification System** - Hệ thống điểm thưởng và thành tích
3. **Social Features** - Tính năng xã hội

---

## 1️⃣ EXPORT/IMPORT DATA

### Mục đích
Cho phép người dùng xuất dữ liệu ra nhiều định dạng khác nhau và nhập dữ liệu từ file.

### Tính năng chính
- ✅ Xuất dữ liệu ra Excel, CSV, PDF, JSON
- ✅ Xuất theo loại dữ liệu (Giao dịch, Ngân sách, Mục tiêu, Hóa đơn, Tất cả)
- ✅ Lọc theo khoảng thời gian, danh mục, ví
- ✅ Lịch sử xuất file
- ✅ Tự động xóa file cũ sau 7 ngày
- ✅ Nhập dữ liệu từ Excel, CSV, JSON
- ✅ Kiểm tra trùng lặp khi nhập

### API Endpoints

#### Xuất dữ liệu
```http
POST /export-import/export
Authorization: Bearer {token}
Content-Type: application/json

{
  "exportType": "EXCEL",
  "dataType": "TRANSACTIONS",
  "startDate": "2026-01-01",
  "endDate": "2026-04-27",
  "categoryIds": [1, 2, 3],
  "walletIds": [1],
  "includeAttachments": false
}
```

**Các loại exportType:**
- `EXCEL` - File Excel (.xlsx)
- `CSV` - File CSV (.csv)
- `PDF` - File PDF (.pdf)
- `JSON` - File JSON (.json)

**Các loại dataType:**
- `TRANSACTIONS` - Giao dịch
- `BUDGETS` - Ngân sách
- `SAVINGS_GOALS` - Mục tiêu tiết kiệm
- `BILLS` - Hóa đơn
- `BANK_ACCOUNTS` - Tài khoản ngân hàng
- `CREDIT_CARDS` - Thẻ tín dụng
- `REPORTS` - Báo cáo
- `ALL` - Tất cả dữ liệu

#### Lấy lịch sử xuất file
```http
GET /export-import/history
Authorization: Bearer {token}
```

#### Tải file đã xuất
```http
GET /export-import/download/:exportId
Authorization: Bearer {token}
```

#### Nhập dữ liệu
```http
POST /export-import/import?dataType=TRANSACTIONS
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [file Excel/CSV/JSON]
```

#### Xóa file cũ (Admin)
```http
DELETE /export-import/cleanup
Authorization: Bearer {token}
```

### Ví dụ sử dụng

**Xuất tất cả giao dịch tháng 4:**
```bash
curl -X POST http://localhost:3000/export-import/export \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "exportType": "EXCEL",
    "dataType": "TRANSACTIONS",
    "startDate": "2026-04-01",
    "endDate": "2026-04-30"
  }'
```

**Nhập giao dịch từ file Excel:**
```bash
curl -X POST "http://localhost:3000/export-import/import?dataType=TRANSACTIONS" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@transactions.xlsx"
```

---

## 2️⃣ GAMIFICATION SYSTEM

### Mục đích
Tạo động lực cho người dùng thông qua hệ thống điểm, cấp độ, thành tích và xếp hạng.

### Tính năng chính
- ✅ Hệ thống điểm và cấp độ
- ✅ Chuỗi đăng nhập hàng ngày
- ✅ Thành tích (Achievements)
- ✅ Bảng xếp hạng
- ✅ Lịch sử điểm
- ✅ Hệ thống rank (Người mới → Huyền thoại)

### Cách tính điểm

| Hành động | Điểm |
|-----------|------|
| Thêm giao dịch | 5 |
| Tạo ngân sách | 10 |
| Hoàn thành ngân sách | 20 |
| Tạo mục tiêu tiết kiệm | 15 |
| Đạt mục tiêu tiết kiệm | 50 |
| Thanh toán hóa đơn đúng hạn | 10 |
| Đăng nhập hàng ngày | 5 |
| Chuỗi 7 ngày | 25 |
| Chuỗi 30 ngày | 100 |
| Xuất dữ liệu | 5 |
| Hoàn thiện hồ sơ | 20 |

### Hệ thống Rank

| Rank | Điểm tối thiểu |
|------|----------------|
| Người mới | 0 |
| Đồng | 100 |
| Bạc | 500 |
| Vàng | 1,500 |
| Bạch kim | 3,000 |
| Kim cương | 6,000 |
| Huyền thoại | 10,000 |

### Thành tích (Achievements)

**Tracking:**
- 🎯 Bước đầu tiên - Thêm giao dịch đầu tiên (10 điểm)
- 📝 Người ghi chép - Thêm 50 giao dịch (50 điểm)
- 💼 Chuyên gia tài chính - Thêm 200 giao dịch (200 điểm)

**Budgeting:**
- 📊 Người lập kế hoạch - Tạo ngân sách đầu tiên (15 điểm)
- 🎖️ Kỷ luật tài chính - Hoàn thành 5 ngân sách (75 điểm)

**Savings:**
- 💰 Người tiết kiệm - Đạt mục tiêu đầu tiên (100 điểm)
- 💎 Triệu phú - Tiết kiệm 10 triệu đồng (250 điểm)

**Streak:**
- 🔥 Chuỗi 7 ngày - Đăng nhập liên tục 7 ngày (30 điểm)
- ⚡ Chuỗi 30 ngày - Đăng nhập liên tục 30 ngày (150 điểm)
- 👑 Huyền thoại - Đăng nhập liên tục 100 ngày (500 điểm)

### API Endpoints

#### Lấy thống kê điểm
```http
GET /gamification/stats
Authorization: Bearer {token}
```

Response:
```json
{
  "totalPoints": 1250,
  "level": 5,
  "currentLevelPoints": 75,
  "nextLevelPoints": 150,
  "progressToNextLevel": 50,
  "dailyStreak": 15,
  "longestStreak": 30,
  "rank": "Bạc",
  "achievements": {
    "total": 10,
    "unlocked": 5,
    "locked": 5
  }
}
```

#### Cập nhật chuỗi đăng nhập
```http
POST /gamification/daily-login
Authorization: Bearer {token}
```

#### Lấy bảng xếp hạng
```http
GET /gamification/leaderboard?limit=50
Authorization: Bearer {token}
```

#### Lấy lịch sử điểm
```http
GET /gamification/points-history?limit=50
Authorization: Bearer {token}
```

#### Lấy thành tích của user
```http
GET /gamification/achievements
Authorization: Bearer {token}
```

#### Lấy tất cả thành tích
```http
GET /gamification/achievements/all
Authorization: Bearer {token}
```

#### Khởi tạo thành tích (Admin)
```http
POST /gamification/seed-achievements
Authorization: Bearer {token}
```

---

## 3️⃣ SOCIAL FEATURES

### Mục đích
Cho phép người dùng kết nối với bạn bè và tham gia các thử thách chi tiêu cùng nhau.

### Tính năng chính
- ✅ Kết bạn và quản lý bạn bè
- ✅ Phân quyền xem dữ liệu cho bạn bè
- ✅ Tạo và tham gia thử thách chi tiêu
- ✅ Bảng xếp hạng thử thách
- ✅ Tìm kiếm người dùng

### Quản lý bạn bè

#### Gửi lời mời kết bạn
```http
POST /social/friends/request/:friendId
Authorization: Bearer {token}
```

#### Chấp nhận lời mời
```http
PUT /social/friends/accept/:requestId
Authorization: Bearer {token}
```

#### Từ chối lời mời
```http
PUT /social/friends/reject/:requestId
Authorization: Bearer {token}
```

#### Xóa bạn bè
```http
DELETE /social/friends/:friendshipId
Authorization: Bearer {token}
```

#### Lấy danh sách bạn bè
```http
GET /social/friends
Authorization: Bearer {token}
```

#### Lấy lời mời kết bạn
```http
GET /social/friends/requests
Authorization: Bearer {token}
```

#### Cập nhật quyền xem
```http
PUT /social/friends/:friendshipId/permissions
Authorization: Bearer {token}
Content-Type: application/json

{
  "canViewTransactions": true,
  "canViewBudgets": true,
  "canViewGoals": false
}
```

#### Tìm kiếm người dùng
```http
GET /social/users/search?q=john
Authorization: Bearer {token}
```

### Thử thách chi tiêu

#### Tạo thử thách
```http
POST /social/challenges
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Thử thách tiết kiệm tháng 5",
  "description": "Tiết kiệm ít nhất 2 triệu trong tháng 5",
  "challengeType": "SAVINGS",
  "targetAmount": 2000000,
  "startDate": "2026-05-01T00:00:00Z",
  "endDate": "2026-05-31T23:59:59Z",
  "isPublic": true,
  "icon": "💰"
}
```

**Các loại thử thách:**
- `SAVINGS` - Tiết kiệm
- `SPENDING_LIMIT` - Giới hạn chi tiêu
- `NO_SPEND` - Không chi tiêu
- `CATEGORY_LIMIT` - Giới hạn theo danh mục

#### Lấy thử thách công khai
```http
GET /social/challenges/public
Authorization: Bearer {token}
```

#### Lấy thử thách của tôi
```http
GET /social/challenges/my
Authorization: Bearer {token}
```

#### Tham gia thử thách
```http
POST /social/challenges/:challengeId/join
Authorization: Bearer {token}
```

#### Rời khỏi thử thách
```http
DELETE /social/challenges/:challengeId/leave
Authorization: Bearer {token}
```

#### Lấy bảng xếp hạng
```http
GET /social/challenges/:challengeId/leaderboard
Authorization: Bearer {token}
```

#### Cập nhật tiến độ
```http
PUT /social/challenges/:challengeId/progress
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 1500000
}
```

---

## 📊 Database Migration

Chạy migration để tạo các bảng mới:

```bash
sqlcmd -S localhost -U sa -P your_password -d ExpenseTrackerDB -i migration_advanced_features.sql
```

### Các bảng được tạo:

**Export/Import:**
- `ExportHistory` - Lịch sử xuất file

**Gamification:**
- `Achievements` - Thành tích
- `UserAchievements` - Thành tích của user
- `UserPoints` - Điểm và cấp độ
- `PointsHistory` - Lịch sử điểm

**Social:**
- `UserFriends` - Quan hệ bạn bè
- `SpendingChallenges` - Thử thách chi tiêu
- `ChallengeParticipants` - Người tham gia thử thách

---

## 🔄 Cập nhật App Module

Thêm các module mới vào `app.module.ts`:

```typescript
import { ExportImportModule } from './modules/export-import/export-import.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { SocialModule } from './modules/social/social.module';

@Module({
  imports: [
    // ... existing modules
    ExportImportModule,
    GamificationModule,
    SocialModule,
  ],
})
export class AppModule {}
```

---

## 🚀 Khởi động

### 1. Cài đặt dependencies
```bash
cd backend
npm install
```

### 2. Chạy migration
```bash
sqlcmd -S localhost -U sa -P 123456789 -d ExpenseTrackerDB -i ../migration_advanced_features.sql
```

### 3. Khởi tạo thành tích
```bash
curl -X POST http://localhost:3000/gamification/seed-achievements \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 4. Chạy ứng dụng
```bash
npm run start:dev
```

---

## 💡 Use Cases

### Xuất báo cáo tháng
```bash
# Xuất tất cả giao dịch tháng 4 ra Excel
curl -X POST http://localhost:3000/export-import/export \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "exportType": "EXCEL",
    "dataType": "ALL",
    "startDate": "2026-04-01",
    "endDate": "2026-04-30"
  }'
```

### Tạo thử thách với bạn bè
```bash
# 1. Tìm bạn bè
curl http://localhost:3000/social/users/search?q=john \
  -H "Authorization: Bearer TOKEN"

# 2. Gửi lời mời kết bạn
curl -X POST http://localhost:3000/social/friends/request/5 \
  -H "Authorization: Bearer TOKEN"

# 3. Tạo thử thách
curl -X POST http://localhost:3000/social/challenges \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "Tiết kiệm cùng nhau",
    "challengeType": "SAVINGS",
    "targetAmount": 5000000,
    "startDate": "2026-05-01",
    "endDate": "2026-05-31",
    "isPublic": true
  }'
```

### Theo dõi tiến độ
```bash
# Kiểm tra điểm và cấp độ
curl http://localhost:3000/gamification/stats \
  -H "Authorization: Bearer TOKEN"

# Xem bảng xếp hạng
curl http://localhost:3000/gamification/leaderboard \
  -H "Authorization: Bearer TOKEN"
```

---

## 🎯 Tích hợp với tính năng hiện có

### Tự động tặng điểm
Khi user thực hiện các hành động, tự động gọi service gamification:

```typescript
// Trong transaction.service.ts
async createTransaction(userId: number, data: any) {
  const transaction = await this.transactionRepo.save(data);
  
  // Award points
  await this.gamificationService.awardPoints(
    userId,
    'TRANSACTION_ADDED',
    'Thêm giao dịch mới'
  );
  
  return transaction;
}
```

### Cập nhật tiến độ thử thách
```typescript
// Trong transaction.service.ts
async createTransaction(userId: number, data: any) {
  const transaction = await this.transactionRepo.save(data);
  
  // Update challenge progress
  const challenges = await this.socialService.getUserChallenges(userId);
  for (const challenge of challenges) {
    await this.socialService.updateChallengeProgress(
      userId,
      challenge.id,
      newAmount
    );
  }
  
  return transaction;
}
```

---

## 📈 Metrics

### Gamification
- Tổng điểm của user
- Cấp độ hiện tại
- Chuỗi đăng nhập
- Số thành tích đã mở khóa
- Vị trí trên bảng xếp hạng

### Social
- Số lượng bạn bè
- Số thử thách đang tham gia
- Xếp hạng trong thử thách
- Tỷ lệ hoàn thành thử thách

### Export/Import
- Số lần xuất file
- Tổng dung lượng file
- Loại file phổ biến nhất
- Số bản ghi đã nhập

---

**Ngày tạo:** 27/04/2026  
**Phiên bản:** 1.0.0
