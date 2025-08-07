#!/usr/bin/env python3
"""
Comprehensive test suite for AI-powered chat routing system
Tests both simple and detailed query routing with performance validation
"""

import requests
import time
import json
from datetime import datetime

# Test configuration
BASE_URL = "http://localhost:8000"
TEST_ENDPOINT = f"{BASE_URL}/api/chatbot/fast"

# Test cases designed to validate AI routing decisions
TEST_CASES = [
    {
        "category": "Contact Information",
        "tests": [
            {
                "question": "What is Isaac's email address?",
                "expected_complexity": "simple",
                "expected_model": "gpt-4o-mini",
                "description": "Basic contact query"
            },
            {
                "question": "How can I contact Isaac?",
                "expected_complexity": "simple", 
                "expected_model": "gpt-4o-mini",
                "description": "General contact query"
            },
            {
                "question": "What's Isaac's LinkedIn profile?",
                "expected_complexity": "simple",
                "expected_model": "gpt-4o-mini", 
                "description": "LinkedIn contact query"
            },
            {
                "question": "Does Isaac have a phone number?",
                "expected_complexity": "simple",
                "expected_model": "gpt-4o-mini",
                "description": "Phone number query"
            }
        ]
    },
    {
        "category": "Portfolio & Projects",
        "tests": [
            {
                "question": "Tell me about Isaac's projects",
                "expected_complexity": "detailed",
                "expected_model": "gpt-4o",
                "description": "General projects overview"
            },
            {
                "question": "Explain Nutrivize and how it works",
                "expected_complexity": "detailed",
                "expected_model": "gpt-4o", 
                "description": "Specific project deep-dive"
            },
            {
                "question": "What is Isaac's experience with AI development?",
                "expected_complexity": "detailed",
                "expected_model": "gpt-4o",
                "description": "Technical expertise query"
            },
            {
                "question": "Describe Isaac's technical background and skills",
                "expected_complexity": "detailed",
                "expected_model": "gpt-4o",
                "description": "Comprehensive background query"
            }
        ]
    },
    {
        "category": "Edge Cases",
        "tests": [
            {
                "question": "Hi",
                "expected_complexity": "simple",
                "expected_model": "gpt-4o-mini",
                "description": "Minimal greeting"
            },
            {
                "question": "Tell me everything about Isaac Mineo's professional career, projects, technical expertise, and how he approaches complex AI problems",
                "expected_complexity": "detailed", 
                "expected_model": "gpt-4o",
                "description": "Very comprehensive query"
            }
        ]
    }
]

def test_query(question, expected_complexity, expected_model, description):
    """Test a single query and validate routing decision"""
    start_time = time.time()
    
    try:
        response = requests.post(
            TEST_ENDPOINT,
            json={
                "question": question,
                "sessionId": f"test_{int(time.time())}"
            },
            headers={"Content-Type": "application/json"},
            timeout=30  # 30 second timeout
        )
        
        end_time = time.time()
        response_time = end_time - start_time
        
        if response.status_code == 200:
            data = response.json()
            
            # Extract routing info from contextUsed 
            context_info = data.get("contextUsed", [""])[0]
            actual_model = "gpt-4o" if "gpt-4o)" in context_info and "gpt-4o-mini)" not in context_info else "gpt-4o-mini"
            actual_complexity = "detailed" if "detailed" in context_info else "simple"
            
            # Validation
            model_correct = actual_model == expected_model
            complexity_correct = actual_complexity == expected_complexity
            has_response = len(data.get("response", "")) > 10
            
            # Performance thresholds
            performance_ok = (
                (expected_complexity == "simple" and response_time < 15.0) or
                (expected_complexity == "detailed" and response_time < 25.0)
            )
            
            return {
                "question": question,
                "description": description,
                "expected_complexity": expected_complexity,
                "actual_complexity": actual_complexity,
                "expected_model": expected_model,
                "actual_model": actual_model,
                "response_time": round(response_time, 2),
                "response_length": len(data.get("response", "")),
                "model_correct": model_correct,
                "complexity_correct": complexity_correct,
                "has_response": has_response,
                "performance_ok": performance_ok,
                "success": model_correct and complexity_correct and has_response and performance_ok,
                "response_preview": data.get("response", "")[:100] + "..." if len(data.get("response", "")) > 100 else data.get("response", ""),
                "context_info": context_info
            }
            
        else:
            return {
                "question": question,
                "description": description,
                "success": False,
                "error": f"HTTP {response.status_code}: {response.text}",
                "response_time": round(response_time, 2)
            }
            
    except Exception as e:
        return {
            "question": question, 
            "description": description,
            "success": False,
            "error": str(e),
            "response_time": round(time.time() - start_time, 2)
        }

def run_comprehensive_tests():
    """Run all test cases and generate detailed report"""
    print("🧪 AI-Powered Chat Routing - Comprehensive Test Suite")
    print("=" * 60)
    print(f"🕐 Test started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🎯 Testing endpoint: {TEST_ENDPOINT}")
    print()
    
    all_results = []
    total_tests = sum(len(category["tests"]) for category in TEST_CASES)
    test_count = 0
    
    for category_data in TEST_CASES:
        category = category_data["category"]
        tests = category_data["tests"]
        
        print(f"📋 {category}")
        print("-" * 40)
        
        category_results = []
        
        for test in tests:
            test_count += 1
            print(f"  [{test_count}/{total_tests}] Testing: {test['description']}")
            
            result = test_query(
                test["question"],
                test["expected_complexity"], 
                test["expected_model"],
                test["description"]
            )
            
            category_results.append(result)
            all_results.append(result)
            
            # Print result
            if result["success"]:
                print(f"    ✅ PASS - {result['response_time']}s | {result['actual_model']} | {result['response_length']} chars")
            else:
                print(f"    ❌ FAIL - {result.get('error', 'Unknown error')}")
            
            # Small delay between tests
            time.sleep(1)
        
        print()
    
    # Generate summary report
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed_tests = [r for r in all_results if r["success"]]
    failed_tests = [r for r in all_results if not r["success"]]
    
    print(f"✅ Passed: {len(passed_tests)}/{total_tests} ({len(passed_tests)/total_tests*100:.1f}%)")
    print(f"❌ Failed: {len(failed_tests)}/{total_tests} ({len(failed_tests)/total_tests*100:.1f}%)")
    print()
    
    if passed_tests:
        simple_tests = [r for r in passed_tests if r.get("expected_complexity") == "simple"]
        detailed_tests = [r for r in passed_tests if r.get("expected_complexity") == "detailed"]
        
        if simple_tests:
            avg_simple_time = sum(r["response_time"] for r in simple_tests) / len(simple_tests)
            print(f"⚡ Simple queries avg: {avg_simple_time:.2f}s (GPT-4o-mini)")
            
        if detailed_tests:
            avg_detailed_time = sum(r["response_time"] for r in detailed_tests) / len(detailed_tests)
            print(f"🧠 Detailed queries avg: {avg_detailed_time:.2f}s (GPT-4o)")
    
    print()
    
    # Show failures if any
    if failed_tests:
        print("❌ FAILED TESTS:")
        print("-" * 30)
        for result in failed_tests:
            print(f"  • {result['description']}: {result.get('error', 'Unknown error')}")
        print()
    
    # Show routing accuracy
    routing_tests = [r for r in all_results if r["success"]]
    if routing_tests:
        correct_model = len([r for r in routing_tests if r["model_correct"]])
        correct_complexity = len([r for r in routing_tests if r["complexity_correct"]])
        
        print(f"🎯 Model routing accuracy: {correct_model}/{len(routing_tests)} ({correct_model/len(routing_tests)*100:.1f}%)")
        print(f"🎯 Complexity classification: {correct_complexity}/{len(routing_tests)} ({correct_complexity/len(routing_tests)*100:.1f}%)")
        print()
    
    # Show sample responses
    print("📝 SAMPLE RESPONSES:")
    print("-" * 30)
    for result in all_results[:3]:  # Show first 3 responses
        if result["success"]:
            print(f"Q: {result['question']}")
            print(f"A: {result['response_preview']}")
            print(f"   [{result['actual_model']} | {result['response_time']}s]")
            print()
    
    return {
        "total_tests": total_tests,
        "passed": len(passed_tests),
        "failed": len(failed_tests),
        "success_rate": len(passed_tests) / total_tests * 100,
        "results": all_results
    }

if __name__ == "__main__":
    # Check if backend is running
    try:
        health_check = requests.get(f"{BASE_URL}/health", timeout=5)
        if health_check.status_code != 200:
            print(f"❌ Backend health check failed: {health_check.status_code}")
            exit(1)
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        print("Please ensure the backend is running on http://localhost:8000")
        exit(1)
    
    # Run comprehensive tests
    results = run_comprehensive_tests()
    
    print(f"🏁 Testing complete! Success rate: {results['success_rate']:.1f}%")
