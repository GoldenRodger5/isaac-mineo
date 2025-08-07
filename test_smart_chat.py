#!/usr/bin/env python3
"""
Smart Chat Test - Tests different query complexities
"""

import requests
import time
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_file = Path('.env')
if env_file.exists():
    load_dotenv(env_file)

def test_smart_chat():
    """Test smart chat with different complexity levels"""
    BASE_URL = "http://localhost:8000"
    
    test_cases = [
        # Simple queries (should be instant)
        {
            "category": "SIMPLE CONTACT",
            "questions": [
                "How can I contact Isaac?",
                "What is Isaac's email?", 
                "How do I reach Isaac?"
            ]
        },
        # Simple overview queries
        {
            "category": "SIMPLE SKILLS", 
            "questions": [
                "What are Isaac's skills?",
                "What technologies does Isaac know?",
                "Isaac's tech stack?"
            ]
        },
        # Medium complexity
        {
            "category": "MEDIUM COMPLEXITY",
            "questions": [
                "Tell me about Isaac's experience",
                "What programming languages does Isaac know?",
                "What kind of developer is Isaac?"
            ]
        },
        # Complex queries (should be detailed)
        {
            "category": "COMPLEX DETAILED",
            "questions": [
                "Tell me all about Nutrivize and how it works",
                "Explain Isaac's EchoPod project in detail", 
                "Describe Isaac's AI and machine learning expertise"
            ]
        }
    ]
    
    print("🧠 SMART CHAT COMPLEXITY TEST")
    print("="*60)
    
    for category_info in test_cases:
        category = category_info["category"]
        questions = category_info["questions"]
        
        print(f"\n🎯 {category}")
        print("-" * 40)
        
        for i, question in enumerate(questions, 1):
            print(f"\n📝 {i}. {question}")
            
            start_time = time.time()
            try:
                response = requests.post(
                    f"{BASE_URL}/api/chatbot/fast",
                    json={"question": question, "sessionId": f"smart_test_{category}_{i}"},
                    timeout=20
                )
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    data = response.json()
                    response_text = data.get("response", "")
                    response_length = len(response_text)
                    search_method = data.get("searchMethod", "unknown")
                    
                    print(f"    ✅ Response: {response_time:.2f}s")
                    print(f"    📊 Length: {response_length} chars")
                    print(f"    🔍 Method: {search_method}")
                    
                    # Show first 150 chars of response
                    preview = response_text[:150] + "..." if len(response_text) > 150 else response_text
                    print(f"    💬 Preview: {preview}")
                    
                else:
                    print(f"    ❌ Failed: {response.status_code}")
                    
            except Exception as e:
                print(f"    ❌ Error: {e}")
            
            time.sleep(0.5)  # Small delay between requests
    
    print("\n" + "="*60)
    print("🎯 EXPECTED RESULTS:")
    print("• Simple Contact: <1s, template responses")
    print("• Simple Skills: <1s, brief overviews") 
    print("• Medium: 2-5s, standard responses")
    print("• Complex: 5-12s, detailed explanations")

if __name__ == "__main__":
    test_smart_chat()
