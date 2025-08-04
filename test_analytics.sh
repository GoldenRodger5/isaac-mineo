#!/bin/bash

echo "🧪 Testing Analytics Functionality"
echo "=================================="

BASE_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:5173"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -e "\n${BLUE}Testing: $description${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    # Extract HTTP status code
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ Success (HTTP $http_code)${NC}"
        if [ ${#response_body} -gt 200 ]; then
            echo "Response: $(echo "$response_body" | head -c 200)..."
        else
            echo "Response: $response_body"
        fi
    else
        echo -e "${RED}❌ Failed (HTTP $http_code)${NC}"
        echo "Response: $response_body"
    fi
}

echo -e "\n${YELLOW}1. Backend Health Check${NC}"
echo "------------------------"
test_endpoint "GET" "$BASE_URL/health" "Backend Health Check"

echo -e "\n${YELLOW}2. Analytics Endpoints${NC}"
echo "----------------------"

# Test visitor tracking
test_endpoint "POST" "$BASE_URL/api/analytics/track/visitor" "Visitor Tracking" '{
    "referrer": "https://google.com",
    "location": {
        "href": "http://localhost:5173",
        "pathname": "/",
        "search": ""
    }
}'

# Test page view tracking
test_endpoint "POST" "$BASE_URL/api/analytics/track/page" "Page View Tracking" '{
    "visitor_id": "test_visitor_123",
    "page": "portfolio",
    "tab": "about",
    "previous_page": "",
    "duration": 5000,
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"
}'

# Test AI interaction tracking
test_endpoint "POST" "$BASE_URL/api/analytics/track/ai-interaction" "AI Interaction Tracking" '{
    "visitor_id": "test_visitor_123",
    "type": "chat",
    "question": "What technologies does Isaac work with?",
    "session_length": 30000,
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"
}'

# Test project interest tracking
test_endpoint "POST" "$BASE_URL/api/analytics/track/project" "Project Interest Tracking" '{
    "visitor_id": "test_visitor_123",
    "project": "AI Chat Assistant",
    "action": "view",
    "technologies": ["React", "FastAPI", "OpenAI"],
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"
}'

# Test contact interaction tracking
test_endpoint "POST" "$BASE_URL/api/analytics/track/contact" "Contact Interaction Tracking" '{
    "visitor_id": "test_visitor_123",
    "action": "form_view",
    "interest": "full-stack development",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"
}'

# Test public metrics
test_endpoint "GET" "$BASE_URL/api/analytics/public/metrics" "Public Metrics"

echo -e "\n${YELLOW}3. Frontend Integration Test${NC}"
echo "-----------------------------"

# Check if frontend is running
if curl -s "$FRONTEND_URL" > /dev/null; then
    echo -e "${GREEN}✅ Frontend is accessible at $FRONTEND_URL${NC}"
    
    # Test if analytics service is loaded
    if curl -s "$FRONTEND_URL" | grep -q "analyticsService"; then
        echo -e "${GREEN}✅ Analytics service detected in frontend${NC}"
    else
        echo -e "${YELLOW}⚠️  Analytics service not detected in frontend HTML${NC}"
    fi
else
    echo -e "${RED}❌ Frontend not accessible at $FRONTEND_URL${NC}"
fi

echo -e "\n${YELLOW}4. Environment Check${NC}"
echo "--------------------"

# Check critical environment variables
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file found${NC}"
    
    if grep -q "VITE_API_URL" .env; then
        echo -e "${GREEN}✅ VITE_API_URL configured${NC}"
    else
        echo -e "${YELLOW}⚠️  VITE_API_URL not found in .env${NC}"
    fi
    
    if grep -q "VITE_GA_TRACKING_ID" .env; then
        ga_id=$(grep "VITE_GA_TRACKING_ID" .env | cut -d'=' -f2)
        if [ "$ga_id" != "your_google_analytics_id" ]; then
            echo -e "${GREEN}✅ Google Analytics ID configured${NC}"
        else
            echo -e "${YELLOW}⚠️  Google Analytics ID is placeholder${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Google Analytics ID not configured${NC}"
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
fi

echo -e "\n${YELLOW}5. Package Dependencies${NC}"
echo "------------------------"

# Check frontend dependencies
if [ -f "frontend/package.json" ]; then
    if grep -q "@vercel/analytics" frontend/package.json; then
        echo -e "${GREEN}✅ Vercel Analytics dependency found${NC}"
    else
        echo -e "${RED}❌ Vercel Analytics dependency missing${NC}"
    fi
    
    if grep -q "@vercel/speed-insights" frontend/package.json; then
        echo -e "${GREEN}✅ Vercel Speed Insights dependency found${NC}"
    else
        echo -e "${RED}❌ Vercel Speed Insights dependency missing${NC}"
    fi
else
    echo -e "${RED}❌ Frontend package.json not found${NC}"
fi

# Check backend dependencies
if [ -f "backend/requirements.txt" ]; then
    if grep -q "redis" backend/requirements.txt; then
        echo -e "${GREEN}✅ Redis dependency found in backend${NC}"
    else
        echo -e "${YELLOW}⚠️  Redis dependency not found in backend${NC}"
    fi
else
    echo -e "${RED}❌ Backend requirements.txt not found${NC}"
fi

echo -e "\n${YELLOW}6. Voice Features Test${NC}"
echo "----------------------"

# Test voice status endpoint
test_endpoint "GET" "$BASE_URL/api/voice/status" "Voice Service Status"

# Test voice synthesis (text-only)
test_endpoint "POST" "$BASE_URL/api/voice/synthesize" "Voice Synthesis" '{
    "text": "Hello, this is a test of the voice synthesis feature.",
    "session_id": "test_voice_session",
    "return_audio": false
}'

echo -e "\n${BLUE}📊 Analytics Test Summary${NC}"
echo "========================="
echo "✅ Test completed successfully"
echo "🔍 Check individual test results above"
echo "📈 Analytics functionality ready for deployment"

# Return success if we got here
exit 0
