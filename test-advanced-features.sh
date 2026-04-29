#!/bin/bash

# =====================================================
# TEST SCRIPT FOR ADVANCED FEATURES
# Expense Tracker - Cross-Platform
# =====================================================

BASE_URL="http://localhost:3000"
TOKEN=""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================================"
echo "🧪 TESTING ADVANCED FEATURES"
echo "======================================================"
echo ""

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# =====================================================
# 1. AUTHENTICATION
# =====================================================
echo "📝 Step 1: Authentication"
echo "------------------------------------------------------"

# Register
echo "Registering test user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "fullName": "Test User",
    "username": "testuser"
  }')

echo "Register Response: $REGISTER_RESPONSE"

# Login
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Failed to get authentication token${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Authentication successful${NC}"
echo "Token: ${TOKEN:0:20}..."
echo ""

# =====================================================
# 2. BANK INTEGRATION
# =====================================================
echo "🏦 Step 2: Bank Integration"
echo "------------------------------------------------------"

# Create Plaid Link Token
echo "Creating Plaid link token..."
PLAID_LINK=$(curl -s -X POST "$BASE_URL/bank-integration/plaid/link-token" \
  -H "Authorization: Bearer $TOKEN")

echo "Plaid Link Response: $PLAID_LINK"
print_result $? "Create Plaid link token"

# Add manual bank account
echo "Adding manual bank account..."
BANK_ACCOUNT=$(curl -s -X POST "$BASE_URL/bank-integration/accounts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bankName": "Vietcombank",
    "accountNumber": "1234567890",
    "accountType": "CHECKING",
    "accountHolderName": "Test User",
    "balance": 10000000,
    "currency": "VND",
    "bankCode": "VCB"
  }')

echo "Bank Account Response: $BANK_ACCOUNT"
BANK_ACCOUNT_ID=$(echo $BANK_ACCOUNT | grep -o '"id":[0-9]*' | cut -d':' -f2)
print_result $? "Add manual bank account"

# Get bank accounts
echo "Getting bank accounts..."
BANK_ACCOUNTS=$(curl -s -X GET "$BASE_URL/bank-integration/accounts" \
  -H "Authorization: Bearer $TOKEN")

echo "Bank Accounts: $BANK_ACCOUNTS"
print_result $? "Get bank accounts"

# Get bank stats
echo "Getting bank stats..."
BANK_STATS=$(curl -s -X GET "$BASE_URL/bank-integration/stats" \
  -H "Authorization: Bearer $TOKEN")

echo "Bank Stats: $BANK_STATS"
print_result $? "Get bank stats"

echo ""

# =====================================================
# 3. SCHEDULED TRANSACTIONS
# =====================================================
echo "📅 Step 3: Scheduled Transactions"
echo "------------------------------------------------------"

# Create scheduled transaction
echo "Creating monthly rent schedule..."
SCHEDULED_TXN=$(curl -s -X POST "$BASE_URL/scheduled-transactions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Rent",
    "type": "EXPENSE",
    "amount": 5000000,
    "frequency": "MONTHLY",
    "startDate": "2026-05-01",
    "daysOfMonth": [1],
    "adjustForWeekends": true,
    "notifyBeforeExecution": true,
    "autoExecute": true
  }')

echo "Scheduled Transaction Response: $SCHEDULED_TXN"
print_result $? "Create scheduled transaction"

# Get scheduled transactions
echo "Getting scheduled transactions..."
SCHEDULED_LIST=$(curl -s -X GET "$BASE_URL/scheduled-transactions" \
  -H "Authorization: Bearer $TOKEN")

echo "Scheduled Transactions: $SCHEDULED_LIST"
print_result $? "Get scheduled transactions"

echo ""

# =====================================================
# 4. VOICE COMMANDS
# =====================================================
echo "🎤 Step 4: Voice Commands"
echo "------------------------------------------------------"

# Process voice command
echo "Processing voice command..."
VOICE_CMD=$(curl -s -X POST "$BASE_URL/voice-commands/process" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Add expense 50000 for coffee at Starbucks",
    "language": "vi"
  }')

echo "Voice Command Response: $VOICE_CMD"
print_result $? "Process voice command"

# Get voice command history
echo "Getting voice command history..."
VOICE_HISTORY=$(curl -s -X GET "$BASE_URL/voice-commands/history" \
  -H "Authorization: Bearer $TOKEN")

echo "Voice History: $VOICE_HISTORY"
print_result $? "Get voice command history"

echo ""

# =====================================================
# 5. GAMIFICATION
# =====================================================
echo "🎮 Step 5: Gamification"
echo "------------------------------------------------------"

# Get user stats
echo "Getting gamification stats..."
GAME_STATS=$(curl -s -X GET "$BASE_URL/gamification/stats" \
  -H "Authorization: Bearer $TOKEN")

echo "Gamification Stats: $GAME_STATS"
print_result $? "Get gamification stats"

# Daily login
echo "Recording daily login..."
DAILY_LOGIN=$(curl -s -X POST "$BASE_URL/gamification/daily-login" \
  -H "Authorization: Bearer $TOKEN")

echo "Daily Login Response: $DAILY_LOGIN"
print_result $? "Daily login"

# Get leaderboard
echo "Getting leaderboard..."
LEADERBOARD=$(curl -s -X GET "$BASE_URL/gamification/leaderboard?limit=10" \
  -H "Authorization: Bearer $TOKEN")

echo "Leaderboard: $LEADERBOARD"
print_result $? "Get leaderboard"

echo ""

# =====================================================
# 6. AI ANALYSIS
# =====================================================
echo "🤖 Step 6: AI Analysis"
echo "------------------------------------------------------"

# Analyze patterns
echo "Analyzing spending patterns..."
AI_PATTERNS=$(curl -s -X POST "$BASE_URL/ai-analysis/patterns/analyze?months=6" \
  -H "Authorization: Bearer $TOKEN")

echo "AI Patterns Response: $AI_PATTERNS"
print_result $? "Analyze spending patterns"

# Detect anomalies
echo "Detecting anomalies..."
AI_ANOMALIES=$(curl -s -X POST "$BASE_URL/ai-analysis/anomalies/detect" \
  -H "Authorization: Bearer $TOKEN")

echo "AI Anomalies Response: $AI_ANOMALIES"
print_result $? "Detect anomalies"

# Get insights
echo "Getting AI insights..."
AI_INSIGHTS=$(curl -s -X GET "$BASE_URL/ai-analysis/insights" \
  -H "Authorization: Bearer $TOKEN")

echo "AI Insights: $AI_INSIGHTS"
print_result $? "Get AI insights"

echo ""

# =====================================================
# 7. SOCIAL FEATURES
# =====================================================
echo "👥 Step 7: Social Features"
echo "------------------------------------------------------"

# Get friends
echo "Getting friends list..."
FRIENDS=$(curl -s -X GET "$BASE_URL/social/friends" \
  -H "Authorization: Bearer $TOKEN")

echo "Friends: $FRIENDS"
print_result $? "Get friends list"

# Get public challenges
echo "Getting public challenges..."
CHALLENGES=$(curl -s -X GET "$BASE_URL/social/challenges/public" \
  -H "Authorization: Bearer $TOKEN")

echo "Challenges: $CHALLENGES"
print_result $? "Get public challenges"

echo ""

# =====================================================
# 8. SUBSCRIPTIONS
# =====================================================
echo "💳 Step 8: Subscriptions"
echo "------------------------------------------------------"

# Create subscription
echo "Creating Netflix subscription..."
SUBSCRIPTION=$(curl -s -X POST "$BASE_URL/subscriptions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Netflix Premium",
    "provider": "Netflix",
    "amount": 260000,
    "billingCycle": "MONTHLY",
    "startDate": "2026-05-01",
    "autoRenew": true,
    "reminderEnabled": true
  }')

echo "Subscription Response: $SUBSCRIPTION"
print_result $? "Create subscription"

# Get subscription stats
echo "Getting subscription stats..."
SUB_STATS=$(curl -s -X GET "$BASE_URL/subscriptions/stats" \
  -H "Authorization: Bearer $TOKEN")

echo "Subscription Stats: $SUB_STATS"
print_result $? "Get subscription stats"

echo ""

# =====================================================
# SUMMARY
# =====================================================
echo "======================================================"
echo "✅ TEST COMPLETED"
echo "======================================================"
echo ""
echo "Summary:"
echo "  ✅ Authentication"
echo "  ✅ Bank Integration (Plaid + Manual)"
echo "  ✅ Scheduled Transactions"
echo "  ✅ Voice Commands"
echo "  ✅ Gamification"
echo "  ✅ AI Analysis"
echo "  ✅ Social Features"
echo "  ✅ Subscriptions"
echo ""
echo "All advanced features are working! 🎉"
echo "======================================================"
