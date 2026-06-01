$ErrorActionPreference = 'SilentlyContinue'

Write-Host "Cleaning up existing processes on ports 3000 and 3001..." -ForegroundColor Cyan

# Kill port 3000 (backend)
$proc3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($proc3000) {
    $pid3000 = $proc3000.OwningProcess | Select-Object -Unique
    foreach ($p in $pid3000) {
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        Write-Host "Killed process $p using port 3000" -ForegroundColor Yellow
    }
}

# Kill port 3001 (frontend)
$proc3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($proc3001) {
    $pid3001 = $proc3001.OwningProcess | Select-Object -Unique
    foreach ($p in $pid3001) {
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        Write-Host "Killed process $p using port 3001" -ForegroundColor Yellow
    }
}

Write-Host "Setting up Android Emulator OAuth port forwarding..." -ForegroundColor Cyan
# Run setup-mobile-oauth.ps1
try {
    $scriptPath = Join-Path $PSScriptRoot 'setup-mobile-oauth.ps1'
    if (Test-Path $scriptPath) {
        & $scriptPath
    } else {
        Write-Host "setup-mobile-oauth.ps1 not found." -ForegroundColor Red
    }
} catch {
    Write-Host "Android Emulator not active or ADB not found (skipping port forwarding)" -ForegroundColor Gray
}

Write-Host "Starting Backend and Frontend servers..." -ForegroundColor Green
$root = Split-Path -Parent $PSScriptRoot

# Start backend & frontend in new independent windows to keep output clean and separate
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; Write-Host 'Starting NestJS Backend Server...'; npm run start:dev" -WindowStyle Normal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; Write-Host 'Starting Vite Frontend Server...'; npm run dev" -WindowStyle Normal

Write-Host "Both servers started in new PowerShell windows! You can close this window." -ForegroundColor Green
