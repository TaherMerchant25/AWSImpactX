# ASPERA Frontend Only - Quick Start
# ==============================================

$ErrorActionPreference = "Stop"

$FrontendDir = Join-Path $PSScriptRoot "frontend"

Write-Host "Starting ASPERA Frontend..." -ForegroundColor Blue
Write-Host ""

Set-Location $FrontendDir

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "Frontend will be available at:" -ForegroundColor Green
Write-Host "  http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

npm run dev
