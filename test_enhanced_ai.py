#!/usr/bin/env python3
"""
Test script for enhanced AI portfolio chat responses
Tests common questions that recruiters and developers ask
"""

import requests
import json
import time
from typing import List, Dict, Optional

# Configuration
API_URL = "http://localhost:8000/api/chatbot"
TEST_QUESTIONS = [
    # Tech Stack Questions (Enhanced)
    "What's your tech stack?",
    "What technologies do you use?",
    "Tell me about your programming skills",
    "What tools and frameworks are you proficient in?",
    
    # Project Questions (Enhanced)  
    "What projects have you built?",
    "Tell me about your work",
    "Show me what you've created",
    "What's your flagship project?",
    
    # Experience Questions (Enhanced)
    "What's your background?", 
    "Tell me about your experience",
    "How did you learn to code?",
    "What's your development journey?",
    
    # Career Questions (Enhanced)
    "What are you looking for in your next role?",
    "What kind of job do you want?",
    "What are your career goals?",
    "Are you open to new opportunities?",
    
    # AI/ML Questions (Enhanced)
    "Tell me about your AI experience",
    "Do you work with machine learning?",
    "What AI technologies do you use?",
    "How do you integrate AI into your projects?",
    
    # Challenge/Problem Questions (Enhanced)
    "What's the most challenging project you've worked on?",
    "What difficult problems have you solved?",
    "Tell me about a technical challenge you overcame",
    
    # Contact Questions (Enhanced)
    "How can I contact you?",
    "What's your email?",
    "Are you available for hire?",
    
    # Context-Aware Follow-up Test
    "Tell me about Nutrivize",
    "What's the tech stack?",  # Should understand this refers to Nutrivize
]

def test_ai_response(question: str, session_id: Optional[str] = None) -> Dict:
    """Test a single question and return response details"""
    print(f"\n🤔 Question: {question}")
    
    payload = {
        "question": question,
        "sessionId": session_id
    }
    
    try:
        start_time = time.time()
        response = requests.post(API_URL, json=payload, timeout=30)
        end_time = time.time()
        
        if response.status_code == 200:
            data = response.json()
            response_time = end_time - start_time
            
            print(f"✅ Response received ({response_time:.2f}s)")
            print(f"📝 Length: {len(data['response'])} characters")
            print(f"🔍 Method: {data.get('searchMethod', 'unknown')}")
            print(f"💬 Session: {data.get('sessionId', 'none')}")
            
            # Show first 200 chars of response
            response_preview = data['response'][:200] + "..." if len(data['response']) > 200 else data['response']
            print(f"📄 Preview: {response_preview}")
            
            return {
                "success": True,
                "question": question,
                "response": data['response'],
                "response_time": response_time,
                "method": data.get('searchMethod'),
                "session_id": data.get('sessionId'),
                "length": len(data['response'])
            }
        else:
            print(f"❌ HTTP {response.status_code}: {response.text}")
            return {"success": False, "error": f"HTTP {response.status_code}"}
            
    except requests.exceptions.Timeout:
        print(f"⏰ Timeout after 30 seconds")
        return {"success": False, "error": "Timeout"}
    except Exception as e:
        print(f"💥 Error: {e}")
        return {"success": False, "error": str(e)}

def run_enhanced_ai_tests():
    """Run comprehensive tests of enhanced AI responses"""
    print("🚀 ENHANCED AI PORTFOLIO CHAT TEST")
    print("=" * 50)
    
    results = []
    session_id = None
    
    for i, question in enumerate(TEST_QUESTIONS, 1):
        print(f"\n--- Test {i}/{len(TEST_QUESTIONS)} ---")
        result = test_ai_response(question, session_id)
        results.append(result)
        
        # Use session ID for context-aware testing
        if result.get("success") and result.get("session_id"):
            session_id = result["session_id"]
        
        # Brief pause between requests
        time.sleep(1)
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    successful = [r for r in results if r.get("success")]
    failed = [r for r in results if not r.get("success")]
    
    print(f"✅ Successful: {len(successful)}/{len(results)}")
    print(f"❌ Failed: {len(failed)}/{len(results)}")
    
    if successful:
        avg_response_time = sum(r['response_time'] for r in successful) / len(successful)
        avg_length = sum(r['length'] for r in successful) / len(successful)
        print(f"⚡ Avg Response Time: {avg_response_time:.2f}s")
        print(f"📏 Avg Response Length: {avg_length:.0f} characters")
    
    # Show methods used
    methods = {}
    for result in successful:
        method = result.get('method', 'unknown')
        methods[method] = methods.get(method, 0) + 1
    
    print(f"🔍 Methods Used: {methods}")
    
    if failed:
        print(f"\n❌ Failed Questions:")
        for result in failed:
            print(f"   • {result.get('question', 'Unknown')}: {result.get('error', 'Unknown error')}")
    
    # Highlight best responses
    if successful:
        print(f"\n🏆 LONGEST RESPONSES:")
        sorted_by_length = sorted(successful, key=lambda x: x['length'], reverse=True)[:3]
        for result in sorted_by_length:
            print(f"   • {result['question']}: {result['length']} chars")

if __name__ == "__main__":
    print("Testing Enhanced AI Portfolio Chat...")
    print("Make sure the backend is running on localhost:8000")
    print()
    
    # Check if backend is running
    try:
        health_check = requests.get("http://localhost:8000/health", timeout=5)
        if health_check.status_code == 200:
            print("✅ Backend is running, starting tests...")
            run_enhanced_ai_tests()
        else:
            print("❌ Backend health check failed")
    except requests.exceptions.RequestException:
        print("❌ Backend is not running. Please start it with: ./start-backend.sh")
