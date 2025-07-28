import redis
import json
import os
from typing import Optional, Dict, Any
import time

class CacheManager:
    def __init__(self):
        self.redis_client = None
        self.connected = False
    
    async def connect(self):
        """Connect to Redis with enhanced error handling"""
        if self.connected:
            return
        
        try:
            redis_url = os.getenv("REDIS_URL")
            print(f"Attempting Redis connection with URL: {redis_url[:50]}..." if redis_url else "No REDIS_URL found")
            
            if redis_url:
                # Enhanced Redis connection with timeout and retry settings
                self.redis_client = redis.from_url(
                    redis_url, 
                    decode_responses=True,
                    socket_timeout=10,
                    socket_connect_timeout=10,
                    retry_on_timeout=True,
                    health_check_interval=30
                )
                # Test connection
                ping_result = self.redis_client.ping()
                self.connected = True
                print(f"✅ Connected to Redis successfully - Ping: {ping_result}")
                
                # Test basic operations
                self.redis_client.set("test:connection", "success", ex=60)
                test_result = self.redis_client.get("test:connection")
                print(f"✅ Redis operations test: {test_result}")
                
            else:
                print("❌ No Redis URL provided in environment variables")
                self.redis_client = None
        except redis.AuthenticationError as error:
            print(f"❌ Redis authentication error: {error}")
            self.redis_client = None
        except redis.ConnectionError as error:
            print(f"❌ Redis connection error: {error}")
            self.redis_client = None
        except Exception as error:
            print(f"❌ Redis connection failed: {error}")
            self.redis_client = None
    
    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session data"""
        try:
            if self.redis_client:
                data = self.redis_client.get(f"session:{session_id}")
                return json.loads(data) if data else None
            return None
        except Exception as error:
            print(f"Error getting session: {error}")
            return None
    
    async def cache_session(self, session_id: str, session_data: Dict[str, Any]):
        """Cache complete session data including entities"""
        try:
            if self.redis_client:
                # Update timestamp
                session_data["lastUpdated"] = time.time()
                self.redis_client.setex(
                    f"session:{session_id}", 
                    3600,  # 1 hour expiry
                    json.dumps(session_data)
                )
        except Exception as error:
            print(f"Error caching session: {error}")
    
    async def get_cached_response(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get cached response for a cache key"""
        try:
            if self.redis_client:
                cache_redis_key = f"response:{hash(cache_key)}"
                data = self.redis_client.get(cache_redis_key)
                return json.loads(data) if data else None
            return None
        except Exception as error:
            print(f"Error getting cached response: {error}")
            return None

    async def cache_response(self, cache_key: str, response: str, metadata: Dict[str, Any]):
        """Cache a response"""
        try:
            if self.redis_client:
                cache_redis_key = f"response:{hash(cache_key)}"
                cache_data = {
                    "response": response,
                    "timestamp": time.time(),
                    "metadata": metadata
                }
                self.redis_client.setex(
                    cache_redis_key,
                    1800,  # 30 minutes expiry
                    json.dumps(cache_data)
                )
        except Exception as error:
            print(f"Error caching response: {error}")
