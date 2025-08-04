#!/bin/bash

echo "🎤 Voice Chat Feature Test"
echo "=========================="

BASE_URL="http://localhost:8000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

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
        echo "Response: $response_body"
    else
        echo -e "${RED}❌ Failed (HTTP $http_code)${NC}"
        echo "Response: $response_body"
    fi
}

echo -e "\n${YELLOW}1. Backend Health Check${NC}"
echo "------------------------"
test_endpoint "GET" "$BASE_URL/health" "Backend Health Check"

echo -e "\n${YELLOW}2. Voice Service Status${NC}"
echo "------------------------"
test_endpoint "GET" "$BASE_URL/api/voice/status" "Voice Service Status"

echo -e "\n${YELLOW}3. Voice Synthesis Test${NC}"
echo "------------------------"
test_endpoint "POST" "$BASE_URL/api/voice/synthesize" "Voice Synthesis (Text Only)" '{
    "text": "Hello! This is a test of the voice synthesis feature. Isaac has built an amazing voice chat system.",
    "session_id": "test_voice_session",
    "return_audio": false
}'

echo -e "\n${YELLOW}4. Voice Synthesis with Audio${NC}"
echo "-------------------------------"
test_endpoint "POST" "$BASE_URL/api/voice/synthesize" "Voice Synthesis (With Audio)" '{
    "text": "This test should return an audio URL for playback.",
    "session_id": "test_voice_session",
    "return_audio": true
}'

echo -e "\n${YELLOW}5. Regular Chat Integration${NC}"
echo "-----------------------------"
test_endpoint "POST" "$BASE_URL/api/chatbot" "Regular Chat (should work normally)" '{
    "question": "What is Isaac skilled in?",
    "sessionId": "test_voice_session"
}'

echo -e "\n${YELLOW}6. Environment Check${NC}"
echo "--------------------"

if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file found${NC}"
    
    if grep -q "DEEPGRAM_API_KEY" .env; then
        deepgram_key=$(grep "DEEPGRAM_API_KEY" .env | cut -d'=' -f2)
        if [ "$deepgram_key" != "your_deepgram_api_key" ] && [ ! -z "$deepgram_key" ]; then
            echo -e "${GREEN}✅ Deepgram API key configured${NC}"
        else
            echo -e "${YELLOW}⚠️  Deepgram API key is placeholder or missing${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Deepgram API key not found in .env${NC}"
    fi
    
    if grep -q "ELEVENLABS_API_KEY" .env; then
        elevenlabs_key=$(grep "ELEVENLABS_API_KEY" .env | cut -d'=' -f2)
        if [ "$elevenlabs_key" != "your_elevenlabs_api_key" ] && [ ! -z "$elevenlabs_key" ]; then
            echo -e "${GREEN}✅ ElevenLabs API key configured${NC}"
        else
            echo -e "${YELLOW}⚠️  ElevenLabs API key is placeholder or missing${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  ElevenLabs API key not found in .env${NC}"
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
fi

echo -e "\n${YELLOW}7. Frontend Integration${NC}"
echo "------------------------"

FRONTEND_URL="http://localhost:5173"

if curl -s "$FRONTEND_URL" > /dev/null; then
    echo -e "${GREEN}✅ Frontend accessible at $FRONTEND_URL${NC}"
    
    # Check if voice components are present
    if curl -s "$FRONTEND_URL" | grep -q "VoiceChat"; then
        echo -e "${GREEN}✅ Voice components detected in frontend${NC}"
    else
        echo -e "${YELLOW}⚠️  Voice components may not be loaded${NC}"
    fi
else
    echo -e "${RED}❌ Frontend not accessible at $FRONTEND_URL${NC}"
fi

echo -e "\n${BLUE}🎤 Voice Chat Test Summary${NC}"
echo "=========================="
echo "✅ Test completed"
echo "🔍 Check individual test results above"
echo "📋 To use voice features:"
echo "   1. Get API keys from Deepgram and ElevenLabs"
echo "   2. Update .env file with your keys"
echo "   3. Restart the backend server"
echo "   4. Visit the frontend and look for voice controls"
echo ""
echo "📖 See VOICE_CHAT_DOCUMENTATION.md for detailed setup instructions"

exit 0
