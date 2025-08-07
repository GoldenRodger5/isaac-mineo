#!/usr/bin/env python3
"""
Test Voice Synthesis with Short Text
"""

import requests
import json
import time
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_file = Path('.env')
if env_file.exists():
    load_dotenv(env_file)

def test_short_synthesis():
    """Test voice synthesis with short text"""
    base_url = "http://localhost:8001"
    
    print("🔍 Testing audio synthesis with short text...")
    test_data = {
        "text": "Hello World! This is a short test.",
        "session_id": "debug_short_session", 
        "return_audio": True
    }
    
    try:
        start_time = time.time()
        response = requests.post(f"{base_url}/api/voice/synthesize", json=test_data, timeout=30)
        execution_time = time.time() - start_time
        
        print(f"Status: {response.status_code}")
        print(f"Execution time: {execution_time:.2f}s")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys())}")
            print(f"Text: {data.get('text', 'MISSING')[:100]}...")
            print(f"Session ID: {data.get('session_id', 'MISSING')}")
            
            audio_url = data.get('audio_url', '')
            if audio_url:
                print(f"✅ Audio URL generated!")
                print(f"Audio URL prefix: {audio_url[:50]}...")
                print(f"Audio URL length: {len(audio_url)}")
                print(f"Is data URL: {audio_url.startswith('data:audio/')}")
            else:
                print("❌ No audio_url in response")
        else:
            print(f"Error response: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_short_synthesis()
