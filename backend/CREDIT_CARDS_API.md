# Credit Card Management API Documentation

## Overview
The Credit Card Management feature enables users to manage multiple credit cards, track credit usage, monitor billing cycles, and analyze credit utilization patterns. This feature helps users maintain better control over their credit spending and plan payments effectively.

## Features
- ✅ Manage multiple credit cards (Visa, MasterCard, AmEx, etc.)
- ✅ Track credit card balances and available credit
- ✅ Monitor credit utilization ratio
- ✅ Track billing cycles
- ✅ Calculate credit limit allocation
- ✅ Get upcoming billing reminders
- ✅ Link cards to wallets for payment tracking

## API Endpoints

### Create Credit Card
```
POST /credit-cards
Authorization: Bearer {token}
Content-Type: application/json

{
  "cardholderName": "John Doe",
  "cardNumber": "4532123456789012",
  "cardType": "Visa",
  "issuingBank": "Chase Bank",
  "expiryMonth": 12,
  "expiryYear": 2026,
  "cvv": "123",
  "creditLimit": 10000,
  "currentBalance": 3500,
  "interestRate": 18.5,
  "billingCycleDayOfMonth": 15
}

Response: 201 Created
{
  "id": 1,
  "userId": 1,
  "cardholderName": "John Doe",
  "cardType": "Visa",
  "creditLimit": 10000,
  "currentBalance": 3500,
  "isActive": true,
  "createdAt": "2026-04-09T10:00:00Z"
}
```

### Get All Credit Cards
```
GET /credit-cards
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "cardholderName": "John Doe",
    "cardType": "Visa",
    "issuingBank": "Chase Bank",
    "creditLimit": 10000,
    "currentBalance": 3500,
    "isActive": true,
    "billingCycleDayOfMonth": 15
  },
  {
    "id": 2,
    "cardholderName": "John Doe",
    "cardType": "MasterCard",
    "issuingBank": "Bank of America",
    "creditLimit": 15000,
    "currentBalance": 8200,
    "isActive": true,
    "billingCycleDayOfMonth": 20
  }
]
```

### Get Single Credit Card
```
GET /credit-cards/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "userId": 1,
  "cardholderName": "John Doe",
  "cardNumber": "****9012",
  "cardType": "Visa",
  "issuingBank": "Chase Bank",
  "creditLimit": 10000,
  "currentBalance": 3500,
  "interestRate": 18.5,
  "billingCycleDayOfMonth": 15,
  "isActive": true
}
```

### Get Available Credit
```
GET /credit-cards/:id/available-credit
Authorization: Bearer {token}

Response: 200 OK
{
  "availableCredit": 6500
}
```

### Get Total Credit Limit
```
GET /credit-cards/analytics/total-limit
Authorization: Bearer {token}

Response: 200 OK
{
  "totalLimit": 25000
}
```

### Get Total Credit Usage
```
GET /credit-cards/analytics/total-usage
Authorization: Bearer {token}

Response: 200 OK
{
  "totalUsage": 11700
}
```

### Get Credit Utilization Ratio
```
GET /credit-cards/analytics/utilization-ratio
Authorization: Bearer {token}

Response: 200 OK
{
  "utilizationRatio": "46.80"
}
```

### Get Upcoming Billing Cycles
```
GET /credit-cards/analytics/upcoming-billing
Authorization: Bearer {token}

Response: 200 OK
{
  "upcomingCycles": [
    {
      "id": 1,
      "cardholderName": "John Doe",
      "cardType": "Visa",
      "billingCycleDayOfMonth": 15,
      "currentBalance": 3500
    },
    {
      "id": 2,
      "cardholderName": "John Doe",
      "cardType": "MasterCard",
      "billingCycleDayOfMonth": 20,
      "currentBalance": 8200
    }
  ]
}
```

### Update Credit Card
```
PUT /credit-cards/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "creditLimit": 12000,
  "interestRate": 17.5,
  "billingCycleDayOfMonth": 10
}

Response: 200 OK
{
  "id": 1,
  "creditLimit": 12000,
  "interestRate": 17.5,
  "billingCycleDayOfMonth": 10,
  "updatedAt": "2026-04-09T11:00:00Z"
}
```

### Update Credit Card Balance
```
PUT /credit-cards/:id/balance
Authorization: Bearer {token}
Content-Type: application/json

{
  "balance": 4500
}

Response: 200 OK
{
  "id": 1,
  "currentBalance": 4500,
  "updatedAt": "2026-04-09T11:00:00Z"
}
```

### Get Cards by Type
```
GET /credit-cards/type/:cardType
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "cardholderName": "John Doe",
    "cardType": "Visa",
    "creditLimit": 10000,
    "currentBalance": 3500
  }
]
```

### Delete Credit Card
```
DELETE /credit-cards/:id
Authorization: Bearer {token}

Response: 204 No Content
```

## Card Types
- **Visa** - Visa card
- **MasterCard** - MasterCard
- **AmEx** - American Express
- **Discover** - Discover card
- **DinersClub** - Diners Club

## Analysis Metrics

### Credit Utilization Ratio
Calculated as: (Total Current Balance / Total Credit Limit) × 100
- **Good**: 0-30% usage
- **Fair**: 31-50% usage
- **High**: 51-70% usage
- **Critical**: 71%+ usage

### Available Credit
Calculated as: Credit Limit - Current Balance

### Billing Cycle Tracking
Helps users track when statements are generated and payments are due.

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
  "message": "Credit card not found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid card number or expiry date"
}
```