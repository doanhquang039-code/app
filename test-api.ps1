# Expense Tracker API Test Script (PowerShell)
# Usage: .\test-api.ps1

$BaseUrl = "http://localhost:3000"
$Token = ""
$Passed = 0
$Failed = 0

Write-Host "🚀 Starting Expense Tracker API Tests..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [string]$Data = "",
        [string]$Expected
    )
    
    Write-Host "`nTesting: $Name" -ForegroundColor Yellow
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($script:Token) {
        $headers["Authorization"] = "Bearer $script:Token"
    }
    
    try {
        if ($Data) {
            $response = Invoke-RestMethod -Uri "$BaseUrl$Endpoint" -Method $Method -Headers $headers -Body $Data
        } else {
            $response = Invoke-RestMethod -Uri "$BaseUrl$Endpoint" -Method $Method -Headers $headers
        }
        
        $responseJson = $response | ConvertTo-Json -Depth 10
        Write-Host "Response: $responseJson"
        
        if ($responseJson -match $Expected) {
            Write-Host "✓ PASSED" -ForegroundColor Green
            $script:Passed++
        } else {
            Write-Host "✗ FAILED" -ForegroundColor Red
            $script:Failed++
        }
    } catch {
        Write-Host "✗ FAILED - Error: $_" -ForegroundColor Red
        $script:Failed++
    }
}

# Test 1: Health Check
Test-Endpoint -Name "Health Check" -Method "GET" -Endpoint "/" -Expected "message"

# Test 2: Register User
$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$username = "testuser$timestamp"
$registerData = @{
    username = $username
    email = "test$timestamp@example.com"
    password = "password123"
    fullName = "Test User"
} | ConvertTo-Json

Test-Endpoint -Name "Register User" -Method "POST" -Endpoint "/auth/register" -Data $registerData -Expected "success"

# Test 3: Login
Write-Host "`nLogging in..." -ForegroundColor Yellow
$loginData = @{
    username = $username
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginData
    $script:Token = $loginResponse.access_token
    
    if ($script:Token) {
        Write-Host "✓ Login successful" -ForegroundColor Green
        Write-Host "Token: $($script:Token.Substring(0, [Math]::Min(20, $script:Token.Length)))..."
        $script:Passed++
    } else {
        Write-Host "✗ Login failed - no token received" -ForegroundColor Red
        $script:Failed++
        exit 1
    }
} catch {
    Write-Host "✗ Login failed - $_" -ForegroundColor Red
    $script:Failed++
    exit 1
}

# Test 4: Get Categories
Test-Endpoint -Name "Get Categories" -Method "GET" -Endpoint "/categories" -Expected "id"

# Test 5: Create Transaction
$transactionData = @{
    type = "EXPENSE"
    amount = 50000
    description = "Test transaction"
    date = "2026-04-27"
    categoryId = 1
} | ConvertTo-Json

Test-Endpoint -Name "Create Transaction" -Method "POST" -Endpoint "/transactions" -Data $transactionData -Expected "id"

# Test 6: Get Transactions
Test-Endpoint -Name "Get Transactions" -Method "GET" -Endpoint "/transactions" -Expected "id"

# Test 7: Create Budget
$budgetData = @{
    name = "Test Budget"
    amount = 3000000
    categoryId = 1
    startDate = "2026-04-01"
    endDate = "2026-04-30"
} | ConvertTo-Json

Test-Endpoint -Name "Create Budget" -Method "POST" -Endpoint "/budgets" -Data $budgetData -Expected "id"

# Test 8: Get Budgets
Test-Endpoint -Name "Get Budgets" -Method "GET" -Endpoint "/budgets" -Expected "id"

# Test 9: Create Savings Goal
$goalData = @{
    name = "Test Goal"
    targetAmount = 10000000
    currentAmount = 2000000
    deadline = "2026-12-31"
    icon = "🎯"
} | ConvertTo-Json

Test-Endpoint -Name "Create Savings Goal" -Method "POST" -Endpoint "/savings-goals" -Data $goalData -Expected "id"

# Test 10: Get Savings Goals
Test-Endpoint -Name "Get Savings Goals" -Method "GET" -Endpoint "/savings-goals" -Expected "id"

# Test 11: Create Subscription
$subscriptionData = @{
    name = "Test Subscription"
    amount = 100000
    billingCycle = "MONTHLY"
    startDate = "2026-04-01"
    icon = "📱"
} | ConvertTo-Json

Test-Endpoint -Name "Create Subscription" -Method "POST" -Endpoint "/subscriptions" -Data $subscriptionData -Expected "id"

# Test 12: Get Subscriptions
Test-Endpoint -Name "Get Subscriptions" -Method "GET" -Endpoint "/subscriptions" -Expected "id"

# Test 13: Get Subscription Stats
Test-Endpoint -Name "Get Subscription Stats" -Method "GET" -Endpoint "/subscriptions/stats" -Expected "total"

# Test 14: Dashboard Stats
Test-Endpoint -Name "Get Dashboard Stats" -Method "GET" -Endpoint "/dashboard/stats" -Expected "monthlyIncome"

# Test 15: Financial Insights
Test-Endpoint -Name "Get Financial Insights" -Method "GET" -Endpoint "/financial-insights/summary" -Expected "allTime"

# Test 16: Gamification Stats
Test-Endpoint -Name "Get Gamification Stats" -Method "GET" -Endpoint "/gamification/stats" -Expected "totalPoints"

# Test 17: AI Pattern Analysis
Test-Endpoint -Name "Analyze Patterns" -Method "POST" -Endpoint "/ai-analysis/patterns/analyze?months=6" -Expected "success"

# Test 18: Get AI Patterns
Test-Endpoint -Name "Get AI Patterns" -Method "GET" -Endpoint "/ai-analysis/patterns" -Expected "id"

# Test 19: Detect Anomalies
Test-Endpoint -Name "Detect Anomalies" -Method "POST" -Endpoint "/ai-analysis/anomalies/detect" -Expected "success"

# Test 20: Get Leaderboard
Test-Endpoint -Name "Get Leaderboard" -Method "GET" -Endpoint "/gamification/leaderboard" -Expected "rank"

# Summary
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Tests Passed: $Passed" -ForegroundColor Green
Write-Host "Tests Failed: $Failed" -ForegroundColor Red
Write-Host "Total Tests: $($Passed + $Failed)"
Write-Host "==========================================" -ForegroundColor Cyan

if ($Failed -eq 0) {
    Write-Host "🎉 All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Some tests failed" -ForegroundColor Red
    exit 1
}
