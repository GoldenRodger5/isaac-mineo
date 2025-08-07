#!/usr/bin/env python3
"""
Check AI Response Length for Voice Optimization
"""

import requests
import json
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_file = Path('.env')
if env_file.exists():
    load_dotenv(env_file)

def test_ai_response_length():
    """Check what the AI is actually responding with"""
    base_url = "http://localhost:8001"
    
    test_data = {
        "text": "Hello! I'm Isaac's portfolio assistant. I can help you learn about his technical projects and professional experience. What would you like to know?",
        "session_id": "length_test",
        "return_audio": False  # Just get text to see length
    }
    
    try:
        response = requests.post(f"{base_url}/api/voice/synthesize", json=test_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            ai_response = data.get("text", "")
            
            print(f"AI Response Length: {len(ai_response)} characters")
            print(f"Word Count: {len(ai_response.split())} words")
            print("\nActual AI Response:")
            print("-" * 50)
            print(ai_response)
            print("-" * 50)
            
            # Estimate synthesis time (rough: 1 second per 10-15 words for ElevenLabs)
            estimated_time = len(ai_response.split()) / 12  # Conservative estimate
            print(f"\nEstimated synthesis time: {estimated_time:.1f} seconds")
            
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_ai_response_length()
