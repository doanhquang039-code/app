# =====================================================
# EXPENSE TRACKER - FEATURE TESTING SCRIPT (PowerShell)
# Version: 2.0.0
# Date: April 29, 2026
# =====================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EXPENSE TRACKER - FEATURE TESTING" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$API_URL = "http://localhost:3000"
$TEST_EMAIL = "test@example.com"
$TEST_PASSWORD = "Test123456!"
$TOKEN = ""

# Colors
function Write-Success { param($message) Write-Host "✓ $message" -ForegroundColor Green }
function Write-Error { param($message) Write-Host "✗ $message" -ForegroundColor Red }
function Write-Info { param($message) Write-Host "→ $message" -ForegroundColor Yellow }
function Write-Section { param($message) Write-Host "`n=== $message ===" -ForegroundColor Cyan }

# Test counter
$script:totalTests = 0
$script:passedTests = 0
$script:failedTests = 0

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [hashtable]$Body = @{},
        [hashtable]$Headers = @{}
    )
    
    $script:totalTests++
    Write-Info "Testing: $Description"
    
    try {
        $uri = "$API_URL$Endpoint"
        
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $Headers -ErrorAction Stop
        } else {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Body $jsonBody -ContentType "application/json" -Headers $Headers -ErrorAction Stop
        }
        
        $script:passedTests++
        Write-Success "$Description - PASSED"
        return $response
    }
    catch {
        $script:failedTests++
        Write-Error "$Description - FAILED: $($_.Exception.Message)"
        return $null
    }
}

# =====================================================
# 1. AUTHENTICATION TESTS
# =====================================================
Write-Section "1. Authentication Tests"

# Register
$registerData = @{
    email = $TEST_EMAIL
    password = $TEST_PASSWORD
    name = "Test User"
}
$registerResponse = Test-Endpoint -Method "POST" -Endpoint "/auth/register" -Description "Register new user" -Body $registerData

# Login
$loginData = @{
    email = $TEST_EMAIL
    password = $TEST_PASSWORD
}
$loginResponse = Test-Endpoint -Method "POST" -Endpoint "/auth/login" -Description "Login user" -Body $loginData

if ($loginResponse -and $loginResponse.access_token) {
    $TOKEN = $loginResponse.access_token
    Write-Success "Token obtained: $($TOKEN.Substring(0, 20))..."
}

$authHeaders = @{
    "Authorization" = "Bearer $TOKEN"
}

# Get Profile
Test-Endpoint -Method "GET" -Endpoint "/auth/profile" -Description "Get user profile" -Headers $authHeaders

# =====================================================
# 2. TRANSACTION TESTS
# =====================================================
Write-Section "2. Transaction Tests"

# Create Transaction
$transactionData = @{
    type = "EXPENSE"
    amount = 50000
    description = "Test expense"
    date = (Get-Date).ToString("yyyy-MM-dd")
    categoryId = 1
    walletId = 1
}
$transaction = Test-Endpoint -Method "POST" -Endpoint "/transactions" -Description "Create transaction" -Body $transactionData -Headers $authHeaders

# Get All Transactions
Test-Endpoint -Method "GET" -Endpoint "/transactions" -Description "Get all transactions" -Headers $authHeaders

# Get Transaction by ID
if ($transaction -and $transaction.id) {
    Test-Endpoint -Method "GET" -Endpoint "/transactions/$($transaction.id)" -Description "Get transaction by ID" -Headers $authHeaders
}

# Search Transactions
Test-Endpoint -Method "GET" -Endpoint "/transactions/search?query=test" -Description "Search transactions" -Headers $authHeaders

# Get Transaction Stats
Test-Endpoint -Method "GET" -Endpoint "/transactions/stats" -Description "Get transaction statistics" -Headers $authHeaders

# =====================================================
# 3. BUDGET TESTS
# =====================================================
Write-Section "3. Budget Tests"

# Create Budget
$budgetData = @{
    name = "Monthly Budget"
    amount = 1000000
    period = "MONTHLY"
    categoryId = 1
    startDate = (Get-Date).ToString("yyyy-MM-dd")
}
$budget = Test-Endpoint -Method "POST" -Endpoint "/budgets" -Description "Create budget" -Body $budgetData -Headers $authHeaders

# Get All Budgets
Test-Endpoint -Method "GET" -Endpoint "/budgets" -Description "Get all budgets" -Headers $authHeaders

# Get Budget Stats
Test-Endpoint -Method "GET" -Endpoint "/budgets/stats" -Description "Get budget statistics" -Headers $authHeaders

# Get Budget Alerts
Test-Endpoint -Method "GET" -Endpoint "/budgets/alerts" -Description "Get budget alerts" -Headers $authHeaders

# =====================================================
# 4. BANK INTEGRATION TESTS
# =====================================================
Write-Section "4. Bank Integration Tests"

# Create Link Token (Plaid)
Test-Endpoint -Method "POST" -Endpoint "/bank-integration/plaid/link-token" -Description "Create Plaid link token" -Headers $authHeaders

# Get Bank Accounts
Test-Endpoint -Method "GET" -Endpoint "/bank-integration/accounts" -Description "Get bank accounts" -Headers $authHeaders

# Get Bank Transactions
Test-Endpoint -Method "GET" -Endpoint "/bank-integration/transactions" -Description "Get bank transactions" -Headers $authHeaders

# Get Bank Stats
Test-Endpoint -Method "GET" -Endpoint "/bank-integration/stats" -Description "Get bank integration stats" -Headers $authHeaders

# =====================================================
# 5. SCHEDULED TRANSACTIONS TESTS
# =====================================================
Write-Section "5. Scheduled Transactions Tests"

# Create Scheduled Transaction
$scheduledData = @{
    name = "Monthly Rent"
    type = "EXPENSE"
    amount = 500000
    frequency = "MONTHLY"
    startDate = (Get-Date).ToString("yyyy-MM-dd")
    categoryId = 1
    walletId = 1
}
$scheduled = Test-Endpoint -Method "POST" -Endpoint "/scheduled-transactions" -Description "Create scheduled transaction" -Body $scheduledData -Headers $authHeaders

# Get All Scheduled Transactions
Test-Endpoint -Method "GET" -Endpoint "/scheduled-transactions" -Description "Get all scheduled transactions" -Headers $authHeaders

# Get Upcoming Scheduled Transactions
Test-Endpoint -Method "GET" -Endpoint "/scheduled-transactions/upcoming" -Description "Get upcoming scheduled transactions" -Headers $authHeaders

# =====================================================
# 6. VOICE COMMANDS TESTS
# =====================================================
Write-Section "6. Voice Commands Tests"

# Process Voice Command
$voiceData = @{
    text = "Add expense of 50000 for food"
    language = "en"
}
Test-Endpoint -Method "POST" -Endpoint "/voice-commands/process" -Description "Process voice command" -Body $voiceData -Headers $authHeaders

# Get Voice Command History
Test-Endpoint -Method "GET" -Endpoint "/voice-commands/history" -Description "Get voice command history" -Headers $authHeaders

# Get Supported Intents
Test-Endpoint -Method "GET" -Endpoint "/voice-commands/supported-intents" -Description "Get supported intents" -Headers $authHeaders

# =====================================================
# 7. AI ANALYSIS TESTS
# =====================================================
Write-Section "7. AI Analysis Tests"

# Analyze Spending Patterns
Test-Endpoint -Method "POST" -Endpoint "/ai-analysis/patterns/analyze" -Description "Analyze spending patterns" -Headers $authHeaders

# Get Spending Patterns
Test-Endpoint -Method "GET" -Endpoint "/ai-analysis/patterns" -Description "Get spending patterns" -Headers $authHeaders

# Detect Anomalies
Test-Endpoint -Method "POST" -Endpoint "/ai-analysis/anomalies/detect" -Description "Detect spending anomalies" -Headers $authHeaders

# Get Anomalies
Test-Endpoint -Method "GET" -Endpoint "/ai-analysis/anomalies" -Description "Get detected anomalies" -Headers $authHeaders

# Generate Predictions
Test-Endpoint -Method "POST" -Endpoint "/ai-analysis/predictions/generate" -Description "Generate predictions" -Headers $authHeaders

# Get AI Insights
Test-Endpoint -Method "GET" -Endpoint "/ai-analysis/insights" -Description "Get AI insights" -Headers $authHeaders

# =====================================================
# 8. EXPORT/IMPORT TESTS
# =====================================================
Write-Section "8. Export/Import Tests"

# Export Data
$exportData = @{
    format = "EXCEL"
    startDate = (Get-Date).AddMonths(-1).ToString("yyyy-MM-dd")
    endDate = (Get-Date).ToString("yyyy-MM-dd")
}
Test-Endpoint -Method "POST" -Endpoint "/export-import/export" -Description "Export data to Excel" -Body $exportData -Headers $authHeaders

# Get Export History
Test-Endpoint -Method "GET" -Endpoint "/export-import/history" -Description "Get export history" -Headers $authHeaders

# =====================================================
# 9. GAMIFICATION TESTS
# =====================================================
Write-Section "9. Gamification Tests"

# Get User Stats
Test-Endpoint -Method "GET" -Endpoint "/gamification/stats" -Description "Get gamification stats" -Headers $authHeaders

# Get Leaderboard
Test-Endpoint -Method "GET" -Endpoint "/gamification/leaderboard" -Description "Get leaderboard" -Headers $authHeaders

# Get Achievements
Test-Endpoint -Method "GET" -Endpoint "/gamification/achievements" -Description "Get achievements" -Headers $authHeaders

# Record Daily Login
Test-Endpoint -Method "POST" -Endpoint "/gamification/daily-login" -Description "Record daily login" -Headers $authHeaders

# Check Achievements
Test-Endpoint -Method "POST" -Endpoint "/gamification/check-achievements" -Description "Check achievements" -Headers $authHeaders

# =====================================================
# 10. SOCIAL FEATURES TESTS
# =====================================================
Write-Section "10. Social Features Tests"

# Search Users
Test-Endpoint -Method "GET" -Endpoint "/social/users/search?query=test" -Description "Search users" -Headers $authHeaders

# Get Friends
Test-Endpoint -Method "GET" -Endpoint "/social/friends" -Description "Get friends list" -Headers $authHeaders

# Get Friend Requests
Test-Endpoint -Method "GET" -Endpoint "/social/friends/requests" -Description "Get friend requests" -Headers $authHeaders

# Get Public Challenges
Test-Endpoint -Method "GET" -Endpoint "/social/challenges/public" -Description "Get public challenges" -Headers $authHeaders

# =====================================================
# 11. SUBSCRIPTIONS TESTS
# =====================================================
Write-Section "11. Subscriptions Tests"

# Create Subscription
$subscriptionData = @{
    name = "Netflix"
    amount = 199000
    frequency = "MONTHLY"
    startDate = (Get-Date).ToString("yyyy-MM-dd")
    categoryId = 1
}
$subscription = Test-Endpoint -Method "POST" -Endpoint "/subscriptions" -Description "Create subscription" -Body $subscriptionData -Headers $authHeaders

# Get All Subscriptions
Test-Endpoint -Method "GET" -Endpoint "/subscriptions" -Description "Get all subscriptions" -Headers $authHeaders

# Get Subscription Stats
Test-Endpoint -Method "GET" -Endpoint "/subscriptions/stats" -Description "Get subscription statistics" -Headers $authHeaders

# Get Upcoming Subscriptions
Test-Endpoint -Method "GET" -Endpoint "/subscriptions/upcoming" -Description "Get upcoming subscriptions" -Headers $authHeaders

# =====================================================
# 12. DASHBOARD TESTS
# =====================================================
Write-Section "12. Dashboard Tests"

# Get Dashboard Data
Test-Endpoint -Method "GET" -Endpoint "/dashboard" -Description "Get dashboard data" -Headers $authHeaders

# Get Dashboard Stats
Test-Endpoint -Method "GET" -Endpoint "/dashboard/stats" -Description "Get dashboard statistics" -Headers $authHeaders

# =====================================================
# 13. REPORTS TESTS
# =====================================================
Write-Section "13. Reports Tests"

# Get Income vs Expense Report
Test-Endpoint -Method "GET" -Endpoint "/reports/income-expense" -Description "Get income vs expense report" -Headers $authHeaders

# Get Category Report
Test-Endpoint -Method "GET" -Endpoint "/reports/by-category" -Description "Get category report" -Headers $authHeaders

# Get Trends Report
Test-Endpoint -Method "GET" -Endpoint "/reports/trends" -Description "Get trends report" -Headers $authHeaders

# =====================================================
# TEST SUMMARY
# =====================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Tests:  $script:totalTests" -ForegroundColor White
Write-Host "Passed:       $script:passedTests" -ForegroundColor Green
Write-Host "Failed:       $script:failedTests" -ForegroundColor Red
Write-Host ""

$successRate = [math]::Round(($script:passedTests / $script:totalTests) * 100, 2)
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 50) { "Yellow" } else { "Red" })
Write-Host ""

if ($script:failedTests -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED! 🎉" -ForegroundColor Green
} else {
    Write-Host "⚠️  SOME TESTS FAILED ⚠️" -ForegroundColor Yellow
    Write-Host "Please check the errors above and fix them." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Return exit code
if ($script:failedTests -eq 0) {
    exit 0
} else {
    exit 1
}
