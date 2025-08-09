#!/bin/bash

# 🧪 Production Voice Service Verification
# Run this after setting environment variables in Render

echo "🧪 PRODUCTION VOICE SERVICE VERIFICATION"
echo "========================================"
echo ""
echo "Testing production voice service at: https://isaac-mineo-api.onrender.com"
echo ""

# Test 1: Voice Status
echo "1. 🔍 Testing Voice Service Status..."
VOICE_STATUS=$(curl -s https://isaac-mineo-api.onrender.com/api/voice/status)
echo "   Response: $VOICE_STATUS"

# Parse the JSON response
VOICE_ENABLED=$(echo $VOICE_STATUS | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('voice_enabled', False))" 2>/dev/null || echo "false")
DEEPGRAM_OK=$(echo $VOICE_STATUS | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('deepgram_available', False))" 2>/dev/null || echo "false") 
ELEVENLABS_OK=$(echo $VOICE_STATUS | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('elevenlabs_available', False))" 2>/dev/null || echo "false")

echo ""
if [ "$VOICE_ENABLED" = "True" ] && [ "$DEEPGRAM_OK" = "True" ] && [ "$ELEVENLABS_OK" = "True" ]; then
    echo "   ✅ Voice Service: FULLY OPERATIONAL IN PRODUCTION!"
    echo "   ✅ Deepgram: Available"
    echo "   ✅ ElevenLabs: Available"
    echo "   ✅ Voice Chat: Ready"
else
    echo "   ❌ Voice Service: Still not fully configured"
    echo "   Deepgram: $DEEPGRAM_OK"
    echo "   ElevenLabs: $ELEVENLABS_OK" 
    echo "   Voice Enabled: $VOICE_ENABLED"
    echo ""
    echo "   → Make sure you set all environment variables in Render dashboard"
    echo "   → Wait 2-3 minutes for redeploy to complete"
    exit 1
fi

# Test 2: Voice Synthesis
echo ""
echo "2. 🔊 Testing Voice Synthesis..."
TTS_RESPONSE=$(curl -s -X POST https://isaac-mineo-api.onrender.com/api/voice/synthesize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Production voice test successful!",
    "session_id": "production_verification_test", 
    "return_audio": true
  }')

if echo "$TTS_RESPONSE" | grep -q "audio_url"; then
    echo "   ✅ Voice Synthesis: WORKING!"
    echo "   ✅ Audio Generation: SUCCESS"
else
    echo "   ❌ Voice Synthesis: Failed"
    echo "   Response: $TTS_RESPONSE"
fi

# Test 3: Backend Health  
echo ""
echo "3. 🏥 Testing Backend Health..."
HEALTH_STATUS=$(curl -s https://isaac-mineo-api.onrender.com/health | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('status', 'unknown'))" 2>/dev/null || echo "error")

if [ "$HEALTH_STATUS" = "healthy" ]; then
    echo "   ✅ Backend: HEALTHY"
else
    echo "   ❌ Backend: $HEALTH_STATUS"
fi

echo ""
echo "🎉 PRODUCTION VOICE SERVICE VERIFICATION COMPLETE!"
echo ""
if [ "$VOICE_ENABLED" = "True" ] && [ "$DEEPGRAM_OK" = "True" ] && [ "$ELEVENLABS_OK" = "True" ]; then
    echo "✅ STATUS: VOICE SERVICE IS NOW 100% FUNCTIONAL IN PRODUCTION!"
    echo "🎤 Speech-to-text via Deepgram: Ready"
    echo "🔊 Text-to-speech via ElevenLabs: Ready" 
    echo "💬 AI Voice Chat: Fully operational"
    echo ""
    echo "🚀 Your users can now use voice chat on https://isaacmineo.com"
else
    echo "⚠️  STATUS: Voice service still needs configuration"
    echo "📋 Run ./fix-voice-production.sh for detailed instructions"
fi
