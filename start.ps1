# ASPERA - AI-Powered Due Diligence Platform
# PowerShell Startup Script
# ==============================================

# Stop on errors
$ErrorActionPreference = "Stop"

# Project directories
$ProjectRoot = $PSScriptRoot
$FrontendDir = Join-Path $ProjectRoot "frontend"
$BackendDir = Join-Path $ProjectRoot "src"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Print-Status {
    param([string]$Message)
    Write-ColorOutput "[OK] $Message" "Green"
}

function Print-Error {
    param([string]$Message)
    Write-ColorOutput "[ERROR] $Message" "Red"
}

function Print-Warning {
    param([string]$Message)
    Write-ColorOutput "[WARN] $Message" "Yellow"
}

function Print-Info {
    param([string]$Message)
    Write-ColorOutput "[INFO] $Message" "Cyan"
}

function Test-CommandExists {
    param([string]$Command)
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        return $false
    }
    return $false
}

# Clear screen
Clear-Host

Write-ColorOutput "================================" "Blue"
Write-ColorOutput "   ASPERA Platform Startup" "Blue"
Write-ColorOutput "================================" "Blue"
Write-Host ""

# Check prerequisites
Write-ColorOutput "Checking prerequisites..." "Yellow"
Write-Host ""

# Check Node.js
if (Test-CommandExists "node") {
    $nodeVersion = node --version
    Print-Status "Node.js $nodeVersion"
}
else {
    Print-Error "Node.js is not installed"
    Write-Host "Please install Node.js from https://nodejs.org/"
    exit 1
}

# Check npm
if (Test-CommandExists "npm") {
    $npmVersion = npm --version
    Print-Status "npm $npmVersion"
}
else {
    Print-Error "npm is not installed"
    exit 1
}

# Check Python
if (Test-CommandExists "python") {
    $pythonVersion = python --version
    Print-Status "$pythonVersion"
}
else {
    Print-Error "Python is not installed"
    Write-Host "Please install Python 3.8+ from https://www.python.org/"
    exit 1
}

# Check pip
if (Test-CommandExists "pip") {
    Print-Status "pip installed"
}
else {
    Print-Error "pip is not installed"
    exit 1
}

Write-Host ""
Write-ColorOutput "Setting up Python virtual environment..." "Yellow"

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Print-Info "Creating virtual environment..."
    python -m venv venv
    Print-Status "Virtual environment created"
}
else {
    Print-Status "Virtual environment exists"
}

# Activate virtual environment
Print-Info "Activating virtual environment..."
$venvActivate = Join-Path $ProjectRoot "venv\Scripts\Activate.ps1"
if (Test-Path $venvActivate) {
    & $venvActivate
    Print-Status "Virtual environment activated"
}
else {
    Print-Error "Could not find virtual environment activation script"
    exit 1
}

# Install Python dependencies
if (Test-Path "requirements.txt") {
    Print-Info "Installing Python dependencies (this may take a few minutes)..."
    try {
        python -m pip install --upgrade pip --quiet
        python -m pip install -r requirements.txt --quiet
        Print-Status "Python dependencies installed"
    }
    catch {
        Print-Warning "Some Python packages may have had issues, but continuing..."
    }
}
else {
    Print-Warning "requirements.txt not found, skipping Python dependencies"
}

Write-Host ""
Write-ColorOutput "Setting up frontend..." "Yellow"

# Check if frontend directory exists
if (Test-Path $FrontendDir) {
    Set-Location $FrontendDir
    
    # Install frontend dependencies if needed
    if (-not (Test-Path "node_modules")) {
        Print-Info "Installing frontend dependencies..."
        npm install
        Print-Status "Frontend dependencies installed"
    }
    else {
        Print-Status "Frontend dependencies already installed"
    }
    
    Set-Location $ProjectRoot
}
else {
    Print-Error "Frontend directory not found at $FrontendDir"
    exit 1
}

Write-Host ""
Write-ColorOutput "================================" "Green"
Write-ColorOutput "   Setup Complete!" "Green"
Write-ColorOutput "================================" "Green"
Write-Host ""

# Display startup options
Write-ColorOutput "Choose how to start:" "Blue"
Write-Host ""
Write-Host "1. Frontend only (recommended for development)"
Write-Host "2. View backend information"
Write-Host "3. Exit"
Write-Host ""

$choice = Read-Host "Enter your choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Print-Info "Starting frontend development server..."
        Write-Host ""
        Write-ColorOutput "Frontend will be available at:" "Cyan"
        Write-ColorOutput "  http://localhost:3000" "Yellow"
        Write-Host ""
        Write-ColorOutput "Press Ctrl+C to stop the server" "Gray"
        Write-Host ""
        Set-Location $FrontendDir
        npm run dev
    }
    "2" {
        Write-Host ""
        Write-ColorOutput "================================" "Blue"
        Write-ColorOutput "   Backend Information" "Blue"
        Write-ColorOutput "================================" "Blue"
        Write-Host ""
        Write-Host "The ASPERA backend is designed to run on AWS infrastructure:"
        Write-Host ""
        Write-Host "• Lambda Functions - Serverless compute"
        Write-Host "• Step Functions - Agent orchestration"
        Write-Host "• S3 - Document storage"
        Write-Host "• OpenSearch - Vector store"
        Write-Host "• Bedrock - AI models"
        Write-Host ""
        Write-Host "For local development:"
        Write-Host ""
        Write-ColorOutput "Option 1: Use AWS SAM CLI" "Yellow"
        Write-Host "  sam local start-api"
        Write-Host ""
        Write-ColorOutput "Option 2: Use LocalStack" "Yellow"
        Write-Host "  docker-compose up localstack"
        Write-Host ""
        Write-ColorOutput "Option 3: Deploy to AWS" "Yellow"
        Write-Host "  cd infrastructure"
        Write-Host "  sam deploy --guided"
        Write-Host ""
        Write-Host "Frontend can run independently with mock data."
        Write-Host ""
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
    "3" {
        Write-Host ""
        Print-Info "Exiting..."
        exit 0
    }
    default {
        Print-Error "Invalid choice"
        exit 1
    }
}
