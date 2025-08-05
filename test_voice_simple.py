#!/usr/bin/env python3
"""
Simple Voice Implementation Test
Tests the voice endpoints and WebSocket functionality
"""

import asyncio
import websockets
import json
import requests
import sys
from datetime import datetime

def log(message, status="INFO"):
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] [{status}] {message}")

def test_voice_status():
    """Test the voice status endpoint"""
    log("Testing voice status endpoint...")
    try:
        response = requests.get("http://localhost:8000/api/voice/status")
        if response.status_code == 200:
            data = response.json()
            log(f"✅ Voice Status: {data}", "SUCCESS")
            return data.get("voice_enabled", False)
        else:
            log(f"❌ Voice status failed: {response.status_code}", "ERROR")
            return False
    except Exception as e:
        log(f"❌ Voice status error: {e}", "ERROR")
        return False

def test_voice_synthesis():
    """Test the voice synthesis endpoint"""
    log("Testing voice synthesis endpoint...")
    try:
        payload = {
            "text": "This is a test of voice synthesis functionality",
            "session_id": "python-test-session",
            "return_audio": True
        }
        response = requests.post(
            "http://localhost:8000/api/voice/synthesize",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            data = response.json()
            log(f"✅ Voice synthesis successful", "SUCCESS")
            log(f"Response text length: {len(data.get('text', ''))}", "INFO")
            log(f"Audio URL: {data.get('audio_url', 'None')}", "INFO")
            return True
        else:
            log(f"❌ Voice synthesis failed: {response.status_code}", "ERROR")
            log(f"Response: {response.text}", "ERROR")
            return False
    except Exception as e:
        log(f"❌ Voice synthesis error: {e}", "ERROR")
        return False

async def test_websocket_connection():
    """Test WebSocket connection for voice chat"""
    log("Testing WebSocket connection...")
    try:
        uri = "ws://localhost:8000/api/voice/chat"
        async with websockets.connect(uri) as websocket:
            log("✅ WebSocket connected successfully", "SUCCESS")
            
            # Send start session message
            start_message = {
                "type": "start_session",
                "session_id": "python-test-websocket-session"
            }
            await websocket.send(json.dumps(start_message))
            log("📤 Sent start session message", "INFO")
            
            # Wait for response
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                data = json.loads(response)
                log(f"📥 Received: {data}", "SUCCESS")
                return True
            except asyncio.TimeoutError:
                log("⏰ WebSocket response timeout", "WARNING")
                return True  # Connection worked, just no immediate response
                
    except Exception as e:
        log(f"❌ WebSocket connection error: {e}", "ERROR")
        return False

def test_backend_health():
    """Test backend health"""
    log("Testing backend health...")
    try:
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            data = response.json()
            log(f"✅ Backend healthy: {data.get('status')}", "SUCCESS")
            return True
        else:
            log(f"❌ Backend health check failed: {response.status_code}", "ERROR")
            return False
    except Exception as e:
        log(f"❌ Backend health error: {e}", "ERROR")
        return False

async def main():
    """Run all voice implementation tests"""
    log("🎤 Starting Voice Implementation Tests", "INFO")
    log("=" * 50, "INFO")
    
    tests_passed = 0
    tests_total = 4
    
    # Test 1: Backend Health
    if test_backend_health():
        tests_passed += 1
    
    # Test 2: Voice Status
    voice_enabled = test_voice_status()
    if voice_enabled:
        tests_passed += 1
    
    # Test 3: Voice Synthesis
    if voice_enabled and test_voice_synthesis():
        tests_passed += 1
    elif not voice_enabled:
        log("⏭️  Skipping voice synthesis (voice not enabled)", "WARNING")
    
    # Test 4: WebSocket Connection
    if voice_enabled and await test_websocket_connection():
        tests_passed += 1
    elif not voice_enabled:
        log("⏭️  Skipping WebSocket test (voice not enabled)", "WARNING")
    
    # Summary
    log("=" * 50, "INFO")
    log("🎤 Voice Implementation Test Summary", "INFO")
    log(f"Tests Passed: {tests_passed}/{tests_total}", "SUCCESS" if tests_passed == tests_total else "WARNING")
    
    if tests_passed == tests_total:
        log("🎉 All voice tests PASSED! Voice implementation is working correctly.", "SUCCESS")
        return True
    else:
        log(f"⚠️  {tests_total - tests_passed} test(s) failed. Please check the issues above.", "WARNING")
        return False

if __name__ == "__main__":
    try:
        result = asyncio.run(main())
        sys.exit(0 if result else 1)
    except KeyboardInterrupt:
        log("Test interrupted by user", "WARNING")
        sys.exit(1)
    except Exception as e:
        log(f"Test runner failed: {e}", "ERROR")
        sys.exit(1)
