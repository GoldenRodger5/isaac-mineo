#!/bin/bash

# Isaac Mineo Portfolio - Dynamic Development Server Startup
# Automatically detects available ports and starts both backend and frontend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Isaac Mineo Portfolio - Dynamic Development Setup${NC}"
echo ""

# Function to find available port
find_available_port() {
    local start_port=$1
    local port=$start_port
    
    while [ $port -le $((start_port + 10)) ]; do
        if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo $port
            return
        fi
        ((port++))
    done
    
    echo $start_port  # fallback
}

# Function to detect running backend
detect_backend_port() {
    for port in 8000 8001 8002 8003; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            # Test if it's actually a FastAPI server
            if curl -s --max-time 2 "http://localhost:$port/health" >/dev/null 2>&1; then
                echo $port
                return
            fi
        fi
    done
    echo ""
}

# Check if backend is already running
EXISTING_BACKEND=$(detect_backend_port)

if [ -n "$EXISTING_BACKEND" ]; then
    echo -e "${GREEN}✅ Backend already running on port $EXISTING_BACKEND${NC}"
    BACKEND_PORT=$EXISTING_BACKEND
else
    echo -e "${YELLOW}🔍 Starting backend...${NC}"
    BACKEND_PORT=$(find_available_port 8000)
    
    # Start backend in background
    export BACKEND_PORT=$BACKEND_PORT
    cd "$(dirname "$0")/.."
    ./scripts/start-backend.sh &
    BACKEND_PID=$!
    
    # Wait for backend to start
    echo -e "${YELLOW}⏳ Waiting for backend to start on port $BACKEND_PORT...${NC}"
    for i in {1..30}; do
        if curl -s --max-time 2 "http://localhost:$BACKEND_PORT/health" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend started successfully on port $BACKEND_PORT${NC}"
            break
        fi
        sleep 1
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ Backend failed to start within 30 seconds${NC}"
            exit 1
        fi
    done
fi

# Find frontend port
FRONTEND_PORT=$(find_available_port 5173)
echo -e "${GREEN}🔍 Using frontend port: $FRONTEND_PORT${NC}"

# Set environment for frontend
export VITE_BACKEND_URL="http://localhost:$BACKEND_PORT"
export VITE_API_BASE_URL="http://localhost:$BACKEND_PORT/api"

# Start frontend
echo -e "${YELLOW}🎨 Starting frontend on port $FRONTEND_PORT...${NC}"
cd frontend

# Create dynamic .env.local
cat > .env.local << EOF
VITE_BACKEND_URL=http://localhost:$BACKEND_PORT
VITE_API_BASE_URL=http://localhost:$BACKEND_PORT/api
EOF

# Start frontend
npm run dev -- --port $FRONTEND_PORT --host 0.0.0.0 &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}🎉 Development servers started successfully!${NC}"
echo -e "${BLUE}📱 Frontend: http://localhost:$FRONTEND_PORT${NC}"
echo -e "${BLUE}🐍 Backend:  http://localhost:$BACKEND_PORT${NC}"
echo -e "${BLUE}📚 API Docs: http://localhost:$BACKEND_PORT/docs${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping servers...${NC}"
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    if [ -n "$BACKEND_PID" ] && [ "$EXISTING_BACKEND" = "" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
