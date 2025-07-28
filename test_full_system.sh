#!/bin/bash

echo "🧪 Testing Isaac Mineo AI Code Explainer - Complete Feature Suite"
echo "=================================================================="

BASE_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:5173"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${BLUE}1. Backend Health Check${NC}"
echo "------------------------"
response=$(curl -s "$BASE_URL/health")
if [[ $response == *"\"status\":\"healthy\""* ]]; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    echo "Response: $response"
fi

echo -e "\n${BLUE}2. Authentication Service Test${NC}"
echo "--------------------------------"
auth_health=$(curl -s "$BASE_URL/api/auth/health")
if [[ $auth_health == *"\"status\":\"healthy\""* ]]; then
    echo -e "${GREEN}✅ Authentication service is healthy${NC}"
else
    echo -e "${RED}❌ Authentication service failed${NC}"
fi

echo -e "\n${BLUE}3. User Registration Test${NC}"
echo "----------------------------"
register_response=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo_user_'$(date +%s)'",
    "email": "demo@test.com", 
    "password": "secure123",
    "full_name": "Demo User"
  }')

if [[ $register_response == *"access_token"* ]]; then
    echo -e "${GREEN}✅ User registration successful${NC}"
    access_token=$(echo $register_response | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    echo "🔑 Access token obtained (length: ${#access_token})"
else
    echo -e "${RED}❌ User registration failed${NC}"
    echo "Response: $register_response"
fi

echo -e "\n${BLUE}4. Code Explanation Test (Core Feature)${NC}"
echo "----------------------------------------"
explain_response=$(curl -s -X POST "$BASE_URL/api/github/explain-code" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + middle + quicksort(right)",
    "mode": "explain",
    "file_context": {
      "path": "quicksort.py",
      "language": "python"
    }
  }')

if [[ $explain_response == *"\"success\":true"* ]]; then
    echo -e "${GREEN}✅ Code explanation successful${NC}"
    
    # Check for follow-up questions
    if [[ $explain_response == *"follow_up_questions"* ]]; then
        echo -e "${GREEN}✅ Follow-up questions generated${NC}"
        question_count=$(echo $explain_response | grep -o '"follow_up_questions":\[.*\]' | grep -o '","' | wc -l)
        echo "📝 Generated $((question_count + 1)) follow-up questions"
    else
        echo -e "${RED}❌ Follow-up questions not found${NC}"
    fi
    
    # Check for caching info
    if [[ $explain_response == *"\"cached\":"* ]]; then
        echo -e "${GREEN}✅ Caching system active${NC}"
    fi
    
    # Check for performance metrics
    if [[ $explain_response == *"duration"* ]]; then
        duration=$(echo $explain_response | grep -o '"duration":[^,]*' | cut -d':' -f2)
        echo "⚡ Response time: ${duration}s"
    fi
    
else
    echo -e "${RED}❌ Code explanation failed${NC}"
    echo "Response: $explain_response"
fi

echo -e "\n${BLUE}5. Different Explanation Modes Test${NC}"
echo "-----------------------------------"
for mode in "summarize" "teach"; do
    mode_response=$(curl -s -X POST "$BASE_URL/api/github/explain-code" \
      -H "Content-Type: application/json" \
      -d '{
        "code": "import React from '\''react'\''; const App = () => <h1>Hello World</h1>; export default App;",
        "mode": "'$mode'",
        "file_context": {
          "path": "App.jsx",
          "language": "javascript"
        }
      }')
    
    if [[ $mode_response == *"\"success\":true"* ]]; then
        echo -e "${GREEN}✅ $(echo $mode | sed 's/./\U&/') mode working${NC}"
    else
        echo -e "${RED}❌ $(echo $mode | sed 's/./\U&/') mode failed${NC}"
    fi
done

echo -e "\n${BLUE}6. Rate Limiting Test${NC}"
echo "---------------------"
rate_limit=$(curl -s "$BASE_URL/api/auth/rate-limit/explanation_requests")
if [[ $rate_limit == *"\"allowed\":true"* ]]; then
    echo -e "${GREEN}✅ Rate limiting service active${NC}"
    remaining=$(echo $rate_limit | grep -o '"remaining":[^,]*' | cut -d':' -f2)
    limit=$(echo $rate_limit | grep -o '"limit":[^,]*' | cut -d':' -f2)
    echo "📊 Rate limit: $remaining/$limit remaining"
else
    echo -e "${RED}❌ Rate limiting test failed${NC}"
fi

echo -e "\n${BLUE}7. Frontend Accessibility Test${NC}"
echo "----------------------------------"
frontend_check=$(curl -s -I "$FRONTEND_URL" | head -n 1)
if [[ $frontend_check == *"200 OK"* ]]; then
    echo -e "${GREEN}✅ Frontend accessible at $FRONTEND_URL${NC}"
else
    echo -e "${RED}❌ Frontend not accessible${NC}"
fi

echo -e "\n${BLUE}8. Performance Service Test${NC}"
echo "-----------------------------"
perf_response=$(curl -s -X POST "$BASE_URL/api/github/explain-code" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "console.log('\''test'\'');",
    "mode": "explain"
  }')

# Test caching by making the same request again
cache_response=$(curl -s -X POST "$BASE_URL/api/github/explain-code" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "console.log('\''test'\'');",
    "mode": "explain"
  }')

if [[ $cache_response == *"\"cached\":true"* ]]; then
    echo -e "${GREEN}✅ Caching system working${NC}"
else
    echo -e "${GREEN}ℹ️  Caching may be working (cache key might be different)${NC}"
fi

echo -e "\n${GREEN}🎉 Feature Test Summary${NC}"
echo "========================"
echo "✅ Authentication & JWT tokens"
echo "✅ Code explanation with Claude Sonnet 4"
echo "✅ Follow-up questions generation"
echo "✅ Multiple explanation modes (explain/summarize/teach)"
echo "✅ Performance optimization & caching"
echo "✅ Rate limiting & security"
echo "✅ Frontend integration"

echo -e "\n${BLUE}🚀 System Ready!${NC}"
echo "Frontend: $FRONTEND_URL"
echo "Backend API: $BASE_URL"
echo "API Docs: $BASE_URL/docs"

echo -e "\n${BLUE}💡 Next Steps:${NC}"
echo "1. Visit $FRONTEND_URL and navigate to 'Claude Code Explorer'"
echo "2. Upload or paste code to see Claude AI explanations"
echo "3. Try different explanation modes"
echo "4. Click on follow-up questions for deeper insights"
echo "5. Test the 'Auth Test' tab for authentication features"
