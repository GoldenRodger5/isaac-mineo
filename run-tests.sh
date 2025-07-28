#!/bin/bash

# Comprehensive Test Runner for Enhanced Code Explainer
# Runs all tests across backend and frontend with proper setup

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the project root
if [ ! -f "package.json" ] && [ ! -f "backend/requirements.txt" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "🧪 Starting Comprehensive Test Suite for Enhanced Code Explainer"

# ===== Environment Setup =====
print_status "Setting up test environment..."

# Load environment variables for testing
if [ -f ".env.test" ]; then
    export $(cat .env.test | grep -v '#' | awk '/=/ {print $1}')
    print_success "Loaded test environment variables"
else
    print_warning "No .env.test file found, using development environment"
fi

# Set test-specific environment variables
export TESTING=true
export REDIS_URL=${TEST_REDIS_URL:-"redis://localhost:6379/1"}
export JWT_SECRET_KEY="test_secret_key_for_testing_only"

# ===== Backend Tests =====
print_status "🐍 Running Backend Tests..."

cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
print_status "Installing backend dependencies..."
pip install -r requirements.txt

# Wait for Redis if needed
if command -v redis-cli &> /dev/null; then
    print_status "Checking Redis connection..."
    if ! redis-cli ping &> /dev/null; then
        print_warning "Redis not responding, some tests may fail"
    else
        print_success "Redis connection OK"
    fi
else
    print_warning "Redis CLI not found, skipping Redis tests"
fi

# Run backend tests
print_status "Running backend unit tests..."
if python -m pytest tests/ -v --tb=short --timeout=60; then
    print_success "Backend tests passed"
else
    print_error "Backend tests failed"
    BACKEND_TESTS_FAILED=1
fi

# Run backend linting
print_status "Running backend code quality checks..."
if command -v flake8 &> /dev/null; then
    if flake8 app/ --max-line-length=120 --ignore=E203,W503; then
        print_success "Backend linting passed"
    else
        print_warning "Backend linting issues found"
    fi
else
    print_warning "flake8 not installed, skipping linting"
fi

# Run security checks
if command -v bandit &> /dev/null; then
    print_status "Running security analysis..."
    if bandit -r app/ -f json -o security-report.json; then
        print_success "Security analysis passed"
    else
        print_warning "Security issues found, check security-report.json"
    fi
else
    print_warning "bandit not installed, skipping security analysis"
fi

cd ..

# ===== Frontend Tests =====
print_status "⚛️  Running Frontend Tests..."

cd frontend

# Install dependencies
print_status "Installing frontend dependencies..."
npm install

# Run frontend tests
print_status "Running frontend unit tests..."
if npm run test; then
    print_success "Frontend tests passed"
else
    print_error "Frontend tests failed"
    FRONTEND_TESTS_FAILED=1
fi

# Run frontend linting
print_status "Running frontend code quality checks..."
if command -v eslint &> /dev/null; then
    if npx eslint src/ --ext .js,.jsx --max-warnings 0; then
        print_success "Frontend linting passed"
    else
        print_warning "Frontend linting issues found"
    fi
else
    print_warning "ESLint not configured, skipping linting"
fi

# Run build test
print_status "Testing production build..."
if npm run build; then
    print_success "Production build successful"
    
    # Check bundle size
    BUILD_SIZE=$(du -sh dist/ | cut -f1)
    print_status "Bundle size: $BUILD_SIZE"
else
    print_error "Production build failed"
    BUILD_FAILED=1
fi

# Run accessibility tests (if available)
if command -v axe &> /dev/null; then
    print_status "Running accessibility tests..."
    if npm run test:a11y; then
        print_success "Accessibility tests passed"
    else
        print_warning "Accessibility issues found"
    fi
else
    print_warning "Accessibility testing not configured"
fi

cd ..

# ===== Integration Tests =====
print_status "🔗 Running Integration Tests..."

# Start backend server for integration tests
print_status "Starting backend server for integration tests..."
cd backend
source venv/bin/activate

# Start server in background
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 &
BACKEND_PID=$!

# Wait for server to start
sleep 5

cd ..

# Check if server is responding
if curl -f http://localhost:8001/health &> /dev/null; then
    print_success "Backend server started successfully"
    
    # Run integration tests
    print_status "Running API integration tests..."
    cd frontend
    
    if npm run test:integration; then
        print_success "Integration tests passed"
    else
        print_error "Integration tests failed"
        INTEGRATION_TESTS_FAILED=1
    fi
    
    cd ..
else
    print_error "Backend server failed to start"
    INTEGRATION_TESTS_FAILED=1
fi

# Stop backend server
if [ ! -z "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null || true
    print_status "Stopped backend server"
fi

# ===== Performance Tests =====
print_status "⚡ Running Performance Tests..."

cd frontend

# Bundle analysis
if command -v webpack-bundle-analyzer &> /dev/null; then
    print_status "Analyzing bundle size..."
    npm run analyze 2>/dev/null || print_warning "Bundle analysis not configured"
fi

# Lighthouse CI (if available)
if command -v lhci &> /dev/null; then
    print_status "Running Lighthouse performance tests..."
    if lhci autorun; then
        print_success "Performance tests passed"
    else
        print_warning "Performance issues detected"
    fi
else
    print_warning "Lighthouse CI not configured"
fi

cd ..

# ===== Security Tests =====
print_status "🔒 Running Security Tests..."

# Check for vulnerable dependencies
cd frontend
print_status "Checking frontend dependencies for vulnerabilities..."
if npm audit --audit-level=high; then
    print_success "No high-severity vulnerabilities found in frontend"
else
    print_warning "Security vulnerabilities found in frontend dependencies"
fi

cd ../backend
print_status "Checking backend dependencies for vulnerabilities..."
if pip-audit; then
    print_success "No vulnerabilities found in backend dependencies"
else
    print_warning "Security vulnerabilities found in backend dependencies"
fi

cd ..

# ===== Test Coverage Analysis =====
print_status "📊 Analyzing Test Coverage..."

# Backend coverage
cd backend
source venv/bin/activate
print_status "Generating backend coverage report..."
if python -m pytest tests/ --cov=app --cov-report=html --cov-report=term; then
    print_success "Backend coverage report generated"
    BACKEND_COVERAGE=$(python -m pytest tests/ --cov=app --cov-report=term | grep TOTAL | awk '{print $4}')
    print_status "Backend coverage: $BACKEND_COVERAGE"
else
    print_warning "Backend coverage analysis failed"
fi

cd ../frontend
print_status "Generating frontend coverage report..."
if npm run test:coverage; then
    print_success "Frontend coverage report generated"
else
    print_warning "Frontend coverage analysis failed"
fi

cd ..

# ===== Test Results Summary =====
print_status "📋 Test Results Summary"
print_status "========================"

# Check test results
TESTS_PASSED=true

if [ "$BACKEND_TESTS_FAILED" = "1" ]; then
    print_error "❌ Backend Tests: FAILED"
    TESTS_PASSED=false
else
    print_success "✅ Backend Tests: PASSED"
fi

if [ "$FRONTEND_TESTS_FAILED" = "1" ]; then
    print_error "❌ Frontend Tests: FAILED"
    TESTS_PASSED=false
else
    print_success "✅ Frontend Tests: PASSED"
fi

if [ "$INTEGRATION_TESTS_FAILED" = "1" ]; then
    print_error "❌ Integration Tests: FAILED"
    TESTS_PASSED=false
else
    print_success "✅ Integration Tests: PASSED"
fi

if [ "$BUILD_FAILED" = "1" ]; then
    print_error "❌ Production Build: FAILED"
    TESTS_PASSED=false
else
    print_success "✅ Production Build: PASSED"
fi

# Generate test report
REPORT_FILE="test-report-$(date +%Y%m%d-%H%M%S).txt"
{
    echo "Enhanced Code Explainer Test Report"
    echo "Generated: $(date)"
    echo "=================================="
    echo ""
    echo "Backend Tests: $([ "$BACKEND_TESTS_FAILED" = "1" ] && echo "FAILED" || echo "PASSED")"
    echo "Frontend Tests: $([ "$FRONTEND_TESTS_FAILED" = "1" ] && echo "FAILED" || echo "PASSED")"
    echo "Integration Tests: $([ "$INTEGRATION_TESTS_FAILED" = "1" ] && echo "FAILED" || echo "PASSED")"
    echo "Production Build: $([ "$BUILD_FAILED" = "1" ] && echo "FAILED" || echo "PASSED")"
    echo ""
    echo "Coverage:"
    echo "  Backend: ${BACKEND_COVERAGE:-"N/A"}"
    echo "  Bundle Size: ${BUILD_SIZE:-"N/A"}"
    echo ""
    echo "Environment:"
    echo "  Testing: $TESTING"
    echo "  Redis URL: $REDIS_URL"
    echo "  Node Version: $(node --version)"
    echo "  Python Version: $(python3 --version)"
} > "$REPORT_FILE"

print_status "Test report saved to: $REPORT_FILE"

# ===== Cleanup =====
print_status "🧹 Cleaning up..."

# Remove test artifacts if desired
if [ "$CLEANUP_AFTER_TESTS" = "true" ]; then
    print_status "Removing test artifacts..."
    rm -rf backend/htmlcov/ frontend/coverage/ 2>/dev/null || true
    rm -f backend/.coverage backend/security-report.json 2>/dev/null || true
fi

# Final result
if [ "$TESTS_PASSED" = "true" ]; then
    print_success "🎉 All tests passed! Ready for deployment."
    exit 0
else
    print_error "❌ Some tests failed. Please review the issues above."
    exit 1
fi
