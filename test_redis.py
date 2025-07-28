"""
Test Redis connection with the provided credentials
"""
import redis
import os

def test_redis_connection():
    # The Redis URL that should be set in production
    redis_url = "redis://default:BlBhCZlOmDMCSAGcQQjA2kIh6WOFUzhR@redis-11729.c320.us-east-1-mz.ec2.redns.redis-cloud.com:11729"
    
    try:
        print("Testing Redis connection...")
        r = redis.from_url(redis_url, decode_responses=True)
        
        # Test basic connection
        print("Pinging Redis...")
        pong = r.ping()
        print(f"Ping successful: {pong}")
        
        # Test set/get
        print("Testing set/get operations...")
        r.set('test_key', 'test_value')
        result = r.get('test_key')
        print(f"Set/Get test: {result}")
        
        # Test session-like data
        print("Testing session storage...")
        session_data = {
            "messages": [
                {"role": "user", "content": "test message", "timestamp": 1642000000},
                {"role": "assistant", "content": "test response", "timestamp": 1642000001}
            ],
            "lastUpdated": 1642000002
        }
        
        import json
        r.setex('session:test_session', 3600, json.dumps(session_data))
        retrieved = r.get('session:test_session')
        if retrieved:
            parsed_data = json.loads(retrieved)
            print(f"Session storage test successful: {len(parsed_data['messages'])} messages")
        
        print("✅ All Redis tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        return False

if __name__ == "__main__":
    test_redis_connection()
