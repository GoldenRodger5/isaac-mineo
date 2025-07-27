#!/bin/bash

# Isaac Mineo Portfolio - Dynamic Backend Starter
# Automatically finds available port and starts FastAPI backend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Isaac Mineo Portfolio - Starting Backend${NC}"

# Navigate to project root
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}📦 Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${YELLOW}🔧 Activating virtual environment...${NC}"
source venv/bin/activate

# Load environment variables from centralized .env
if [ -f ".env" ]; then
    echo -e "${YELLOW}🔧 Loading environment variables...${NC}"
    export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)
fi

# Install/upgrade dependencies
if [ ! -f ".deps_installed" ] || [ "requirements.txt" -nt ".deps_installed" ]; then
    echo -e "${YELLOW}📚 Installing dependencies...${NC}"
    pip install -r requirements.txt
    touch .deps_installed
fi

# Function to check if port is available
check_port() {
    local port=$1
    # Check multiple ways to ensure port is truly available
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1  # Port is in use
    elif netstat -an | grep -q ":$port.*LISTEN" 2>/dev/null; then
        return 1  # Port is in use
    elif nc -z localhost $port 2>/dev/null; then
        return 1  # Port is in use
    else
        return 0  # Port is available
    fi
}

# Find available port starting from 8000, with wider range
BACKEND_PORT=8000
MAX_PORT=8050
echo -e "${YELLOW}🔍 Finding available port...${NC}"

while ! check_port $BACKEND_PORT; do
    echo -e "${YELLOW}⚠️  Port $BACKEND_PORT is in use, trying next port...${NC}"
    BACKEND_PORT=$((BACKEND_PORT + 1))
    if [ $BACKEND_PORT -gt $MAX_PORT ]; then
        echo -e "${RED}❌ No available ports found between 8000-$MAX_PORT${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ Using backend port: $BACKEND_PORT${NC}"

# Update environment variables with the actual port
export VITE_BACKEND_URL="http://localhost:$BACKEND_PORT"
export VITE_API_BASE_URL="http://localhost:$BACKEND_PORT/api"

# Write port to file for other scripts to read
echo $BACKEND_PORT > .backend_port
echo "VITE_BACKEND_URL=http://localhost:$BACKEND_PORT" > .env.backend

# Start the backend server
echo -e "${GREEN}🌟 Starting FastAPI backend on port $BACKEND_PORT...${NC}"
echo -e "${BLUE}Backend will be available at: http://localhost:$BACKEND_PORT${NC}"
echo -e "${BLUE}API docs available at: http://localhost:$BACKEND_PORT/docs${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

uvicorn backend.app.main:app --reload --host 0.0.0.0 --port $BACKEND_PORT
