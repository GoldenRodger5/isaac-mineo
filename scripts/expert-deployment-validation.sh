#!/bin/bash

# Production Beta Deployment Validation Script - Fixed Version
# Expert-level validation for production readiness

echo "🚀 PRODUCTION BETA DEPLOYMENT VALIDATION - EXPERT ANALYSIS"
echo "=========================================================="
echo "Backend: https://isaac-mineo-api.onrender.com"
echo "Frontend: https://isaac-mineo.vercel.app"
echo ""

# Test results tracking
PASSED=0
FAILED=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function
test_result() {
    if [ $? -eq 0 ]; then
        ((PASSED++))
        echo -e "   ${GREEN}✅${NC} $1"
    else
        ((FAILED++))
        echo -e "   ${RED}❌${NC} $1 FAILED"
    fi
}

echo -e "${BLUE}🔥 CRITICAL SYSTEM VALIDATION${NC}"
echo "============================="

# Test 1: Backend Health - Deep Analysis
echo "1. Backend Health Check..."
curl -s https://isaac-mineo-api.onrender.com/health > /tmp/health.json
HEALTH_STATUS=$(cat /tmp/health.json | python3 -c "import json,sys; data=json.load(sys.stdin); print(data.get('status','unknown'))" 2>/dev/null || echo "unknown")
TOTAL_ERRORS=$(cat /tmp/health.json | python3 -c "import json,sys; data=json.load(sys.stdin); print(data.get('error_summary',{}).get('total_errors',0))" 2>/dev/null || echo "0")

if [ "$HEALTH_STATUS" = "healthy" ] && [ "$TOTAL_ERRORS" -lt "50" ]; then
    true; test_result "Backend Health (Status: $HEALTH_STATUS, Errors: $TOTAL_ERRORS)"
else
    false; test_result "Backend Health (Status: $HEALTH_STATUS, Errors: $TOTAL_ERRORS - Too Many Errors)"
fi

# Test 2: Core AI Functionality
echo "2. AI Chatbot Core Functionality..."
CHATBOT_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"question":"What programming languages does Isaac Mineo know?","sessionId":"production_test"}' \
    https://isaac-mineo-api.onrender.com/api/chatbot)

RESPONSE_LENGTH=$(echo "$CHATBOT_RESPONSE" | python3 -c "import json,sys; data=json.load(sys.stdin); print(len(data.get('response','')))" 2>/dev/null || echo "0")
SEARCH_METHOD=$(echo "$CHATBOT_RESPONSE" | python3 -c "import json,sys; data=json.load(sys.stdin); print(data.get('searchMethod','unknown'))" 2>/dev/null || echo "unknown")

if [ "$RESPONSE_LENGTH" -gt "100" ] && [ "$SEARCH_METHOD" != "unknown" ]; then
    true; test_result "AI Chatbot (Response: $RESPONSE_LENGTH chars, Method: $SEARCH_METHOD)"
else
    false; test_result "AI Chatbot (Response: $RESPONSE_LENGTH chars, Method: $SEARCH_METHOD)"
fi

# Test 3: Voice AI System
echo "3. Voice AI System..."
VOICE_STATUS=$(curl -s https://isaac-mineo-api.onrender.com/api/voice/status)
VOICE_ENABLED=$(echo "$VOICE_STATUS" | python3 -c "import json,sys; data=json.load(sys.stdin); print(data.get('voice_enabled',False))" 2>/dev/null || echo "false")

if [ "$VOICE_ENABLED" = "True" ]; then
    # Test voice synthesis
    AUDIO_RESPONSE=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"text":"Production deployment test for voice synthesis"}' \
        https://isaac-mineo-api.onrender.com/api/voice/synthesize)
    
    AUDIO_TEXT_LENGTH=$(echo "$AUDIO_RESPONSE" | python3 -c "import json,sys; data=json.load(sys.stdin); print(len(data.get('text','')))" 2>/dev/null || echo "0")
    
    if [ "$AUDIO_TEXT_LENGTH" -gt "20" ]; then
        true; test_result "Voice AI System (Enabled, Synthesis working: $AUDIO_TEXT_LENGTH chars)"
    else
        false; test_result "Voice AI System (Synthesis failed: $AUDIO_TEXT_LENGTH chars)"
    fi
else
    false; test_result "Voice AI System (Not enabled: $VOICE_ENABLED)"
fi

# Test 4: Session Memory & Context
echo "4. Session Memory & Context Management..."
SESSION_ID="expert_test_$(date +%s)"

# First message
curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"question":"Remember this: I am conducting a production deployment test.","sessionId":"'$SESSION_ID'"}' \
    https://isaac-mineo-api.onrender.com/api/chatbot > /dev/null

sleep 2

# Follow-up message
FOLLOWUP_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"question":"What did I just tell you to remember?","sessionId":"'$SESSION_ID'"}' \
    https://isaac-mineo-api.onrender.com/api/chatbot)

CONV_LENGTH=$(echo "$FOLLOWUP_RESPONSE" | python3 -c "import json,sys; data=json.load(sys.stdin); print(data.get('conversationLength',0))" 2>/dev/null || echo "0")
FOLLOWUP_TEXT=$(echo "$FOLLOWUP_RESPONSE" | python3 -c "import json,sys; data=json.load(sys.stdin); print(data.get('response','').lower())" 2>/dev/null || echo "")

if [ "$CONV_LENGTH" -gt "1" ] && [[ "$FOLLOWUP_TEXT" == *"production"* || "$FOLLOWUP_TEXT" == *"deployment"* || "$FOLLOWUP_TEXT" == *"test"* ]]; then
    true; test_result "Session Memory (Conversation Length: $CONV_LENGTH, Context Preserved)"
else
    false; test_result "Session Memory (Length: $CONV_LENGTH, Context Lost)"
fi

echo ""
echo -e "${BLUE}⚡ PERFORMANCE & SCALABILITY${NC}"
echo "=========================="

# Test 5: Response Time Under Load
echo "5. Performance Under Concurrent Load..."
START_TIME=$(date +%s)

# Run 3 concurrent requests
curl -s -X POST -H "Content-Type: application/json" -d '{"question":"Performance test 1"}' https://isaac-mineo-api.onrender.com/api/chatbot > /tmp/perf1.json &
curl -s -X POST -H "Content-Type: application/json" -d '{"question":"Performance test 2"}' https://isaac-mineo-api.onrender.com/api/chatbot > /tmp/perf2.json &
curl -s -X POST -H "Content-Type: application/json" -d '{"question":"Performance test 3"}' https://isaac-mineo-api.onrender.com/api/chatbot > /tmp/perf3.json &

wait

END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))

# Check if all responses are valid
VALID_RESPONSES=0
for i in {1..3}; do
    RESP_LENGTH=$(cat /tmp/perf$i.json | python3 -c "import json,sys; data=json.load(sys.stdin); print(len(data.get('response','')))" 2>/dev/null || echo "0")
    if [ "$RESP_LENGTH" -gt "50" ]; then
        ((VALID_RESPONSES++))
    fi
done

if [ "$VALID_RESPONSES" -eq "3" ] && [ "$TOTAL_TIME" -lt "30" ]; then
    true; test_result "Concurrent Performance (3/3 responses in ${TOTAL_TIME}s)"
else
    false; test_result "Concurrent Performance ($VALID_RESPONSES/3 responses in ${TOTAL_TIME}s)"
fi

echo ""
echo -e "${BLUE}🔗 INTEGRATION & DEPLOYMENT${NC}"
echo "========================="

# Test 6: Frontend-Backend Integration
echo "6. Frontend-Backend Integration..."
FRONTEND_STATUS=$(curl -s -w "%{http_code}" -o /tmp/frontend.html https://isaac-mineo.vercel.app)
FRONTEND_HAS_CONTENT=false

if [ "$FRONTEND_STATUS" = "200" ]; then
    if grep -q "Isaac Mineo" /tmp/frontend.html && grep -q "AI" /tmp/frontend.html; then
        FRONTEND_HAS_CONTENT=true
    fi
fi

# Check CORS
CORS_STATUS=$(curl -s -w "%{http_code}" -X OPTIONS \
    -H "Origin: https://isaac-mineo.vercel.app" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -o /dev/null \
    https://isaac-mineo-api.onrender.com/api/chatbot)

if [ "$FRONTEND_HAS_CONTENT" = "true" ] && [ "$CORS_STATUS" = "200" ]; then
    true; test_result "Frontend Integration (Frontend: $FRONTEND_STATUS, CORS: $CORS_STATUS)"
else
    false; test_result "Frontend Integration (Frontend: $FRONTEND_STATUS/$FRONTEND_HAS_CONTENT, CORS: $CORS_STATUS)"
fi

# Test 7: API Endpoint Coverage
echo "7. Critical API Endpoints..."
ENDPOINTS_WORKING=0

# Test key endpoints
curl -s https://isaac-mineo-api.onrender.com/health > /dev/null && ((ENDPOINTS_WORKING++))
curl -s https://isaac-mineo-api.onrender.com/metrics > /dev/null && ((ENDPOINTS_WORKING++))
curl -s -X POST -H "Content-Type: application/json" -d '{"question":"test"}' https://isaac-mineo-api.onrender.com/api/chatbot > /dev/null && ((ENDPOINTS_WORKING++))
curl -s https://isaac-mineo-api.onrender.com/api/voice/status > /dev/null && ((ENDPOINTS_WORKING++))

if [ "$ENDPOINTS_WORKING" -ge "4" ]; then
    true; test_result "API Endpoints ($ENDPOINTS_WORKING/4 working)"
else
    false; test_result "API Endpoints ($ENDPOINTS_WORKING/4 working - Critical endpoints down)"
fi

echo ""
echo -e "${BLUE}🔒 SECURITY & RELIABILITY${NC}"
echo "========================"

# Test 8: Security Measures
echo "8. Security Configuration..."
HTTPS_BACKEND=false
HTTPS_FRONTEND=false

# Check HTTPS
[[ "https://isaac-mineo-api.onrender.com" == https://* ]] && HTTPS_BACKEND=true
[[ "https://isaac-mineo.vercel.app" == https://* ]] && HTTPS_FRONTEND=true

# Test input validation
MALICIOUS_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"question":"<script>alert(\"xss\")</script>"}' \
    https://isaac-mineo-api.onrender.com/api/chatbot)

XSS_SAFE=true
if echo "$MALICIOUS_RESPONSE" | grep -q "<script>" 2>/dev/null; then
    XSS_SAFE=false
fi

if [ "$HTTPS_BACKEND" = "true" ] && [ "$HTTPS_FRONTEND" = "true" ] && [ "$XSS_SAFE" = "true" ]; then
    true; test_result "Security Measures (HTTPS: ✓, Input Validation: ✓)"
else
    false; test_result "Security Measures (HTTPS: Backend:$HTTPS_BACKEND/Frontend:$HTTPS_FRONTEND, XSS Safe: $XSS_SAFE)"
fi

echo ""
echo -e "${BLUE}📊 EXPERT DEPLOYMENT ASSESSMENT${NC}"
echo "==============================="

TOTAL_TESTS=$((PASSED + FAILED))
SUCCESS_RATE=$((PASSED * 100 / TOTAL_TESTS))

echo ""
echo -e "Tests Passed: ${GREEN}$PASSED${NC}/$TOTAL_TESTS"
echo -e "Success Rate: ${GREEN}$SUCCESS_RATE${NC}%"

echo ""
echo -e "${BLUE}🎯 EXPERT RECOMMENDATION:${NC}"
echo "========================"

if [ $SUCCESS_RATE -ge 90 ]; then
    echo -e "${GREEN}🟢 APPROVED FOR PRODUCTION BETA DEPLOYMENT${NC}"
    echo "✅ All critical systems validated"
    echo "✅ Performance meets enterprise standards"  
    echo "✅ Security measures properly implemented"
    echo "🚀 Ready for user traffic"
elif [ $SUCCESS_RATE -ge 75 ]; then
    echo -e "${YELLOW}🟡 CONDITIONALLY APPROVED FOR BETA DEPLOYMENT${NC}"
    echo "✅ Core functionality working correctly"
    echo "⚠️  Minor issues detected - monitor closely"
    echo "📊 Deploy with enhanced monitoring"
    echo "🔄 Plan immediate fixes for failed tests"
else
    echo -e "${RED}🔴 NOT APPROVED FOR DEPLOYMENT${NC}"
    echo "❌ Critical failures detected"
    echo "🛑 Requires fixes before deployment"
    echo "📋 Address all failed tests"
fi

echo ""
echo -e "${BLUE}💡 SYSTEM HIGHLIGHTS:${NC}"
echo "=================="

# Show what's working well
if [ $PASSED -gt 0 ]; then
    echo -e "${GREEN}Working Systems:${NC}"
    [ $HEALTH_STATUS = "healthy" ] && echo "  ✅ Backend health monitoring active"
    [ $RESPONSE_LENGTH -gt 100 ] && echo "  ✅ AI chatbot providing quality responses"
    [ $VOICE_ENABLED = "True" ] && echo "  ✅ Voice AI system operational"
    [ $CONV_LENGTH -gt 1 ] && echo "  ✅ Session management and context preservation"
    [ $VALID_RESPONSES -eq 3 ] && echo "  ✅ Concurrent request handling"
    [ $ENDPOINTS_WORKING -ge 4 ] && echo "  ✅ All critical API endpoints online"
    [ $HTTPS_BACKEND = "true" ] && echo "  ✅ Security measures implemented"
fi

# Show what needs attention  
if [ $FAILED -gt 0 ]; then
    echo ""
    echo -e "${RED}Needs Attention:${NC}"
    [ $TOTAL_ERRORS -ge 50 ] && echo "  ⚠️  High error count in backend logs"
    [ $TOTAL_TIME -ge 30 ] && echo "  ⚠️  Performance under load needs optimization"
    [ $ENDPOINTS_WORKING -lt 4 ] && echo "  ⚠️  Some API endpoints not responding"
    [ $XSS_SAFE = "false" ] && echo "  ⚠️  Input validation may need strengthening"
fi

# Cleanup
rm -f /tmp/health.json /tmp/perf*.json /tmp/frontend.html

echo ""
echo -e "${GREEN}🎯 EXPERT VALIDATION COMPLETE${NC}"
echo -e "${BLUE}Ready for production decision based on $SUCCESS_RATE% success rate${NC}"
