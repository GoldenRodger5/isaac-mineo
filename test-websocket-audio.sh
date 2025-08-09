#!/bin/bash

# Test Production WebSocket Audio Processing
# This will help us see what's happening with the audio pipeline

echo "🎤 PRODUCTION WEBSOCKET AUDIO TEST"
echo "================================="
echo ""

echo "🔍 Testing WebSocket connection and audio processing..."
echo ""

# Test WebSocket connectivity
echo "1. Testing WebSocket Connection:"
echo "   URL: wss://isaac-mineo-api.onrender.com/api/voice/chat"

# Use a simple WebSocket test with wscat or node
if command -v wscat &> /dev/null; then
    echo "   Using wscat for WebSocket test..."
    timeout 10s wscat -c "wss://isaac-mineo-api.onrender.com/api/voice/chat" -x '{"type":"start_session","session_id":"test_123"}'
else
    echo "   wscat not available, use browser test instead"
fi

echo ""
echo "2. Backend Environment Check:"
curl -s "https://isaac-mineo-api.onrender.com/health" | jq '.' 2>/dev/null || curl -s "https://isaac-mineo-api.onrender.com/health"

echo ""
echo "3. Voice Service Status:"
curl -s "https://isaac-mineo-api.onrender.com/api/voice/status" | jq '.' 2>/dev/null || curl -s "https://isaac-mineo-api.onrender.com/api/voice/status"

echo ""
echo "🩺 DIAGNOSIS STEPS:"
echo "1. Check if backend environment is 'production' (should be, not 'development')"
echo "2. Verify voice_enabled is true"
echo "3. Test WebSocket connection establishment"
echo "4. Run client audio debug: node test-client-audio-debug.js"
echo ""

echo "📋 IF AUDIO STILL NOT WORKING:"
echo "The issue is likely that:"
echo "  a) Audio format doesn't match Deepgram expectations"
echo "  b) Deepgram WebSocket connection isn't properly handling audio data"  
echo "  c) Backend environment needs ENVIRONMENT=production"
echo ""

echo "🔧 NEXT ACTION:"
echo "1. Set ENVIRONMENT=production in Render dashboard"
echo "2. Open frontend in browser and run: testClientAudioProcessing()"
echo "3. Check browser console for audio processing details"
echo "4. Say 'hello' and see if Deepgram transcribes it"
echo ""
