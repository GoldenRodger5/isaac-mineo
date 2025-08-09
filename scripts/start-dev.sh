#!/bin/bash

# Isaac Mineo Portfolio - Full Stack Starter
# Starts both backend and frontend with automatic port detection

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🚀 Isaac Mineo Portfolio - Full Stack Development Server${NC}"
echo -e "${BLUE}=================================================${NC}"

# Navigate to project root (go up one level since script is in scripts/ directory)
cd "$(dirname "$0")/.."

# Load environment variables from centralized .env
if [ -f ".env" ]; then
    echo -e "${BLUE}🔧 Loading environment variables from .env${NC}"
    export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)
fi

# Kill any existing processes on common ports to avoid conflicts
echo -e "${YELLOW}🧹 Cleaning up any existing processes...${NC}"
for port in 8000 8001 8002 8003 8004 8005 5173 5174 5175 5176 5177; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}   Killing process on port $port...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 0.5
    fi
done

# Function to cleanup background processes
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM EXIT

# Start backend in background
echo -e "${BLUE}🔧 Starting backend server...${NC}"
./scripts/start-backend.sh > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo -e "${YELLOW}⏳ Waiting for backend to initialize...${NC}"
sleep 5

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Backend failed to start. Check backend.log for details.${NC}"
    cat backend.log
    exit 1
fi

# Extract backend port from file (more reliable than log parsing)
if [ -f ".backend_port" ]; then
    BACKEND_PORT=$(cat .backend_port)
else
    # Fallback to log parsing
    BACKEND_PORT=$(grep -o "port [0-9]*" backend.log | grep -o "[0-9]*" | head -1)
fi

if [ -z "$BACKEND_PORT" ]; then
    BACKEND_PORT=8000
fi

echo -e "${GREEN}✅ Backend started on port $BACKEND_PORT${NC}"

# Create temporary environment file for frontend
echo "VITE_BACKEND_URL=http://localhost:$BACKEND_PORT" > .env.backend
echo "VITE_API_BASE_URL=http://localhost:$BACKEND_PORT/api" >> .env.backend

# Update environment variable for frontend
export VITE_BACKEND_URL="http://localhost:$BACKEND_PORT"
export VITE_API_BASE_URL="http://localhost:$BACKEND_PORT/api"

# Start frontend in background
echo -e "${BLUE}🎨 Starting frontend server...${NC}"
VITE_BACKEND_URL="http://localhost:$BACKEND_PORT" VITE_API_BASE_URL="http://localhost:$BACKEND_PORT/api" ./scripts/start-frontend.sh > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
echo -e "${YELLOW}⏳ Waiting for frontend to initialize...${NC}"
sleep 5

# Check if frontend started successfully
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Frontend failed to start. Check frontend.log for details.${NC}"
    cat frontend.log
    exit 1
fi

# Extract frontend port from log
FRONTEND_PORT=$(grep -o "port [0-9]*" frontend.log | grep -o "[0-9]*" | head -1)
if [ -z "$FRONTEND_PORT" ]; then
    FRONTEND_PORT=5173
fi

echo -e "${GREEN}✅ Frontend started on port $FRONTEND_PORT${NC}"
echo ""
echo -e "${PURPLE}🌟 Development servers are running!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📱 Frontend: http://localhost:$FRONTEND_PORT${NC}"
echo -e "${GREEN}🔧 Backend:  http://localhost:$BACKEND_PORT${NC}"
echo -e "${GREEN}📚 API Docs: http://localhost:$BACKEND_PORT/docs${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📋 Logs:${NC}"
echo -e "   Backend: tail -f backend.log"
echo -e "   Frontend: tail -f frontend.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Keep script running and show combined logs
tail -f backend.log frontend.log
