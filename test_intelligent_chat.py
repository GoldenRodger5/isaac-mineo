#!/usr/bin/env python3
"""
Intelligent Chat Test - Tests AI model selection and natural responses
"""

import requests
import time
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_file = Path('.env')
if env_file.exists():
    load_dotenv(env_file)

def test_intelligent_chat():
    """Test intelligent chat with model selection"""
    BASE_URL = "http://localhost:8000"
    
    test_cases = [
        {
            "category": "SIMPLE QUERIES (GPT-4o-mini expected)",
            "questions": [
                "What is Isaac's email?",
                "How can I contact Isaac?", 
                "What are Isaac's skills?",
                "What programming languages does Isaac know?"
            ]
        },
        {
            "category": "COMPLEX QUERIES (GPT-4o expected)",
            "questions": [
                "Tell me about Nutrivize and explain how it works",
                "Describe Isaac's approach to AI integration in detail",
                "Explain the architecture of Isaac's projects",
                "Walk me through Isaac's technical methodology"
            ]
        },
        {
            "category": "MEDIUM QUERIES (GPT-4o-mini expected)",
            "questions": [
                "What projects has Isaac built?",
                "What is Isaac's experience?",
                "Who is Isaac Mineo?"
            ]
        }
    ]
    
    print("🧠 INTELLIGENT CHAT MODEL SELECTION TEST")
    print("="*70)
    
    total_simple = 0
    total_complex = 0
    
    for category_info in test_cases:
        category = category_info["category"]
        questions = category_info["questions"]
        
        print(f"\n🎯 {category}")
        print("-" * 50)
        
        for i, question in enumerate(questions, 1):
            print(f"\n📝 {i}. {question}")
            
            start_time = time.time()
            try:
                response = requests.post(
                    f"{BASE_URL}/api/chatbot/fast",
                    json={"question": question, "sessionId": f"intel_test_{hash(question)}"},
                    timeout=25
                )
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    data = response.json()
                    response_text = data.get("response", "")
                    response_length = len(response_text)
                    search_method = data.get("searchMethod", "unknown")
                    context_used = data.get("contextUsed", [])
                    
                    # Extract model info from context
                    model_info = "unknown"
                    for ctx in context_used:
                        if "gpt-4o" in str(ctx).lower():
                            model_info = "GPT-4o" if "gpt-4o)" in str(ctx) else "GPT-4o-mini"
                            break
                    
                    print(f"    ✅ Time: {response_time:.2f}s | Model: {model_info}")
                    print(f"    📊 Length: {response_length} chars | Method: {search_method}")
                    
                    # Track totals for summary
                    if "simple" in category.lower():
                        total_simple += response_time
                    elif "complex" in category.lower():
                        total_complex += response_time
                    
                    # Show response preview
                    preview = response_text[:120] + "..." if len(response_text) > 120 else response_text
                    print(f"    💬 Preview: {preview}")
                    
                    # Quality check - ensure responses don't sound too scripted
                    if any(phrase in response_text.lower() for phrase in ["i am isaac's", "here are isaac's", "isaac's main"]):
                        print(f"    ⚠️  Response might be too scripted")
                    
                else:
                    print(f"    ❌ Failed: {response.status_code}")
                    
            except Exception as e:
                print(f"    ❌ Error: {e}")
            
            time.sleep(0.5)
    
    print("\n" + "="*70)
    print("📊 PERFORMANCE SUMMARY:")
    if total_simple > 0:
        print(f"• Simple queries avg: {total_simple/4:.2f}s (should be <3s with GPT-4o-mini)")
    if total_complex > 0:
        print(f"• Complex queries avg: {total_complex/4:.2f}s (acceptable 5-15s with GPT-4o)")
    print("\n🎯 EXPECTED BEHAVIOR:")
    print("• Simple/Medium → GPT-4o-mini (faster, efficient)")
    print("• Complex → GPT-4o (better reasoning, detailed)")
    print("• Natural responses (not templated/scripted)")

if __name__ == "__main__":
    test_intelligent_chat()
