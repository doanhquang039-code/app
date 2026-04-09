# Smart Notifications API Documentation

## Overview
The Smart Notifications feature provides intelligent, rule-based notifications to keep users informed about their financial activities. It supports multiple notification types, channels, and allows users to create custom rules for personalized notifications.

## Features
- ✅ Smart notification management (in-app, email, SMS, push)
- ✅ Customizable notification rules
- ✅ Multiple notification types (Budget Alerts, Spending Anomalies, Savings Goals, etc.)
- ✅ Unread notification tracking
- ✅ Notification analytics and trends
- ✅ Auto-cleanup of old notifications
- ✅ Rule-based action triggers

## Notification Types
- `BUDGET_ALERT` - Budget threshold exceeded
- `SPENDING_PATTERN` - Unusual spending detected
- `SAVINGS_GOAL` - Savings goal milestone reached
- `BILL_DUE` - Bill payment due
- `CREDIT_CARD` - Credit card alerts
- `RECURRING` - Recurring transaction notification
- `ANOMALY` - Anomalous transaction detected

## Notification Channels
- `IN_APP` - In-app notification (default)
- `EMAIL` - Email notification
- `SMS` - SMS notification
- `PUSH` - Push notification

## Notification Severity Levels
- `INFO` - Information (green)
- `WARNING` - Warning (yellow)
- `DANGER` - Danger/Critical (red)

## API Endpoints

### Get All Notifications
```
GET /smart-notifications?unreadOnly=false
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "userId": 1,
    "title": "High Spending Alert",
    "message": "Your spending this week is 20% higher than average",
    "type": "SPENDING_PATTERN",
    "severity": "WARNING",
    "isRead": false,
    "actionUrl": "/dashboard/insights",
    "createdAt": "2026-04-09T10:00:00Z"
  },
  {
    "id": 2,
    "userId": 1,
    "title": "Budget Alert",
    "message": "Food budget utilization reached 85%",
    "type": "BUDGET_ALERT",
    "severity": "WARNING",
    "isRead": true,
    "createdAt": "2026-04-08T15:30:00Z"
  }
]
```

### Get Unread Count
```
GET /smart-notifications/stats/unread-count
Authorization: Bearer {token}

Response: 200 OK
{
  "unreadCount": 3
}
```

### Get Notification Statistics
```
GET /smart-notifications/stats/notification-stats
Authorization: Bearer {token}

Response: 200 OK
{
  "total": 25,
  "unread": 3,
  "read": 22,
  "byType": {
    "BUDGET_ALERT": 8,
    "SPENDING_PATTERN": 5,
    "BILL_DUE": 4,
    "SAVINGS_GOAL": 3,
    "CREDIT_CARD": 5
  }
}
```

### Get Notification Trends
```
GET /smart-notifications/stats/trends?days=7
Authorization: Bearer {token}

Response: 200 OK
{
  "trends": {
    "2026-04-03": 2,
    "2026-04-04": 5,
    "2026-04-05": 3,
    "2026-04-06": 4,
    "2026-04-07": 3,
    "2026-04-08": 5,
    "2026-04-09": 6
  }
}
```

### Get Notification by Type
```
GET /smart-notifications/type/:type
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "title": "Budget Alert",
    "message": "Food budget reached 85%",
    "type": "BUDGET_ALERT",
    "severity": "WARNING",
    "isRead": false
  }
]
```

### Get Single Notification
```
GET /smart-notifications/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "userId": 1,
  "title": "High Spending Alert",
  "message": "Your spending this week is 20% higher than average",
  "type": "SPENDING_PATTERN",
  "severity": "WARNING",
  "isRead": false,
  "actionUrl": "/dashboard/insights",
  "metadata": {
    "spendingIncrease": "20%",
    "weeklyAverage": 5000,
    "currentSpending": 6000
  },
  "createdAt": "2026-04-09T10:00:00Z"
}
```

### Mark Notification as Read
```
PUT /smart-notifications/:id/read
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "isRead": true,
  "updatedAt": "2026-04-09T11:00:00Z"
}
```

### Mark All Notifications as Read
```
PUT /smart-notifications/all/read
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "All notifications marked as read"
}
```

### Delete Notification
```
DELETE /smart-notifications/:id
Authorization: Bearer {token}

Response: 204 No Content
```

### Delete Old Notifications
```
DELETE /smart-notifications/old/:days
Authorization: Bearer {token}

Response: 204 No Content
```

## Notification Rules API

### Create Notification Rule
```
POST /smart-notifications/rules
Authorization: Bearer {token}
Content-Type: application/json

{
  "ruleName": "High Spending Alert",
  "ruleType": "SPENDING_ANOMALY",
  "condition": "{\"spendingThreshold\": 150, \"percentage\": 20}",
  "action": "{\"notify\": true, \"sendEmail\": true}",
  "isEnabled": true,
  "frequency": "DAILY",
  "notificationChannel": "EMAIL"
}

Response: 201 Created
{
  "id": 1,
  "userId": 1,
  "ruleName": "High Spending Alert",
  "ruleType": "SPENDING_ANOMALY",
  "isEnabled": true,
  "createdAt": "2026-04-09T10:00:00Z"
}
```

### Get All Notification Rules
```
GET /smart-notifications/rules/all
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "ruleName": "High Spending Alert",
    "ruleType": "SPENDING_ANOMALY",
    "frequency": "DAILY",
    "notificationChannel": "EMAIL",
    "isEnabled": true
  },
  {
    "id": 2,
    "ruleName": "Budget Alert 80%",
    "ruleType": "BUDGET_THRESHOLD",
    "frequency": "ONCE",
    "notificationChannel": "IN_APP",
    "isEnabled": true
  }
]
```

### Get Active Rules
```
GET /smart-notifications/rules/active?ruleType=SPENDING_ANOMALY
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "ruleName": "High Spending Alert",
    "ruleType": "SPENDING_ANOMALY",
    "isEnabled": true
  }
]
```

### Get Single Rule
```
GET /smart-notifications/rules/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "userId": 1,
  "ruleName": "High Spending Alert",
  "ruleType": "SPENDING_ANOMALY",
  "condition": "{\"spendingThreshold\": 150, \"percentage\": 20}",
  "action": "{\"notify\": true, \"sendEmail\": true}",
  "isEnabled": true,
  "frequency": "DAILY",
  "notificationChannel": "EMAIL",
  "createdAt": "2026-04-09T10:00:00Z"
}
```

### Update Rule
```
PUT /smart-notifications/rules/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "ruleName": "Updated Rule Name",
  "frequency": "WEEKLY",
  "notificationChannel": "SMS"
}

Response: 200 OK
{
  "id": 1,
  "ruleName": "Updated Rule Name",
  "frequency": "WEEKLY",
  "notificationChannel": "SMS",
  "updatedAt": "2026-04-09T11:00:00Z"
}
```

### Toggle Rule Status
```
PUT /smart-notifications/rules/:id/toggle
Authorization: Bearer {token}
Content-Type: application/json

{
  "isEnabled": false
}

Response: 200 OK
{
  "id": 1,
  "isEnabled": false,
  "updatedAt": "2026-04-09T11:00:00Z"
}
```

### Delete Rule
```
DELETE /smart-notifications/rules/:id
Authorization: Bearer {token}

Response: 204 No Content
```

## Rule Types
- `BUDGET_THRESHOLD` - Alert when budget usage reaches threshold
- `SPENDING_ANOMALY` - Detect unusual spending patterns
- `RECURRING_REMINDER` - Remind about recurring transactions
- `CREDIT_USAGE` - Credit card usage alerts
- `GOAL_PROGRESS` - Savings goal progress updates

## Notification Rule Examples

### Budget Threshold Rule
```json
{
  "ruleName": "Budget Alert 80%",
  "ruleType": "BUDGET_THRESHOLD",
  "condition": "{\"budgetId\": 1, \"thresholdPercentage\": 80}",
  "action": "{\"notify\": true, \"sendEmail\": true}",
  "frequency": "ONCE",
  "notificationChannel": "EMAIL"
}
```

### Spending Anomaly Rule
```json
{
  "ruleName": "Unusual Spending Detection",
  "ruleType": "SPENDING_ANOMALY",
  "condition": "{\"percentageIncrease\": 20, \"minAmount\": 100}",
  "action": "{\"notify\": true, \"requiresApproval\": true}",
  "frequency": "DAILY",
  "notificationChannel": "IN_APP"
}
```

### Credit Card Usage Rule
```json
{
  "ruleName": "High Credit Usage",
  "ruleType": "CREDIT_USAGE",
  "condition": "{\"utilizationThreshold\": 70}",
  "action": "{\"notify\": true, \"sendEmail\": true}",
  "frequency": "WEEKLY",
  "notificationChannel": "EMAIL"
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Notification not found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid rule condition"
}
```

## Best Practices

1. **Rule Management** - Create rules for high-impact scenarios (budget alerts, large transactions)
2. **Channel Selection** - Use EMAIL for important alerts, IN_APP for routine updates
3. **Frequency Control** - Avoid notification fatigue by setting appropriate frequencies
4. **Metadata Usage** - Include useful context in metadata for better user experience
5. **Regular Cleanup** - Delete old notifications periodically to maintain performance
6. **Condition Design** - Keep conditions simple and focused on specific triggers