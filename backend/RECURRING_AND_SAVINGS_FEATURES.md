# Recurring Transactions & Savings Goals - Feature Documentation

## Overview
Two new features have been added to the Expense Tracker application:

### 1. **Recurring Transactions** (Giao dịch định kỳ)
Automatically execute transactions at specified intervals (daily, weekly, monthly, etc.)

### 2. **Savings Goals** (Mục tiêu tiết kiệm)
Track progress towards financial goals with target amounts and dates

---

## 🔄 Recurring Transactions

### Features
- Create recurring transactions with flexible frequency (daily, weekly, biweekly, monthly, quarterly, yearly)
- Automatic execution via scheduled cron job (hourly)
- Automatically creates corresponding transaction records
- Updates wallet balance automatically
- Support for end dates - transactions stop after specified date
- Toggle active/inactive status
- Track last execution and next execution dates

### API Endpoints

**Create Recurring Transaction**
```
POST /recurring-transactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "walletId": 1,
  "categoryId": 5,
  "amount": 50000,
  "type": "expense",
  "note": "Monthly subscription",
  "frequency": "monthly",
  "frequencyDay": "15",
  "startDate": "2026-04-04T00:00:00Z",
  "endDate": "2027-04-04T00:00:00Z"
}
```

**Get All Recurring Transactions**
```
GET /recurring-transactions?frequency=monthly&isActive=true
Authorization: Bearer {token}
```

**Get Single Recurring Transaction**
```
GET /recurring-transactions/:id
Authorization: Bearer {token}
```

**Update Recurring Transaction**
```
PUT /recurring-transactions/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 60000,
  "frequency": "biweekly"
}
```

**Toggle Active Status**
```
PATCH /recurring-transactions/:id/toggle
Authorization: Bearer {token}
Content-Type: application/json

{
  "isActive": false
}
```

**Delete Recurring Transaction**
```
DELETE /recurring-transactions/:id
Authorization: Bearer {token}
```

### Frequency Options
- `daily` - Every day
- `weekly` - Every 7 days
- `biweekly` - Every 14 days
- `monthly` - On specified day of month (1-31)
- `quarterly` - Every 3 months
- `yearly` - Every 12 months

### Automatic Execution
The system runs a cron job every hour to:
1. Find all active recurring transactions with `nextExecutionDate <= now`
2. Create a new transaction record
3. Update wallet balance
4. Calculate and update `nextExecutionDate`
5. Check and update `isActive` status if end date has passed

---

## 🎯 Savings Goals

### Features
- Create savings goals with target amounts
- Track current savings progress
- Automatic progress percentage calculation
- Add/withdraw money from goals
- Update goal status (active, completed, paused, cancelled)
- Track days remaining until target date
- Get detailed progress information

### API Endpoints

**Create Savings Goal**
```
POST /savings-goals
Authorization: Bearer {token}
Content-Type: application/json

{
  "walletId": 1,
  "name": "Vacation Fund",
  "description": "Summer vacation to Europe",
  "targetAmount": 5000000,
  "icon": "✈️",
  "startDate": "2026-04-04T00:00:00Z",
  "targetDate": "2026-12-31T00:00:00Z"
}
```

**Get All Savings Goals**
```
GET /savings-goals?status=active&walletId=1
Authorization: Bearer {token}
```

**Get Single Savings Goal**
```
GET /savings-goals/:id
Authorization: Bearer {token}
```

**Get Detailed Progress**
```
GET /savings-goals/:id/progress
Authorization: Bearer {token}

Response:
{
  "goalId": 1,
  "goalName": "Vacation Fund",
  "currentAmount": 1500000,
  "targetAmount": 5000000,
  "remainingAmount": 3500000,
  "progressPercentage": 30,
  "status": "active",
  "startDate": "2026-04-04T00:00:00Z",
  "targetDate": "2026-12-31T00:00:00Z",
  "daysRemaining": 271
}
```

**Add to Goal**
```
POST /savings-goals/:id/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 500000
}
```

**Withdraw from Goal**
```
POST /savings-goals/:id/withdraw
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 200000
}
```

**Update Goal Status**
```
PATCH /savings-goals/:id/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "paused"
}
```

**Update Savings Goal**
```
PUT /savings-goals/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Europe Vacation",
  "targetAmount": 7000000
}
```

**Delete Savings Goal**
```
DELETE /savings-goals/:id
Authorization: Bearer {token}
```

### Goal Status Options
- `active` - Currently tracking
- `completed` - Target amount reached
- `paused` - Temporarily paused
- `cancelled` - Cancelled

---

## 📊 Database Schema

### RecurringTransactions Table
```sql
- id (INT, PK, Identity)
- userId (INT, FK)
- walletId (INT, FK)
- categoryId (INT, FK)
- amount (DECIMAL 18,2)
- type (NVARCHAR 50) - 'income' or 'expense'
- note (NVARCHAR 500)
- frequency (NVARCHAR 50) - recurring pattern
- frequencyDay (NVARCHAR 50) - for monthly: day of month, for weekly: days
- startDate (DATETIME2)
- endDate (DATETIME2, nullable)
- isActive (BIT) - default 1
- lastExecutedDate (DATETIME2, nullable)
- nextExecutionDate (DATETIME2())
- createdAt (DATETIME2)
- updatedAt (DATETIME2)
```

### SavingsGoals Table
```sql
- id (INT, PK, Identity)
- userId (INT, FK)
- walletId (INT, FK)
- name (NVARCHAR 255)
- description (NVARCHAR 1000)
- targetAmount (DECIMAL 18,2)
- currentAmount (DECIMAL 18,2) - default 0
- icon (NVARCHAR 255)
- startDate (DATETIME2)
- targetDate (DATETIME2, nullable)
- status (NVARCHAR 50) - default 'active'
- progressPercentage (DECIMAL 5,2)
- createdAt (DATETIME2)
- updatedAt (DATETIME2)
```

---

## 🚀 Setup Instructions

### 1. Run Database Migration
Execute `migration_recurring_and_savings.sql` on your MSSQL database:
```bash
# Using sqlcmd
sqlcmd -S <server> -U <user> -P <password> -d ExpenseTrackerDB -i migration_recurring_and_savings.sql

# Or import via SQL Server Management Studio
```

### 2. Update app.module.ts
Already done - the RecurringTransactionsModule and SavingsGoalsModule are imported.

### 3. Start the Application
```bash
npm run start:dev
```

### 4. Test the Endpoints
Use Postman or your API client to test the new endpoints.

---

## 📝 Usage Examples

### Example 1: Setup Monthly Bills
```javascript
// Create recurring expense for monthly internet bill
POST /recurring-transactions
{
  "walletId": 1,
  "categoryId": 3,
  "amount": 500000,
  "type": "expense",
  "note": "Internet bill",
  "frequency": "monthly",
  "frequencyDay": "5",
  "startDate": "2026-04-05"
}
```

### Example 2: Track Vacation Savings
```javascript
// Create savings goal
POST /savings-goals
{
  "walletId": 1,
  "name": "Summer Vacation",
  "targetAmount": 10000000,
  "startDate": "2026-04-04",
  "targetDate": "2026-08-31"
}

// Add money to goal
POST /savings-goals/1/add
{
  "amount": 2000000
}

// Check progress
GET /savings-goals/1/progress
```

---

## 🔧 Development Notes

- **Cron Job**: RecurringTransactions execute every hour. Can be adjusted in `recurring-transactions.service.ts`
- **Automatic Calculations**: Savings goal progress is calculated on-the-fly for real-time accuracy
- **Error Handling**: All endpoints include proper validation and error handling
- **Auth Guard**: All endpoints require JWT authentication

---

## 📋 TODO/Future Enhancements
- [ ] Add email reminders for upcoming recurring transactions
- [ ] Add bulk create recurring transactions
- [ ] Add transaction history for recurring transactions
- [ ] Add savings goal milestones
- [ ] Add mobile app UI for both features
- [ ] Add financial insights based on recurring patterns
