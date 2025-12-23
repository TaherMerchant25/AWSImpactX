# ASPERA Frontend Setup Script
# Run this script from the root of the AWS directory

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  ASPERA Frontend Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
Write-Host "[1/5] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm installation
Write-Host "[2/5] Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is not installed!" -ForegroundColor Red
    exit 1
}

# Navigate to frontend directory
Write-Host "[3/5] Navigating to frontend directory..." -ForegroundColor Yellow
if (Test-Path ".\frontend") {
    Set-Location .\frontend
    Write-Host "✓ Frontend directory found" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend directory not found!" -ForegroundColor Red
    Write-Host "Make sure you're in the AWS root directory" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "[4/5] Installing dependencies (this may take 2-3 minutes)..." -ForegroundColor Yellow
Write-Host "Please wait..." -ForegroundColor Gray

try {
    npm install 2>&1 | Out-Null
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

# Final check
Write-Host "[5/5] Verifying installation..." -ForegroundColor Yellow
if (Test-Path ".\node_modules") {
    Write-Host "✓ node_modules directory created" -ForegroundColor Green
} else {
    Write-Host "✗ Installation verification failed" -ForegroundColor Red
    exit 1
}

# Success message
Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  Setup Complete! 🎉" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start the development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Open your browser to:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. View the dashboard at:" -ForegroundColor White
Write-Host "   http://localhost:3000/dashboard" -ForegroundColor Yellow
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "• Quick Start: QUICKSTART.md" -ForegroundColor White
Write-Host "• Full Setup: SETUP.md" -ForegroundColor White
Write-Host "• Complete Guide: README.md" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
Write-Host ""
