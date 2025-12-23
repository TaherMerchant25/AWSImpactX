# ASPERA Framework Health Check
# ==============================================

$ErrorActionPreference = "Continue"

Write-Host "================================" -ForegroundColor Blue
Write-Host "   ASPERA Health Check" -ForegroundColor Blue
Write-Host "================================" -ForegroundColor Blue
Write-Host ""

$allGood = $true

# Test Node.js
Write-Host "Testing Node.js..." -NoNewline
try {
    $nodeVersion = node --version 2>&1
    Write-Host " ✓ $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host " ✗ Not found" -ForegroundColor Red
    $allGood = $false
}

# Test npm
Write-Host "Testing npm..." -NoNewline
try {
    $npmVersion = npm --version 2>&1
    Write-Host " ✓ v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host " ✗ Not found" -ForegroundColor Red
    $allGood = $false
}

# Test Python
Write-Host "Testing Python..." -NoNewline
try {
    $pythonVersion = python --version 2>&1
    Write-Host " ✓ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host " ✗ Not found" -ForegroundColor Red
    $allGood = $false
}

# Test pip
Write-Host "Testing pip..." -NoNewline
try {
    $pipVersion = python -m pip --version 2>&1 | Select-Object -First 1
    Write-Host " ✓ Found" -ForegroundColor Green
} catch {
    Write-Host " ✗ Not found" -ForegroundColor Red
    $allGood = $false
}

# Check frontend directory
Write-Host "Testing frontend directory..." -NoNewline
if (Test-Path "frontend") {
    Write-Host " ✓ Exists" -ForegroundColor Green
} else {
    Write-Host " ✗ Not found" -ForegroundColor Red
    $allGood = $false
}

# Check frontend package.json
Write-Host "Testing frontend package.json..." -NoNewline
if (Test-Path "frontend/package.json") {
    Write-Host " ✓ Exists" -ForegroundColor Green
} else {
    Write-Host " ✗ Not found" -ForegroundColor Red
    $allGood = $false
}

# Check requirements.txt
Write-Host "Testing requirements.txt..." -NoNewline
if (Test-Path "requirements.txt") {
    Write-Host " ✓ Exists" -ForegroundColor Green
} else {
    Write-Host " ✗ Not found" -ForegroundColor Red
    $allGood = $false
}

# Check if venv exists
Write-Host "Testing Python venv..." -NoNewline
if (Test-Path "venv") {
    Write-Host " ✓ Exists" -ForegroundColor Green
} else {
    Write-Host " ⚠ Not created yet (will be created on first run)" -ForegroundColor Yellow
}

# Check if node_modules exists
Write-Host "Testing node_modules..." -NoNewline
if (Test-Path "frontend/node_modules") {
    Write-Host " ✓ Exists" -ForegroundColor Green
} else {
    Write-Host " ⚠ Not installed yet (will be installed on first run)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Blue

if ($allGood) {
    Write-Host "   All Systems Ready! ✓" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Blue
    Write-Host ""
    Write-Host "You can now run:" -ForegroundColor Cyan
    Write-Host "  .\start.ps1           # Full startup with menu"
    Write-Host "  .\start-frontend.ps1  # Quick frontend start"
} else {
    Write-Host "   Issues Detected! ✗" -ForegroundColor Red
    Write-Host "================================" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Please install missing prerequisites before running startup scripts." -ForegroundColor Yellow
}

Write-Host ""
