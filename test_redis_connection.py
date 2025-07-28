#!/usr/bin/env python3
"""
Redis Connection Test for Isaac Mineo Backend
Tests the exact Redis configuration that will be used in production
"""

import redis
import json
import os
import sys
from datetime import datetime

# Set the Redis URL directly for testing
REDIS_URL = "redis://default:BlBhCZlOmDMCSAGcQQjA2kIh6WOFUzhR@redis-11729.c320.us-east-1-mz.ec2.redns.redis-cloud.com:11729"

def test_redis_connection():
    """Test Redis connection with production credentials"""
    print("🔧 TESTING REDIS CONNECTION")
    print("=" * 50)
    
    try:
        # Create Redis client with same settings as cache manager
        print(f"Connecting to: {REDIS_URL[:50]}...")
        
        redis_client = redis.from_url(
            REDIS_URL,
            decode_responses=True,
            socket_timeout=10,
            socket_connect_timeout=10,
            retry_on_timeout=True,
            health_check_interval=30
        )
        
        # Test 1: Basic connection
        print("\n📋 Test 1: Basic Connection")
        ping_result = redis_client.ping()
        print(f"✅ Ping successful: {ping_result}")
        
        # Test 2: Basic operations
        print("\n📋 Test 2: Basic Set/Get Operations")
        redis_client.set("test:basic", "hello_redis", ex=60)
        basic_result = redis_client.get("test:basic")
        print(f"✅ Basic operations: {basic_result}")
        
        # Test 3: Session-like data (what our app will use)
        print("\n📋 Test 3: Session Data Storage")
        session_data = {
            "messages": [
                {"role": "user", "content": "Tell me about Nutrivize", "timestamp": datetime.now().timestamp(), "entities": {"projects": ["nutrivize"]}},
                {"role": "assistant", "content": "Nutrivize is a nutrition tracking app...", "timestamp": datetime.now().timestamp()}
            ],
            "lastUpdated": datetime.now().timestamp(),
            "entities": {"projects": ["nutrivize"], "topics": [], "skills": [], "companies": []}
        }
        
        session_id = "test_session_12345"
        redis_client.setex(f"session:{session_id}", 3600, json.dumps(session_data))
        retrieved_data = redis_client.get(f"session:{session_id}")
        
        if retrieved_data:
            parsed_data = json.loads(retrieved_data)
            print(f"✅ Session storage: {len(parsed_data['messages'])} messages stored")
            print(f"✅ Session entities: {parsed_data['entities']}")
        
        # Test 4: Response caching
        print("\n📋 Test 4: Response Caching")
        cache_key = "response:test_question_hash"
        cached_response = {
            "response": "Test cached response",
            "timestamp": datetime.now().timestamp(),
            "searchSuccessful": True
        }
        
        redis_client.setex(cache_key, 1800, json.dumps(cached_response))
        retrieved_cache = redis_client.get(cache_key)
        
        if retrieved_cache:
            parsed_cache = json.loads(retrieved_cache)
            print(f"✅ Response caching: {parsed_cache['response'][:50]}...")
        
        # Test 5: Cleanup
        print("\n📋 Test 5: Cleanup")
        redis_client.delete("test:basic", f"session:{session_id}", cache_key)
        print("✅ Test data cleaned up")
        
        print("\n🎉 ALL REDIS TESTS PASSED!")
        print("Your Redis connection is working perfectly!")
        print("\nNext steps:")
        print("1. Set this REDIS_URL in your Render environment variables")
        print("2. Redeploy your backend")
        print("3. Test the production chatbot")
        
        return True
        
    except redis.AuthenticationError as e:
        print(f"❌ Authentication failed: {e}")
        print("Check username/password in the Redis URL")
        return False
    except redis.ConnectionError as e:
        print(f"❌ Connection failed: {e}")
        print("Check host/port/network connectivity")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = test_redis_connection()
    sys.exit(0 if success else 1)
