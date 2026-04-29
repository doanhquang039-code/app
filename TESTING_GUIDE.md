# 🧪 Testing Guide - Expense Tracker Features

## 📋 Table of Contents
1. [Setup](#setup)
2. [Authentication](#authentication)
3. [AI Analysis Features](#ai-analysis-features)
4. [Export/Import Features](#exportimport-features)
5. [Gamification Features](#gamification-features)
6. [Social Features](#social-features)
7. [Subscription Management](#subscription-management)

---

## 🔧 Setup

### 1. Start the Backend Server
```bash
cd app/backend
npm run start:dev
```

Server will start on: `http://localhost:3000`

### 2. Access API Documentation
Open browser: `http://localhost:3000/api`

This will show Swagger UI with all available endpoints.

---

## 🔐 Authentication

### Register a New User
```bash
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!",
  "fullName": "Test User",
  "username": "testuser"
}
```

### Login
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!"
}
```

**Response**: You'll receive a JWT token. Use this token in all subsequent requests:
```
Authorization: Bearer <your_token_here>
```

---

## 🤖 AI Analysis Features

### 1. Analyze Spending Patterns
Detects recurring, seasonal, and trend patterns in your spending.

```bash
POST http://localhost:3000/ai-analysis/patterns/analyze?months=6
Authorization: Bearer <token>
```

**What it does**:
- Analyzes last 6 months of transactions
- Detects recurring payments (subscriptions, bills)
- Identifies seasonal spending patterns
- Finds spending trends (increasing/decreasing)

**Expected Response**:
```json
{
  "success": true,
  "message": "Đã phát hiện 5 mẫu chi tiêu",
  "patterns": [
    {
      "id": 1,
      "patternType": "RECURRING",
      "category": "Utilities",
      "averageAmount": 150000,
      "frequency": 1,
      "confidence": 85,
      "insights": "{\"message\":\"Chi tiêu định kỳ 1 lần/tháng\"}"
    }
  ]
}
```

### 2. Get Detected Patterns
```bash
GET http://localhost:3000/ai-analysis/patterns
Authorization: Bearer <token>
```

### 3. Detect Spending Anomalies
Finds unusual transactions that deviate from your normal spending.

```bash
POST http://localhost:3000/ai-analysis/anomalies/detect
Authorization: Bearer <token>
```

**What it does**:
- Compares recent transactions to historical data
- Flags transactions > 2 standard deviations from average
- Calculates severity (LOW, MEDIUM, HIGH, CRITICAL)
- Provides recommendations

**Expected Response**:
```json
{
  "success": true,
  "message": "Phát hiện 3 giao dịch bất thường",
  "anomalies": [
    {
      "id": 1,
      "anomalyType": "UNUSUAL_AMOUNT",
      "severity": "HIGH",
      "amount": 5000000,
      "expectedAmount": 500000,
      "deviationPercentage": 900,
      "description": "Chi tiêu Shopping cao hơn 900% so với trung bình"
    }
  ]
}
```

### 4. Get Anomalies List
```bash
GET http://localhost:3000/ai-analysis/anomalies?status=UNREVIEWED
Authorization: Bearer <token>
```

### 5. Update Anomaly Status
Mark an anomaly as reviewed, false positive, or confirmed.

```bash
PUT http://localhost:3000/ai-analysis/anomalies/1/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "CONFIRMED",
  "note": "This was an emergency expense"
}
```

### 6. Generate Spending Predictions
Predicts future spending based on patterns.

```bash
POST http://localhost:3000/ai-analysis/predictions/generate
Authorization: Bearer <token>
```

**What it does**:
- Predicts next month's spending by category
- Uses historical patterns and trends
- Provides confidence scores
- Generates recommendations

### 7. Get AI Insights Dashboard
Comprehensive overview of all AI analysis.

```bash
GET http://localhost:3000/ai-analysis/insights
Authorization: Bearer <token>
```

**Expected Response**:
```json
{
  "summary": {
    "patternsDetected": 5,
    "anomaliesFound": 3,
    "predictionsGenerated": 8
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

---

## 📤 Export/Import Features

### 1. Export Data to Excel
```bash
POST http://localhost:3000/export-import/export
Authorization: Bearer <token>
Content-Type: application/json

{
  "exportType": "EXCEL",
  "dataType": "TRANSACTIONS",
  "startDate": "2026-01-01",
  "endDate": "2026-04-29"
}
```

**Export Types**: `EXCEL`, `CSV`, `PDF`, `JSON`  
**Data Types**: `TRANSACTIONS`, `BUDGETS`, `SAVINGS_GOALS`, `BILLS`, `ALL`

### 2. Export All Data
```bash
POST http://localhost:3000/export-import/export
Authorization: Bearer <token>
Content-Type: application/json

{
  "exportType": "EXCEL",
  "dataType": "ALL"
}
```

This creates an Excel file with multiple sheets:
- Transactions
- Budgets
- Savings Goals
- Bills

### 3. Get Export History
```bash
GET http://localhost:3000/export-import/history
Authorization: Bearer <token>
```

### 4. Download Exported File
```bash
GET http://localhost:3000/export-import/download/1
Authorization: Bearer <token>
```

### 5. Import Data from File
```bash
POST http://localhost:3000/export-import/import?dataType=TRANSACTIONS
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <select your Excel/CSV/JSON file>
```

**Supported Formats**: `.xlsx`, `.xls`, `.csv`, `.json`  
**Max File Size**: 10MB

---

## 🎮 Gamification Features

### 1. Get User Stats
View your points, level, rank, and achievements.

```bash
GET http://localhost:3000/gamification/stats
Authorization: Bearer <token>
```

**Expected Response**:
```json
{
  "totalPoints": 450,
  "level": 5,
  "currentLevelPoints": 50,
  "nextLevelPoints": 200,
  "progressToNextLevel": 25,
  "rank": "Bạc",
  "dailyStreak": 7,
  "longestStreak": 15,
  "recentActivity": [...],
  "achievements": {
    "total": 10,
    "unlocked": 4,
    "locked": 6
  }
}
```

### 2. Daily Login (Earn Points)
```bash
POST http://localhost:3000/gamification/daily-login
Authorization: Bearer <token>
```

**Points Earned**: 5 points + streak bonuses

### 3. Get Leaderboard
```bash
GET http://localhost:3000/gamification/leaderboard?limit=50
Authorization: Bearer <token>
```

### 4. Get All Achievements
```bash
GET http://localhost:3000/gamification/achievements
Authorization: Bearer <token>
```

**Achievement Categories**:
- **TRACKING**: Transaction-related achievements
- **BUDGETING**: Budget management achievements
- **SAVINGS**: Savings goal achievements
- **STREAK**: Daily login streaks

**Rarity Levels**: `COMMON`, `RARE`, `EPIC`, `LEGENDARY`

### 5. Get Points History
```bash
GET http://localhost:3000/gamification/history?limit=50
Authorization: Bearer <token>
```

### 6. Automatic Point Awards
Points are automatically awarded for:
- ✅ Adding transactions (5 points)
- ✅ Creating budgets (10 points)
- ✅ Completing budgets (20 points)
- ✅ Creating savings goals (15 points)
- ✅ Achieving savings goals (50 points)
- ✅ Paying bills on time (10 points)
- ✅ Daily login (5 points)
- ✅ 7-day streak (25 points)
- ✅ 30-day streak (100 points)

---

## 👥 Social Features

### 1. Search Users
```bash
GET http://localhost:3000/social/users/search?query=john
Authorization: Bearer <token>
```

### 2. Send Friend Request
```bash
POST http://localhost:3000/social/friends/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "friendId": 2
}
```

### 3. Get Friend Requests
```bash
GET http://localhost:3000/social/friends/requests
Authorization: Bearer <token>
```

### 4. Accept Friend Request
```bash
POST http://localhost:3000/social/friends/accept/1
Authorization: Bearer <token>
```

### 5. Get Friends List
```bash
GET http://localhost:3000/social/friends
Authorization: Bearer <token>
```

### 6. Update Friend Permissions
Control what friends can see.

```bash
PUT http://localhost:3000/social/friends/1/permissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "canViewTransactions": true,
  "canViewBudgets": false,
  "canViewGoals": true
}
```

### 7. Create Spending Challenge
```bash
POST http://localhost:3000/social/challenges
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Save 1 Million Challenge",
  "description": "Let's save 1 million VND this month!",
  "challengeType": "SAVINGS",
  "targetAmount": 1000000,
  "startDate": "2026-05-01",
  "endDate": "2026-05-31",
  "isPublic": true
}
```

**Challenge Types**: `SAVINGS`, `SPENDING_LIMIT`, `BUDGET_ADHERENCE`

### 8. Get Public Challenges
```bash
GET http://localhost:3000/social/challenges/public
Authorization: Bearer <token>
```

### 9. Join Challenge
```bash
POST http://localhost:3000/social/challenges/1/join
Authorization: Bearer <token>
```

### 10. Get Challenge Leaderboard
```bash
GET http://localhost:3000/social/challenges/1/leaderboard
Authorization: Bearer <token>
```

### 11. Update Challenge Progress
```bash
PUT http://localhost:3000/social/challenges/1/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500000
}
```

---

## 💳 Subscription Management

### 1. Create Subscription
```bash
POST http://localhost:3000/subscriptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Netflix Premium",
  "provider": "Netflix",
  "amount": 260000,
  "billingCycle": "MONTHLY",
  "startDate": "2026-04-01",
  "categoryId": 5,
  "autoRenew": true,
  "reminderEnabled": true,
  "reminderDaysBefore": 3
}
```

**Billing Cycles**: `DAILY`, `WEEKLY`, `MONTHLY`, `QUARTERLY`, `YEARLY`

### 2. Get All Subscriptions
```bash
GET http://localhost:3000/subscriptions
Authorization: Bearer <token>
```

### 3. Get Subscription Statistics
```bash
GET http://localhost:3000/subscriptions/stats
Authorization: Bearer <token>
```

**Expected Response**:
```json
{
  "total": 8,
  "active": 6,
  "paused": 1,
  "cancelled": 1,
  "monthlyCost": 850000,
  "yearlyCost": 10200000,
  "upcomingRenewals": 3,
  "byCategory": [...],
  "topSubscriptions": [...]
}
```

### 4. Get Upcoming Renewals
```bash
GET http://localhost:3000/subscriptions/upcoming?days=30
Authorization: Bearer <token>
```

### 5. Update Subscription
```bash
PUT http://localhost:3000/subscriptions/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 280000,
  "reminderDaysBefore": 5
}
```

### 6. Cancel Subscription
```bash
PUT http://localhost:3000/subscriptions/1/cancel
Authorization: Bearer <token>
```

### 7. Pause Subscription
```bash
PUT http://localhost:3000/subscriptions/1/pause
Authorization: Bearer <token>
```

### 8. Resume Subscription
```bash
PUT http://localhost:3000/subscriptions/1/resume
Authorization: Bearer <token>
```

### 9. Record Payment
```bash
POST http://localhost:3000/subscriptions/1/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethod": "Credit Card",
  "notes": "Auto-paid via credit card"
}
```

### 10. Get Payment History
```bash
GET http://localhost:3000/subscriptions/1/payments
Authorization: Bearer <token>
```

---

## 🧪 Testing Workflow

### Complete Test Scenario

1. **Register & Login**
   - Create account
   - Login to get JWT token

2. **Add Sample Data**
   - Create categories
   - Add transactions (at least 20-30 for AI analysis)
   - Create budgets
   - Set savings goals

3. **Test AI Features**
   - Analyze patterns
   - Detect anomalies
   - Generate predictions
   - View insights

4. **Test Export**
   - Export transactions to Excel
   - Download the file
   - Verify data

5. **Test Gamification**
   - Check stats
   - Daily login
   - View achievements
   - Check leaderboard

6. **Test Social**
   - Search users
   - Send friend requests
   - Create challenge
   - Join challenge

7. **Test Subscriptions**
   - Add subscriptions
   - View stats
   - Check upcoming renewals
   - Record payments

---

## 📊 Expected Results

### AI Analysis
- ✅ Patterns detected for recurring expenses
- ✅ Anomalies flagged for unusual spending
- ✅ Predictions generated for next month
- ✅ Recommendations provided

### Export/Import
- ✅ Files generated successfully
- ✅ Data exported correctly
- ✅ Import works without errors

### Gamification
- ✅ Points awarded automatically
- ✅ Level ups when threshold reached
- ✅ Achievements unlocked
- ✅ Leaderboard updated

### Social
- ✅ Friend requests sent/received
- ✅ Challenges created and joined
- ✅ Leaderboard shows rankings

### Subscriptions
- ✅ Subscriptions tracked
- ✅ Renewals calculated correctly
- ✅ Reminders scheduled
- ✅ Statistics accurate

---

## 🐛 Troubleshooting

### Issue: 401 Unauthorized
**Solution**: Make sure you're including the JWT token in the Authorization header.

### Issue: 404 Not Found
**Solution**: Check the endpoint URL and make sure the server is running.

### Issue: 500 Internal Server Error
**Solution**: Check server logs for detailed error messages.

### Issue: No patterns detected
**Solution**: Add more transactions (at least 10-15) spanning multiple months.

### Issue: Export file not found
**Solution**: Check if the `exports` directory exists and has write permissions.

---

## ✅ Success Criteria

All features are working if:
- ✅ All API endpoints return 200/201 status codes
- ✅ Data is saved to database correctly
- ✅ AI analysis produces meaningful results
- ✅ Export files are generated and downloadable
- ✅ Points and achievements are awarded
- ✅ Social features connect users
- ✅ Subscriptions track renewals accurately

---

**Happy Testing!** 🚀

For issues or questions, check the server logs or API documentation at `/api`.
