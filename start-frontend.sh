#!/bin/bash

# ASPERA Frontend Only - Quick Start
# ==============================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo -e "${BLUE}Starting ASPERA Frontend...${NC}"
echo ""

cd "$FRONTEND_DIR"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo ""
echo -e "${GREEN}Frontend will be available at:${NC}"
echo "  http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev
