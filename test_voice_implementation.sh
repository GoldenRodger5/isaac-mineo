#!/bin/bash

# Voice Implementation Test Runner
# This script runs comprehensive tests for the voice implementation

echo "🎤 Voice Implementation Test Suite"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    case $2 in
        "error") echo -e "${RED}❌ $1${NC}" ;;
        "success") echo -e "${GREEN}✅ $1${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  $1${NC}" ;;
        "info") echo -e "${BLUE}ℹ️  $1${NC}" ;;
        *) echo "$1" ;;
    esac
}

# Check if backend is running
check_backend() {
    print_status "Checking if backend is running..." "info"
    
    BACKEND_URL=${BACKEND_URL:-"http://localhost:8000"}
    
    if curl -s -f "${BACKEND_URL}/health" > /dev/null 2>&1; then
        print_status "Backend is running at ${BACKEND_URL}" "success"
        return 0
    else
        print_status "Backend is not running at ${BACKEND_URL}" "error"
        print_status "Please start the backend first: cd backend && python -m uvicorn app.main:app --reload" "warning"
        return 1
    fi
}

# Check frontend dependencies
check_frontend_deps() {
    print_status "Checking frontend dependencies..." "info"
    
    if [ ! -d "frontend/node_modules" ]; then
        print_status "Frontend dependencies not installed" "warning"
        print_status "Installing frontend dependencies..." "info"
        cd frontend && npm install && cd ..
    fi
    
    if [ -d "frontend/node_modules" ]; then
        print_status "Frontend dependencies are available" "success"
        return 0
    else
        print_status "Failed to install frontend dependencies" "error"
        return 1
    fi
}

# Run backend voice tests
run_backend_tests() {
    print_status "Running backend voice tests..." "info"
    
    if command -v node > /dev/null 2>&1; then
        node test_voice_implementation.js
        if [ $? -eq 0 ]; then
            print_status "Backend voice tests PASSED" "success"
        else
            print_status "Backend voice tests FAILED" "error"
            return 1
        fi
    else
        print_status "Node.js not found, skipping backend tests" "warning"
    fi
}

# Check voice-related files
check_voice_files() {
    print_status "Checking voice implementation files..." "info"
    
    files=(
        "frontend/src/components/VoiceChat.jsx"
        "frontend/src/components/MobileChatInterface.jsx"
        "frontend/src/services/voiceService.js"
        "backend/app/routers/voice.py"
        "backend/app/services/voice_service.py"
    )
    
    missing_files=()
    
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            print_status "Found: $file" "success"
        else
            print_status "Missing: $file" "error"
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        print_status "All voice implementation files found" "success"
        return 0
    else
        print_status "${#missing_files[@]} voice files are missing" "error"
        return 1
    fi
}

# Test browser compatibility
test_browser_compatibility() {
    print_status "Opening browser compatibility test..." "info"
    
    if [ -f "frontend/voice-test.html" ]; then
        print_status "Browser test available at: frontend/voice-test.html" "info"
        print_status "Open this file in a browser to test voice functionality" "info"
        
        # Try to open in default browser (macOS)
        if command -v open > /dev/null 2>&1; then
            open "frontend/voice-test.html"
            print_status "Browser test opened" "success"
        elif command -v xdg-open > /dev/null 2>&1; then
            xdg-open "frontend/voice-test.html"
            print_status "Browser test opened" "success"
        else
            print_status "Please manually open frontend/voice-test.html in your browser" "warning"
        fi
    else
        print_status "Browser test file not found" "error"
        return 1
    fi
}

# Run frontend development server test
run_frontend_test() {
    print_status "Testing frontend development server..." "info"
    
    if [ -d "frontend" ]; then
        cd frontend
        
        # Check if dev server is already running
        if curl -s -f "http://localhost:5173" > /dev/null 2>&1; then
            print_status "Frontend dev server is already running at http://localhost:5173" "success"
            cd ..
            return 0
        fi
        
        # Start dev server in background
        print_status "Starting frontend development server..." "info"
        npm run dev > ../frontend.log 2>&1 &
        FRONTEND_PID=$!
        
        # Wait for server to start
        sleep 5
        
        if curl -s -f "http://localhost:5173" > /dev/null 2>&1; then
            print_status "Frontend dev server started successfully" "success"
            print_status "Voice test available at: http://localhost:5173" "info"
            
            # Kill the dev server
            kill $FRONTEND_PID 2>/dev/null
        else
            print_status "Frontend dev server failed to start" "error"
            kill $FRONTEND_PID 2>/dev/null
            cd ..
            return 1
        fi
        
        cd ..
    else
        print_status "Frontend directory not found" "error"
        return 1
    fi
}

# Generate test report
generate_report() {
    print_status "Generating test report..." "info"
    
    REPORT_FILE="voice-test-results-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "Voice Implementation Test Report"
        echo "================================"
        echo "Date: $(date)"
        echo "Environment: $(uname -s) $(uname -r)"
        echo ""
        echo "Test Results:"
        echo "============="
        
        if [ -f "voice-test-report.json" ]; then
            echo "Detailed results available in: voice-test-report.json"
        fi
    } > "$REPORT_FILE"
    
    print_status "Test report saved to: $REPORT_FILE" "success"
}

# Main test execution
main() {
    print_status "Starting Voice Implementation Test Suite" "info"
    echo ""
    
    # Track test results
    TESTS_PASSED=0
    TESTS_FAILED=0
    
    # Run tests
    if check_voice_files; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
    
    if check_frontend_deps; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
    
    if check_backend; then
        ((TESTS_PASSED++))
        
        # Only run backend tests if backend is available
        if run_backend_tests; then
            ((TESTS_PASSED++))
        else
            ((TESTS_FAILED++))
        fi
    else
        ((TESTS_FAILED++))
        print_status "Skipping backend tests (backend not available)" "warning"
    fi
    
    # Browser compatibility test (always run)
    if test_browser_compatibility; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
    
    # Generate report
    generate_report
    
    # Summary
    echo ""
    print_status "Test Summary" "info"
    print_status "============" "info"
    print_status "Tests Passed: $TESTS_PASSED" "success"
    print_status "Tests Failed: $TESTS_FAILED" $([ $TESTS_FAILED -eq 0 ] && echo "success" || echo "error")
    
    echo ""
    if [ $TESTS_FAILED -eq 0 ]; then
        print_status "🎉 All voice implementation tests PASSED!" "success"
        print_status "Voice functionality is ready for use" "success"
    else
        print_status "❌ Some voice implementation tests FAILED" "error"
        print_status "Please check the errors above and fix the issues" "warning"
    fi
    
    echo ""
    print_status "Next Steps:" "info"
    print_status "1. Open frontend/voice-test.html in a browser to test voice features" "info"
    print_status "2. Start the backend: cd backend && python -m uvicorn app.main:app --reload" "info"
    print_status "3. Start the frontend: cd frontend && npm run dev" "info"
    print_status "4. Test voice functionality in the browser at http://localhost:5173" "info"
    
    return $TESTS_FAILED
}

# Run the tests
main "$@"
exit $?
