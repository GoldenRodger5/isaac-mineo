#!/bin/bash

# Isaac Mineo Portfolio - Dynamic F# Load base environment variables
if [ -f ".env" ]; then
    echo -e "${YELLOW}🔧 Loading environment variables...${NC}"
    source .env
fi

# Load dynamic backend configuration if available
if [ -f ".env.backend" ]; then
    echo -e "${YELLOW}🔧 Loading dynamic backend configuration...${NC}"
    source .env.backend
fi

# Dynamic backend port detection for local testing (early check)
detect_backend_port() {
    local backend_port=""
    for port in 8000 8001 8002 8003; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            if curl -s --max-time 2 "http://localhost:$port/health" >/dev/null 2>&1; then
                backend_port=$port
                break
            fi
        fi
    done
    if [ -z "$backend_port" ]; then
        backend_port=8000
    fi
    echo $backend_port
}

# Check for backend URL (early configuration)
if [ -z "$VITE_BACKEND_URL" ]; then
    DETECTED_PORT=$(detect_backend_port)
    BACKEND_URL="http://localhost:$DETECTED_PORT"
    echo -e "${GREEN}🔍 Auto-detected backend port: $DETECTED_PORT${NC}"
else
    BACKEND_URL="$VITE_BACKEND_URL"
fi
echo -e "${GREEN}✅ Using backend URL: $BACKEND_URL${NC}"tarter
# Automatically configures backend URL and starts Vite dev server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎨 Isaac Mineo Portfolio - Starting Frontend${NC}"

# Navigate to project root
cd "$(dirname "$0")"

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

# Find available port for frontend (starting from 5173)
FRONTEND_PORT=5173
MAX_PORT=5200
echo -e "${YELLOW}🔍 Finding available frontend port...${NC}"

while ! check_port $FRONTEND_PORT; do
    echo -e "${YELLOW}⚠️  Port $FRONTEND_PORT is in use, trying next port...${NC}"
    FRONTEND_PORT=$((FRONTEND_PORT + 1))
    if [ $FRONTEND_PORT -gt $MAX_PORT ]; then
        echo -e "${RED}❌ No available ports found between 5173-$MAX_PORT${NC}"
        exit 1
    fi
done

# Load environment variables from centralized .env
if [ -f ".env" ]; then
    echo -e "${YELLOW}🔧 Loading environment variables...${NC}"
    source .env
fi

# Dynamic backend port detection for local testing
detect_backend_port() {
    local backend_port=""
    
    # Check if there's a FastAPI process running and get its port
    for port in 8000 8001 8002 8003; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            # Check if it's actually a FastAPI server by testing the /health endpoint
            if curl -s --max-time 2 "http://localhost:$port/health" >/dev/null 2>&1; then
                backend_port=$port
                break
            fi
        fi
    done
    
    # If no backend found, default to 8000
    if [ -z "$backend_port" ]; then
        backend_port=8000
    fi
    
    echo $backend_port
}

# Check for backend URL - use dynamic detection if not explicitly set
if [ -z "$VITE_BACKEND_URL" ]; then
    DETECTED_PORT=$(detect_backend_port)
    BACKEND_URL="http://localhost:$DETECTED_PORT"
    echo -e "${GREEN}🔍 Auto-detected backend port: $DETECTED_PORT${NC}"
else
    BACKEND_URL="$VITE_BACKEND_URL"
fi
echo -e "${GREEN}✅ Using backend URL: $BACKEND_URL${NC}"

# Navigate to frontend directory
cd frontend

# Update frontend environment variables
echo "# Isaac Mineo Portfolio - Frontend Environment Variables" > .env.local
echo "" >> .env.local
echo "# Site password" >> .env.local
echo "VITE_SITE_PASSWORD=$VITE_SITE_PASSWORD" >> .env.local
echo "" >> .env.local
echo "# Backend Configuration (Auto-generated)" >> .env.local
echo "VITE_BACKEND_URL=$BACKEND_URL" >> .env.local
echo "VITE_API_BASE_URL=$BACKEND_URL/api" >> .env.local

echo -e "${GREEN}✅ Using frontend port: $FRONTEND_PORT${NC}"
echo -e "${GREEN}✅ Backend configured: $BACKEND_URL${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules/.package-json.done" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
    touch node_modules/.package-json.done
fi

# Start the frontend server
echo -e "${GREEN}🌟 Starting Vite frontend on port $FRONTEND_PORT...${NC}"
echo -e "${BLUE}Frontend will be available at: http://localhost:$FRONTEND_PORT${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

npm run dev -- --port $FRONTEND_PORT --host 0.0.0.0
