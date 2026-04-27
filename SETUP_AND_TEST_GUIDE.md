# Setup & Test Guide - Expense Tracker

## 🚀 Hướng dẫn cài đặt và test ứng dụng

### Yêu cầu hệ thống

- Node.js 18+ 
- SQL Server 2019+
- npm hoặc yarn

---

## 📦 BƯỚC 1: Setup Database

### 1.1. Tạo Database

```sql
CREATE DATABASE ExpenseTrackerDB;
GO
```

### 1.2. Chạy Migrations

```bash
# Migration 1: Core tables
sqlcmd -S localhost -U sa -P your_password -d ExpenseTrackerDB -i migration_new_features.sql

# Migration 2: Recurring & Savings
sqlcmd -S localhost -U sa -P your_password -d ExpenseTrackerDB -i migration_recurring_and_savings.sql

# Migration 3: Budgets & Users
sqlcmd -S localhost -U sa -P your_password -d ExpenseTrackerDB -i migration_budgets_and_users.sql

# Migration 4: Debts, Investments, Net Worth
sqlcmd -S localhost -U sa -P your_password -d ExpenseTrackerDB -i migration_debts_investments_networth.sql

# Migration 5: Advanced Features
sqlcmd -S localhost -U sa -P your_password -d ExpenseTrackerDB -i migration_advanced_features.sql

# Migration 6: AI & Subscriptions
sqlcmd -S localhost -U sa -P your_password -d ExpenseTrackerDB -i migration_ai_subscriptions.sql
```

### 1.3. Seed Data (Optional)

```bash
sqlcmd -S localhost -U sa -P your_password -d ExpenseTrackerDB -i seed_data.sql
```

---

## 🔧 BƯỚC 2: Setup Backend

### 2.1. Install Dependencies

```bash
cd app/backend
npm install
```

### 2.2. Configure Environment

Tạo file `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=your_password
DB_DATABASE=ExpenseTrackerDB

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# Email (Optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### 2.3. Start Backend

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Backend sẽ chạy tại: **http://localhost:3000**

### 2.4. Verify Backend

Mở trình duyệt: **http://localhost:3000/api/docs** (Swagger UI)

---

## 🎨 BƯỚC 3: Setup Frontend

### 3.1. Install Dependencies

```bash
cd app/frontend
npm install
```

### 3.2. Configure Environment

Tạo file `.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 3.3. Start Frontend

```bash
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:3001**

---

## 🧪 BƯỚC 4: Test Application

### 4.1. Test Backend API

#### Test 1: Health Check

```bash
curl http://localhost:3000
```

Expected: `{"message": "Expense Tracker API is running"}`

#### Test 2: Register User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

Expected: `{"message": "User registered successfully"}`

#### Test 3: Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

Expected: `{"access_token": "...", "user": {...}}`

**Lưu token để dùng cho các test tiếp theo!**

#### Test 4: Create Transaction

```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "EXPENSE",
    "amount": 50000,
    "description": "Ăn trưa",
    "date": "2026-04-27",
    "categoryId": 1
  }'
```

#### Test 5: Get Transactions

```bash
curl http://localhost:3000/transactions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Test 6: Create Budget

```bash
curl -X POST http://localhost:3000/budgets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Ngân sách ăn uống tháng 4",
    "amount": 3000000,
    "categoryId": 1,
    "startDate": "2026-04-01",
    "endDate": "2026-04-30"
  }'
```

#### Test 7: Create Savings Goal

```bash
curl -X POST http://localhost:3000/savings-goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Mua laptop mới",
    "targetAmount": 20000000,
    "currentAmount": 5000000,
    "deadline": "2026-12-31",
    "icon": "💻"
  }'
```

#### Test 8: Create Subscription

```bash
curl -X POST http://localhost:3000/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Netflix Premium",
    "amount": 260000,
    "billingCycle": "MONTHLY",
    "provider": "Netflix",
    "startDate": "2026-04-01",
    "icon": "🎬"
  }'
```

#### Test 9: AI Pattern Analysis

```bash
curl -X POST http://localhost:3000/ai-analysis/patterns/analyze?months=6 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Test 10: Gamification Stats

```bash
curl http://localhost:3000/gamification/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4.2. Test Frontend

#### Test 1: Open Application

Mở trình duyệt: **http://localhost:3001**

#### Test 2: Register Account

1. Click "Đăng ký ngay"
2. Điền thông tin:
   - Username: testuser2
   - Email: test2@example.com
   - Password: password123
3. Click "Đăng ký"

Expected: Redirect to login page

#### Test 3: Login

1. Điền thông tin:
   - Username: testuser2
   - Password: password123
2. Click "Đăng nhập"

Expected: Redirect to Dashboard

#### Test 4: Dashboard

Verify:
- ✅ Stats cards hiển thị
- ✅ Charts render
- ✅ Recent transactions list

#### Test 5: Create Transaction

1. Click "Giao dịch" trong sidebar
2. Click "Thêm giao dịch"
3. Điền form:
   - Loại: Chi tiêu
   - Số tiền: 50000
   - Mô tả: Ăn trưa
   - Danh mục: Ăn uống
   - Ngày: Hôm nay
4. Click "Thêm"

Expected: Transaction xuất hiện trong list

#### Test 6: Create Budget

1. Click "Ngân sách" trong sidebar
2. Click "Tạo ngân sách"
3. Điền form:
   - Tên: Ngân sách ăn uống
   - Số tiền: 3000000
   - Danh mục: Ăn uống
   - Từ ngày: 01/04/2026
   - Đến ngày: 30/04/2026
4. Click "Tạo"

Expected: Budget card xuất hiện

#### Test 7: Create Savings Goal

1. Click "Mục tiêu" trong sidebar
2. Click "Tạo mục tiêu"
3. Điền form:
   - Icon: 💻
   - Tên: Mua laptop
   - Số tiền mục tiêu: 20000000
   - Số tiền hiện tại: 5000000
   - Hạn: 31/12/2026
4. Click "Tạo"

Expected: Goal card xuất hiện với progress bar

#### Test 8: Create Subscription

1. Click "Đăng ký" trong sidebar
2. Click "Thêm đăng ký"
3. Điền form:
   - Icon: 🎬
   - Tên: Netflix Premium
   - Giá: 260000
   - Chu kỳ: Hàng tháng
   - Ngày bắt đầu: 01/04/2026
4. Click "Thêm"

Expected: Subscription card xuất hiện

#### Test 9: Search & Filter

1. Trong trang Transactions
2. Nhập "ăn" vào search box
3. Click filter "Chi tiêu"

Expected: Chỉ hiển thị transactions matching

#### Test 10: Edit & Delete

1. Click icon Edit trên một transaction
2. Sửa thông tin
3. Click "Cập nhật"
4. Click icon Delete
5. Confirm

Expected: Transaction được update/delete

---

## 🐛 Troubleshooting

### Backend không start

**Lỗi:** `Cannot connect to database`

**Giải pháp:**
1. Kiểm tra SQL Server đang chạy
2. Kiểm tra credentials trong `.env`
3. Kiểm tra firewall

**Lỗi:** `Port 3000 already in use`

**Giải pháp:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Frontend không start

**Lỗi:** `Module not found`

**Giải pháp:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Lỗi:** `API calls failing`

**Giải pháp:**
1. Kiểm tra backend đang chạy
2. Kiểm tra VITE_API_URL trong `.env`
3. Check browser console for CORS errors

### Database errors

**Lỗi:** `Table does not exist`

**Giải pháp:**
Chạy lại migrations theo thứ tự

**Lỗi:** `Foreign key constraint`

**Giải pháp:**
Xóa database và tạo lại từ đầu

---

## 📊 Test Results Expected

### Backend Tests
- ✅ 10/10 API endpoints working
- ✅ Authentication working
- ✅ CRUD operations working
- ✅ AI analysis working
- ✅ Gamification working

### Frontend Tests
- ✅ 10/10 UI tests passing
- ✅ All pages rendering
- ✅ Forms working
- ✅ API integration working
- ✅ State management working

---

## 🎯 Performance Benchmarks

### Backend
- Average response time: < 100ms
- Database queries: < 50ms
- JWT validation: < 10ms

### Frontend
- Initial load: < 2s
- Page transitions: < 500ms
- API calls: < 1s

---

## 📝 Test Checklist

### Backend ✅
- [ ] Database connection
- [ ] Migrations run successfully
- [ ] Auth endpoints working
- [ ] Transaction CRUD
- [ ] Budget CRUD
- [ ] Savings Goal CRUD
- [ ] Subscription CRUD
- [ ] AI Analysis
- [ ] Gamification
- [ ] Export/Import

### Frontend ✅
- [ ] Login/Register
- [ ] Dashboard loads
- [ ] Transactions page
- [ ] Budgets page
- [ ] Savings Goals page
- [ ] Subscriptions page
- [ ] Search & Filter
- [ ] Create/Edit/Delete
- [ ] Responsive design
- [ ] Error handling

---

## 🚀 Next Steps

1. ✅ Complete remaining pages (Analytics, AI Insights, Social, Gamification)
2. ✅ Add unit tests
3. ✅ Add integration tests
4. ✅ Performance optimization
5. ✅ Security audit
6. ✅ Deploy to production

---

**Happy Testing! 🎉**
