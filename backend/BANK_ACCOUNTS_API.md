# Bank Account Integration API Documentation

## Overview
The Bank Account Integration feature allows users to manage and track their bank accounts alongside wallets in the Expense Tracker application. Users can link multiple bank accounts, monitor balances, and maintain a comprehensive view of their financial situation.

## Features
- ✅ Add multiple bank accounts (Savings, Checking, Business)
- ✅ Track account balances
- ✅ Support for multiple account types and international account details (IFSC, SWIFT, Routing Number)
- ✅ Link bank accounts to wallets for automatic sync
- ✅ Calculate total balance across all accounts
- ✅ Account activation/deactivation

## API Endpoints

### Create Bank Account
```
POST /bank-accounts
Authorization: Bearer {token}
Content-Type: application/json

{
  "bankName": "HDFC Bank",
  "accountNumber": "1234567890123",
  "accountHolder": "John Doe",
  "accountType": "Savings",
  "balance": 50000,
  "branchCode": "NYC001",
  "ifscCode": "HDFC0000123",
  "icon": "🏦"
}

Response: 201 Created
{
  "id": 1,
  "userId": 1,
  "bankName": "HDFC Bank",
  "accountNumber": "1234567890123",
  "accountHolder": "John Doe",
  "accountType": "Savings",
  "balance": 50000,
  "isActive": true,
  "createdAt": "2026-04-09T10:00:00Z"
}
```

### Get All Bank Accounts
```
GET /bank-accounts
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "bankName": "HDFC Bank",
    "accountNumber": "****7890",
    "accountHolder": "John Doe",
    "balance": 50000,
    "isActive": true,
    "createdAt": "2026-04-09T10:00:00Z"
  },
  {
    "id": 2,
    "bankName": "ICICI Bank",
    "accountNumber": "****5678",
    "accountHolder": "John Doe",
    "balance": 75000,
    "isActive": true,
    "createdAt": "2026-04-09T10:05:00Z"
  }
]
```

### Get Single Bank Account
```
GET /bank-accounts/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "userId": 1,
  "bankName": "HDFC Bank",
  "accountNumber": "1234567890123",
  "balance": 50000,
  "isActive": true,
  "linkedWalletId": 5
}
```

### Get Total Balance Across All Accounts
```
GET /bank-accounts/total-balance
Authorization: Bearer {token}

Response: 200 OK
{
  "totalBalance": 125000
}
```

### Update Bank Account
```
PUT /bank-accounts/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "accountHolder": "Jane Doe",
  "isActive": true
}

Response: 200 OK
{
  "id": 1,
  "bankName": "HDFC Bank",
  "accountHolder": "Jane Doe",
  "balance": 50000,
  "isActive": true
}
```

### Update Account Balance
```
PUT /bank-accounts/:id/balance
Authorization: Bearer {token}
Content-Type: application/json

{
  "balance": 60000
}

Response: 200 OK
{
  "id": 1,
  "balance": 60000,
  "updatedAt": "2026-04-09T11:00:00Z"
}
```

### Get Accounts by Type
```
GET /bank-accounts/type/:accountType
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 1,
    "bankName": "HDFC Bank",
    "accountType": "Savings",
    "balance": 50000
  }
]
```

### Delete Bank Account
```
DELETE /bank-accounts/:id
Authorization: Bearer {token}

Response: 204 No Content
```

## Account Types
- **Savings** - Personal savings account
- **Checking** - Current/Checking account
- **BusinessAccount** - Business bank account

## Bank Fields Reference
- `bankName` - Name of the bank
- `accountNumber` - Account number (masked in responses)
- `accountHolder` - Account owner name
- `accountType` - Type of account
- `balance` - Current balance
- `branchCode` - Bank branch code
- `ifscCode` - IFSC code (Indian Standard)
- `routingNumber` - Routing number (US Standard)
- `swiftCode` - SWIFT code (International Standard)

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
  "message": "Bank account not found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid account number format"
}
```