#!/bin/bash

# ASPERA - AI-Powered Due Diligence Platform
# Startup Script
# ==============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project directories
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/src"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}   ASPERA Platform Startup${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"
echo ""

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_status "Node.js $NODE_VERSION"
else
    print_error "Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_status "npm $NPM_VERSION"
else
    print_error "npm is not installed"
    exit 1
fi

# Check Python
if command_exists python3 || command_exists python; then
    if command_exists python3; then
        PYTHON_CMD="python3"
    else
        PYTHON_CMD="python"
    fi
    PYTHON_VERSION=$($PYTHON_CMD --version 2>&1)
    print_status "$PYTHON_VERSION"
else
    print_error "Python is not installed"
    echo "Please install Python 3.8+ from https://www.python.org/"
    exit 1
fi

# Check pip
if command_exists pip3 || command_exists pip; then
    if command_exists pip3; then
        PIP_CMD="pip3"
    else
        PIP_CMD="pip"
    fi
    print_status "pip installed"
else
    print_error "pip is not installed"
    exit 1
fi

echo ""
echo -e "${YELLOW}Setting up Python virtual environment...${NC}"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_info "Creating virtual environment..."
    $PYTHON_CMD -m venv venv
    print_status "Virtual environment created"
else
    print_status "Virtual environment exists"
fi

# Activate virtual environment
print_info "Activating virtual environment..."
source venv/bin/activate || source venv/Scripts/activate
print_status "Virtual environment activated"

# Install Python dependencies
if [ -f "requirements.txt" ]; then
    print_info "Installing Python dependencies..."
    $PYTHON_CMD -m pip install --upgrade pip -q
    $PYTHON_CMD -m pip install -r requirements.txt -q
    print_status "Python dependencies installed"
else
    print_warning "requirements.txt not found, skipping Python dependencies"
fi

echo ""
echo -e "${YELLOW}Setting up frontend...${NC}"

# Check if frontend directory exists
if [ -d "$FRONTEND_DIR" ]; then
    cd "$FRONTEND_DIR"
    
    # Install frontend dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_info "Installing frontend dependencies..."
        npm install
        print_status "Frontend dependencies installed"
    else
        print_status "Frontend dependencies already installed"
    fi
    
    cd "$PROJECT_ROOT"
else
    print_error "Frontend directory not found at $FRONTEND_DIR"
    exit 1
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}   Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Display startup options
echo -e "${BLUE}Choose how to start:${NC}"
echo ""
echo "1. Frontend only (recommended for development)"
echo "2. View backend information"
echo "3. Exit"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        print_info "Starting frontend development server..."
        echo ""
        cd "$FRONTEND_DIR"
        npm run dev
        ;;
    2)
        echo ""
        echo -e "${BLUE}================================${NC}"
        echo -e "${BLUE}   Backend Information${NC}"
        echo -e "${BLUE}================================${NC}"
        echo ""
        echo "The ASPERA backend is designed to run on AWS infrastructure:"
        echo ""
        echo "• Lambda Functions - Serverless compute"
        echo "• Step Functions - Agent orchestration"
        echo "• S3 - Document storage"
        echo "• OpenSearch - Vector store"
        echo "• Bedrock - AI models"
        echo ""
        echo "For local development:"
        echo ""
        echo "Option 1: Use AWS SAM CLI"
        echo "  sam local start-api"
        echo ""
        echo "Option 2: Use LocalStack"
        echo "  docker-compose up localstack"
        echo ""
        echo "Option 3: Deploy to AWS"
        echo "  cd infrastructure && sam deploy --guided"
        echo ""
        echo "Frontend can run independently with mock data."
        echo ""
        ;;
    3)
        echo ""
        print_info "Exiting..."
        exit 0
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac
