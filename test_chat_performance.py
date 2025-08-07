#!/usr/bin/env python3
"""
Chat Performance Comparison Test
Tests original vs optimized chat response times
"""

import requests
import time
import json
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_file = Path('.env')
if env_file.exists():
    load_dotenv(env_file)

def test_chat_performance():
    """Compare original vs optimized chat performance"""
    BASE_URL = "http://localhost:8000"
    
    test_questions = [
        "Tell me about Isaac's projects",
        "What programming languages does Isaac know?",
        "How can I contact Isaac?",
        "What is Nutrivize about?",
        "What are Isaac's skills in AI?"
    ]
    
    print("🚀 CHAT PERFORMANCE COMPARISON")
    print("="*50)
    
    for i, question in enumerate(test_questions, 1):
        print(f"\n📝 Test {i}: {question}")
        
        # Test original chat
        print("  🔄 Original chat...")
        start_time = time.time()
        try:
            response = requests.post(
                f"{BASE_URL}/api/chatbot",
                json={"question": question, "sessionId": f"perf_test_orig_{i}"},
                timeout=30
            )
            original_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                original_length = len(data.get("response", ""))
                print(f"    ✅ Original: {original_time:.2f}s ({original_length} chars)")
            else:
                print(f"    ❌ Original failed: {response.status_code}")
                original_time = 999
                original_length = 0
                
        except Exception as e:
            print(f"    ❌ Original error: {e}")
            original_time = 999
            original_length = 0
        
        # Test optimized chat (we'll need to add this endpoint)
        print("  ⚡ Fast chat...")
        start_time = time.time()
        try:
            response = requests.post(
                f"{BASE_URL}/api/chatbot/fast",  # New endpoint
                json={"question": question, "sessionId": f"perf_test_fast_{i}"},
                timeout=30
            )
            fast_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                fast_length = len(data.get("response", ""))
                print(f"    ✅ Fast: {fast_time:.2f}s ({fast_length} chars)")
                
                # Calculate improvement
                if original_time < 999:
                    speedup = original_time / fast_time if fast_time > 0 else 0
                    print(f"    📊 Speedup: {speedup:.1f}x faster")
                    
            else:
                print(f"    ❌ Fast failed: {response.status_code}")
                
        except Exception as e:
            print(f"    ❌ Fast error: {e}")
        
        # Small delay between tests
        time.sleep(1)
    
    print("\n" + "="*50)

if __name__ == "__main__":
    test_chat_performance()
