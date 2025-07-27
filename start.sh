#!/bin/bash

# Isaac Mineo Portfolio - Smart Start Script
# Starts frontend and backend (if available)

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}🚀 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Isaac Mineo Portfolio - Starting Development Environment"
echo ""

# Start Backend (if configured)
start_backend() {
    print_status "Checking backend configuration..."
    
    if [ -f "backend/requirements.txt" ] || [ -f "backend/package.json" ]; then
        print_status "Backend configuration found - starting backend..."
        
        cd backend
        
        # Python backend
        if [ -f "requirements.txt" ]; then
            print_status "Starting Python/FastAPI backend..."
            
            # Check if virtual environment exists
            if [ ! -d "venv" ]; then
                print_status "Creating Python virtual environment..."
                python3 -m venv venv
            fi
            
            # Activate virtual environment
            source venv/bin/activate
            
            # Install dependencies if needed
            if [ ! -f ".deps_installed" ]; then
                print_status "Installing Python dependencies..."
                pip install -r requirements.txt
                touch .deps_installed
            fi
            
            # Start the server in background
            print_success "Starting backend on http://localhost:8000"
            uvicorn app.main:app --reload --port 8000 &
            BACKEND_PID=$!
            echo $BACKEND_PID > ../backend.pid
            
        # Node.js backend
        elif [ -f "package.json" ]; then
            print_status "Starting Node.js backend..."
            
            # Install dependencies if needed
            if [ ! -d "node_modules" ]; then
                print_status "Installing Node.js dependencies..."
                npm install
            fi
            
            # Start the server in background
            print_success "Starting backend on http://localhost:8000"
            npm run dev &
            BACKEND_PID=$!
            echo $BACKEND_PID > ../backend.pid
        fi
        
        cd ..
        
    else
        print_warning "Backend not configured yet - skipping backend startup"
        print_status "To add backend later:"
        echo "  • For Python/FastAPI: Add requirements.txt to backend/"
        echo "  • For Node.js: Add package.json to backend/"
        echo ""
    fi
}

# Start Frontend
start_frontend() {
    print_status "Starting frontend..."
    
    cd frontend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
    fi
    
    print_success "Starting frontend on http://localhost:5174"
    
    # Start frontend (this will block)
    npm run dev
}

# Cleanup function
cleanup() {
    print_status "Shutting down services..."
    
    # Kill backend if it was started
    if [ -f "backend.pid" ]; then
        BACKEND_PID=$(cat backend.pid)
        if kill -0 $BACKEND_PID 2>/dev/null; then
            print_status "Stopping backend (PID: $BACKEND_PID)..."
            kill $BACKEND_PID
        fi
        rm -f backend.pid
    fi
    
    print_success "All services stopped. Goodbye! 👋"
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Main execution
echo "🌟 Development Environment Starting..."
echo "📂 Project: Isaac Mineo Portfolio"
echo "🌍 Frontend: http://localhost:5174"
echo "🔧 Backend: http://localhost:8000 (if configured)"
echo ""

# Start backend in background (if available)
start_backend

# Give backend a moment to start
if [ -f "backend.pid" ]; then
    sleep 2
    print_success "Backend started successfully!"
    echo ""
fi

# Start frontend (this will block and keep script running)
print_status "Starting frontend (this will keep running - press Ctrl+C to stop all services)"
echo ""
start_frontend
