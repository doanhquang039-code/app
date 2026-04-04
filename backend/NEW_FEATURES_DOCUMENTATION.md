# New Features Documentation

## 🎯 Overview
5 major features have been added to enhance the Expense Tracker application:
1. **Transaction Tags** - Flexible labeling system
2. **Budget Alerts** - Spending threshold notifications
3. **Duplicate Detection** - Fraud/mistake prevention
4. **Bill Reminders** - Payment management
5. **Financial Insights** - Analytics & recommendations

---

## 1️⃣ TRANSACTION TAGS

### Purpose
Add flexible labels and categorization to transactions for better organization and filtering.

### API Endpoints

**Create Tag**
```
POST /tags
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Work Expense",
  "color": "#FF5733",
  "icon": "💼"
}
```

**Get All Tags**
```
GET /tags
Authorization: Bearer {token}
```

**Get Single Tag**
```
GET /tags/:id
Authorization: Bearer {token}
```

**Update Tag**
```
PUT /tags/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Tag",
  "color": "#3498DB"
}
```

**Delete Tag**
```
DELETE /tags/:id
Authorization: Bearer {token}
```

### Database Schema
```sql
Tags Table:
- id (INT, PK)
- userId (INT, FK) - Owner
- name (NVARCHAR 255) - Tag name
- color (NVARCHAR 50) - Hex color
- icon (NVARCHAR 255) - Emoji or icon
- createdAt (DATETIME2)

junction table: transaction_tags
- transactionId (INT, FK)
- tagId (INT, FK)
```

---

## 2️⃣ BUDGET ALERTS

### Purpose
Notify users when spending approaches or exceeds their budget limits.

### Features
- Set threshold percentage (e.g., 80%)
- Track alert status
- Check current budget spending vs limit

### API Endpoints

**Create Budget Alert**
```
POST /budget-alerts
Authorization: Bearer {token}
Content-Type: application/json

{
  "budgetId": 1,
  "thresholdPercentage": 80,
  "enabled": true
}
```

**Get All Budget Alerts**
```
GET /budget-alerts
Authorization: Bearer {token}
```

**Check Budget Status**
```
GET /budget-alerts/budget/:budgetId/status
Authorization: Bearer {token}

Response:
{
  "budgetId": 1,
  "budgetAmount": 1000000,
  "spent": 850000,
  "percentage": 85,
  "thresholdPercentage": 80,
  "isExceeded": true,
  "message": "Đã sử dụng 85% ngân sách"
}
```

**Update Alert**
```
PUT /budget-alerts/:id
Authorization: Bearer {token}

{
  "thresholdPercentage": 75
}
```

**Delete Alert**
```
DELETE /budget-alerts/:id
Authorization: Bearer {token}
```

### Database Schema
```sql
BudgetAlerts Table:
- id (INT, PK)
- userId (INT, FK)
- budgetId (INT, FK)
- thresholdPercentage (DECIMAL 5,2) - 0-100
- enabled (BIT) 
- notified (BIT) - Has user been notified?
- lastNotificationDate (DATETIME2)
- createdAt (DATETIME2)
```

---

## 3️⃣ DUPLICATE DETECTION

### Purpose
Identify potential duplicate transactions to prevent errors and fraud.

### Features
- Analyze transactions by amount, category, time window
- Configurable matching tolerance
- Suspicion scoring (0-100)

### API Endpoints

**Detect All Duplicates**
```
GET /duplicate-detection?timeDiffMinutes=30&amountTolerance=0.1
Authorization: Bearer {token}

Response:
{
  "totalDuplicateGroups": 2,
  "groups": [
    {
      "suspicionLevel": 95,
      "transactions": [
        {
          "id": 1,
          "amount": 50000,
          "category": "Food",
          "date": "2026-04-04T10:30:00Z"
        },
        {
          "id": 2,
          "amount": 50000,
          "category": "Food",
          "date": "2026-04-04T10:32:00Z"
        }
      ]
    }
  ]
}
```

**Find Similar to Transaction**
```
GET /duplicate-detection/transaction/:transactionId
Authorization: Bearer {token}

Response:
{
  "originalTransaction": {...},
  "similarCount": 3,
  "similarTransactions": [...]
}
```

### Query Parameters
- `timeDiffMinutes`: Minutes window to consider as potential duplicate (default: 30)
- `amountTolerance`: Percentage tolerance for amount matching (default: 0)

---

## 4️⃣ BILL REMINDERS

### Purpose
Track and manage recurring bills with payment reminders.

### Features
- Set bill due dates
- Mark bills as paid
- Automatic status updates (upcoming/overdue/paid)
- Get upcoming bills within 30 days
- Configurable reminder days before due date

### API Endpoints

**Create Bill Reminder**
```
POST /bill-reminders
Authorization: Bearer {token}
Content-Type: application/json

{
  "billName": "Internet Bill",
  "description": "Monthly internet subscription",
  "amount": 500000,
  "dueDate": "2026-05-05T00:00:00Z",
  "reminderEnabled": true,
  "remindDaysBefore": 3
}
```

**Get All Bill Reminders**
```
GET /bill-reminders?status=upcoming
Authorization: Bearer {token}
```

**Get Upcoming Bills**
```
GET /bill-reminders/upcoming
Authorization: Bearer {token}

Response:
[
  {
    "id": 1,
    "billName": "Internet",
    "amount": 500000,
    "dueDate": "2026-05-05T00:00:00Z",
    "daysUntilDue": 31,
    "isOverdue": false,
    "status": "upcoming"
  }
]
```

**Mark Bill as Paid**
```
PATCH /bill-reminders/:id/pay
Authorization: Bearer {token}
```

**Update Bill**
```
PUT /bill-reminders/:id
Authorization: Bearer {token}

{
  "amount": 600000,
  "dueDate": "2026-06-05T00:00:00Z"
}
```

**Delete Bill**
```
DELETE /bill-reminders/:id
Authorization: Bearer {token}
```

### Database Schema
```sql
BillReminders Table:
- id (INT, PK)
- userId (INT, FK)
- billName (NVARCHAR 255)
- description (NVARCHAR 1000)
- amount (DECIMAL 18,2)
- dueDate (DATETIME2)
- isPaid (BIT)
- paidDate (DATETIME2)
- status (NVARCHAR 50) - 'upcoming', 'overdue', 'paid'
- reminderEnabled (BIT)
- remindDaysBefore (INT)
- reminderSent (BIT)
- reminderSentDate (DATETIME2)
- createdAt (DATETIME2)
- updatedAt (DATETIME2)
```

---

## 5️⃣ FINANCIAL INSIGHTS

### Purpose
Provide analytics, trends, and smart recommendations for better financial decisions.

### Features
- Spending analysis by category
- Monthly trends (6 months)
- Smart recommendations
- Spending forecasts
- Financial summary

### API Endpoints

**Get Spending by Category**
```
GET /financial-insights/spending-by-category?month=2026-04
Authorization: Bearer {token}

Response:
{
  "period": "2026-04",
  "totalSpent": 5000000,
  "byCategory": [
    {
      "category": "Food",
      "amount": 1500000,
      "percentage": 30
    },
    {
      "category": "Transport",
      "amount": 1000000,
      "percentage": 20
    }
  ]
}
```

**Get Monthly Trend**
```
GET /financial-insights/monthly-trend?months=6
Authorization: Bearer {token}

Response:
{
  "2025-11": { "income": 10000000, "expense": 4000000, "net": 6000000 },
  "2025-12": { "income": 10000000, "expense": 5000000, "net": 5000000 },
  "2026-01": { "income": 10000000, "expense": 4500000, "net": 5500000 },
  ...
}
```

**Get Recommendations**
```
GET /financial-insights/recommendations
Authorization: Bearer {token}

Response:
{
  "period": "2026-04",
  "totalRecommendations": 3,
  "recommendations": [
    {
      "type": "warning",
      "title": "Chi tiêu tập trung quá cao",
      "description": "Food chiếm 45% chi tiêu. Cân nhắc giảm bớt chi tiêu ở mục này.",
      "priority": "high"
    },
    {
      "type": "success",
      "title": "Bạn có dư tiền tiết kiệm",
      "description": "Tháng này bạn tiết kiệm 3.000.000đ. Hãy thêm vào mục tiêu tiết kiệm!",
      "priority": "medium"
    }
  ]
}
```

**Get Spending Forecast**
```
GET /financial-insights/spending-forecast?months=3
Authorization: Bearer {token}

Response:
{
  "basedOnMonths": 3,
  "forecast": [
    {
      "month": "2026-05",
      "projectedIncome": 10000000,
      "projectedExpense": 4600000,
      "projectedNet": 5400000
    },
    ...
  ]
}
```

**Get Financial Summary**
```
GET /financial-insights/summary
Authorization: Bearer {token}

Response:
{
  "allTime": {
    "totalIncome": 120000000,
    "totalExpense": 55000000,
    "net": 65000000
  },
  "lastMonth": {
    "month": "2026-04",
    "income": 10000000,
    "expense": 4500000,
    "net": 5500000,
    "savingsRate": 55
  }
}
```

---

## 📊 Database Setup

### Run All Migrations

```bash
# Run both migration files in order:
# 1. migration_recurring_and_savings.sql
# 2. migration_new_features.sql

sqlcmd -S <server> -U <user> -P <password> -d ExpenseTrackerDB -i migration_recurring_and_savings.sql
sqlcmd -S <server> -U <user> -P <password> -d ExpenseTrackerDB -i migration_new_features.sql
```

---

## 🚀 How to Use

### 1. Start Backend
```bash
cd backend
npm run start:dev
```

### 2. Test with Sample Requests

**Create some tags:**
```bash
curl -X POST http://localhost:3000/tags \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Work","color":"#3498DB"}'
```

**Detect duplicates:**
```bash
curl -X GET 'http://localhost:3000/duplicate-detection?timeDiffMinutes=30' \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get financial summary:**
```bash
curl -X GET http://localhost:3000/financial-insights/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 💡 Best Practices

1. **Tags**: Create tags for easy filtering later (e.g., "Business", "Personal", "Recurring")
2. **Budget Alerts**: Set to 75-80% to catch overspending early
3. **Duplicate Detection**: Run weekly to identify errors
4. **Bill Reminders**: Set `remindDaysBefore` based on your payment processing time
5. **Insights**: Review recommendations monthly to adjust spending habits

---

## 🔄 Automated Tasks

### Cron Jobs
- **Recurring Transactions**: Execute every hour (`:00`)
- **Bill Status Update**: Update statuses every hour
- **Budget Alerts**: Can be triggered on-demand via API

---

## 📈 Key Metrics Tracked

- Monthly income vs expense
- Spending by category percentage
- Savings rate
- Budget adherence
- Bill payment patterns
- Duplicate transaction rate
- Financial health recommendations

---

## 🛠️ Future Enhancements

- [ ] Email notifications for alerts & reminders
- [ ] Export transaction reports
- [ ] Mobile-optimized dashboards  
- [ ] AI-powered anomaly detection
- [ ] Goal-based recommendations
- [ ] Integration with banking APIs
- [ ] Multi-currency support
