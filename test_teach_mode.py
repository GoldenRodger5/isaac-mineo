#!/usr/bin/env python3
"""
Test script for teaching mode with extended timeouts
"""
import requests
import json
import time

# Configuration
BASE_URL = "https://isaac-mineo-api.onrender.com/api"
# BASE_URL = "http://localhost:8000/api"  # For local testing

def test_teach_mode():
    """Test the teach mode with a complex code example"""
    
    test_code = """
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quicksort(left) + middle + quicksort(right)

# Example usage
numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = quicksort(numbers)
print(f"Original: {numbers}")
print(f"Sorted: {sorted_numbers}")
"""
    
    payload = {
        "code": test_code,
        "mode": "teach",
        "file_context": {
            "path": "quicksort_example.py",
            "language": "python"
        }
    }
    
    print(f"🧪 Testing teach mode at {BASE_URL}/github/explain-code")
    print("📝 Code to explain:")
    print(test_code[:100] + "..." if len(test_code) > 100 else test_code)
    print("\n" + "="*50)
    
    start_time = time.time()
    
    try:
        # Extended timeout for Claude Sonnet 4
        response = requests.post(
            f"{BASE_URL}/github/explain-code",
            json=payload,
            timeout=180,  # 3 minutes timeout
            headers={"Content-Type": "application/json"}
        )
        
        elapsed = time.time() - start_time
        print(f"⏱️  Request completed in {elapsed:.2f} seconds")
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get("success"):
                print("✅ Success!")
                print(f"📖 Explanation length: {len(result['data']['explanation'])} characters")
                print(f"🎯 Mode: {result['data']['mode']}")
                print(f"🤖 Model: {result['data']['model']}")
                
                if result['data'].get('follow_up_questions'):
                    print(f"❓ Follow-up questions: {len(result['data']['follow_up_questions'])}")
                
                print("\n📚 Teaching Explanation:")
                print("-" * 40)
                print(result['data']['explanation'][:500] + "..." if len(result['data']['explanation']) > 500 else result['data']['explanation'])
                
            else:
                print("❌ API returned success=false")
                print(f"Error: {result.get('error', 'Unknown error')}")
        else:
            print(f"❌ HTTP Error {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.Timeout:
        elapsed = time.time() - start_time
        print(f"⏰ Request timed out after {elapsed:.2f} seconds")
        print("💡 Consider increasing timeout or optimizing backend")
        
    except requests.exceptions.RequestException as e:
        elapsed = time.time() - start_time
        print(f"❌ Request failed after {elapsed:.2f} seconds")
        print(f"Error: {e}")

if __name__ == "__main__":
    test_teach_mode()
