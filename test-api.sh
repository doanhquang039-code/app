#!/bin/bash

# Expense Tracker API Test Script
# Usage: ./test-api.sh

BASE_URL="http://localhost:3000"
TOKEN=""

echo "🚀 Starting Expense Tracker API Tests..."
echo "=========================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected=$5
    
    echo -e "\n${YELLOW}Testing: $name${NC}"
    
    if [ -z "$data" ]; then
        if [ -z "$TOKEN" ]; then
            response=$(curl -s -X $method "$BASE_URL$endpoint")
        else
            response=$(curl -s -X $method "$BASE_URL$endpoint" -H "Authorization: Bearer $TOKEN")
        fi
    else
        if [ -z "$TOKEN" ]; then
            response=$(curl -s -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data")
        else
            response=$(curl -s -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $TOKEN" \
                -d "$data")
        fi
    fi
    
    echo "Response: $response"
    
    if echo "$response" | grep -q "$expected"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((FAILED++))
    fi
}

# Test 1: Health Check
test_endpoint "Health Check" "GET" "/" "message"

# Test 2: Register User
TIMESTAMP=$(date +%s)
USERNAME="testuser$TIMESTAMP"
test_endpoint "Register User" "POST" "/auth/register" \
    "{\"username\":\"$USERNAME\",\"email\":\"test$TIMESTAMP@example.com\",\"password\":\"password123\",\"fullName\":\"Test User\"}" \
    "success"

# Test 3: Login
echo -e "\n${YELLOW}Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$USERNAME\",\"password\":\"password123\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Login failed - cannot continue tests${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Login successful${NC}"
    echo "Token: ${TOKEN:0:20}..."
    ((PASSED++))
fi

# Test 4: Get Categories
test_endpoint "Get Categories" "GET" "/categories" "id"

# Test 5: Create Transaction
test_endpoint "Create Transaction" "POST" "/transactions" \
    "{\"type\":\"EXPENSE\",\"amount\":50000,\"description\":\"Test transaction\",\"date\":\"2026-04-27\",\"categoryId\":1}" \
    "id"

# Test 6: Get Transactions
test_endpoint "Get Transactions" "GET" "/transactions" "id"

# Test 7: Create Budget
test_endpoint "Create Budget" "POST" "/budgets" \
    "{\"name\":\"Test Budget\",\"amount\":3000000,\"categoryId\":1,\"startDate\":\"2026-04-01\",\"endDate\":\"2026-04-30\"}" \
    "id"

# Test 8: Get Budgets
test_endpoint "Get Budgets" "GET" "/budgets" "id"

# Test 9: Create Savings Goal
test_endpoint "Create Savings Goal" "POST" "/savings-goals" \
    "{\"name\":\"Test Goal\",\"targetAmount\":10000000,\"currentAmount\":2000000,\"deadline\":\"2026-12-31\",\"icon\":\"🎯\"}" \
    "id"

# Test 10: Get Savings Goals
test_endpoint "Get Savings Goals" "GET" "/savings-goals" "id"

# Test 11: Create Subscription
test_endpoint "Create Subscription" "POST" "/subscriptions" \
    "{\"name\":\"Test Subscription\",\"amount\":100000,\"billingCycle\":\"MONTHLY\",\"startDate\":\"2026-04-01\",\"icon\":\"📱\"}" \
    "id"

# Test 12: Get Subscriptions
test_endpoint "Get Subscriptions" "GET" "/subscriptions" "id"

# Test 13: Get Subscription Stats
test_endpoint "Get Subscription Stats" "GET" "/subscriptions/stats" "total"

# Test 14: Dashboard Stats
test_endpoint "Get Dashboard Stats" "GET" "/dashboard/stats" "monthlyIncome"

# Test 15: Financial Insights
test_endpoint "Get Financial Insights" "GET" "/financial-insights/summary" "allTime"

# Test 16: Gamification Stats
test_endpoint "Get Gamification Stats" "GET" "/gamification/stats" "totalPoints"

# Test 17: AI Pattern Analysis
test_endpoint "Analyze Patterns" "POST" "/ai-analysis/patterns/analyze?months=6" "" "success"

# Test 18: Get AI Patterns
test_endpoint "Get AI Patterns" "GET" "/ai-analysis/patterns" "id"

# Test 19: Detect Anomalies
test_endpoint "Detect Anomalies" "POST" "/ai-analysis/anomalies/detect" "" "success"

# Test 20: Get Leaderboard
test_endpoint "Get Leaderboard" "GET" "/gamification/leaderboard" "rank"

# Summary
echo ""
echo "=========================================="
echo -e "${GREEN}Tests Passed: $PASSED${NC}"
echo -e "${RED}Tests Failed: $FAILED${NC}"
echo "Total Tests: $((PASSED + FAILED))"
echo "=========================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
