#!/bin/bash

# Test Redis functionality in production
echo "🧪 TESTING PRODUCTION REDIS"
echo "==========================="

echo ""
echo "Testing Redis connection in production..."

# Test health endpoint first
echo "📋 Checking backend health..."
curl -s "https://isaac-mineo-api.onrender.com/health" | python3 -m json.tool

echo ""
echo "📋 Testing session persistence..."

# Test session creation and persistence
SESSION_RESPONSE=$(curl -s -X POST "https://isaac-mineo-api.onrender.com/api/chatbot" \
  -H "Content-Type: application/json" \
  -d '{"question": "Tell me about Nutrivize"}')

echo "First request response:"
echo "$SESSION_RESPONSE" | python3 -m json.tool

# Extract session ID
SESSION_ID=$(echo "$SESSION_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['sessionId'])")

echo ""
echo "Session ID: $SESSION_ID"
echo ""
echo "📋 Testing session continuation..."

# Test session continuation
FOLLOWUP_RESPONSE=$(curl -s -X POST "https://isaac-mineo-api.onrender.com/api/chatbot" \
  -H "Content-Type: application/json" \
  -d "{\"question\": \"What technologies were used?\", \"sessionId\": \"$SESSION_ID\"}")

echo "Follow-up request response:"
echo "$FOLLOWUP_RESPONSE" | python3 -m json.tool

# Check if conversation length increased
CONVERSATION_LENGTH=$(echo "$FOLLOWUP_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['conversationLength'])")

echo ""
echo "🎯 REDIS TEST RESULTS:"
echo "======================"
if [ "$CONVERSATION_LENGTH" -gt 1 ]; then
    echo "✅ Redis is working! Conversation length: $CONVERSATION_LENGTH"
    echo "✅ Session persistence: WORKING"
    echo "✅ Context awareness: ENABLED"
else
    echo "❌ Redis is not working. Conversation length: $CONVERSATION_LENGTH"
    echo "❌ Session persistence: FAILED"
    echo "❌ Check Render environment variables"
fi
