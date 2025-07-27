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
        """Connect to Redis"""
        if self.connected:
            return
        
        try:
            redis_url = os.getenv("REDIS_URL")
            if redis_url:
                self.redis_client = redis.from_url(redis_url, decode_responses=True)
                # Test connection
                self.redis_client.ping()
                self.connected = True
                print("Connected to Redis")
            else:
                print("No Redis URL provided, using in-memory cache")
                self.redis_client = None
        except Exception as error:
            print(f"Redis connection failed: {error}")
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
    
    async def cache_session(self, session_id: str, messages: list):
        """Cache session data"""
        try:
            if self.redis_client:
                session_data = {
                    "messages": messages,
                    "lastUpdated": time.time()
                }
                self.redis_client.setex(
                    f"session:{session_id}", 
                    3600,  # 1 hour expiry
                    json.dumps(session_data)
                )
        except Exception as error:
            print(f"Error caching session: {error}")
    
    async def get_cached_response(self, question: str) -> Optional[Dict[str, Any]]:
        """Get cached response for a question"""
        try:
            if self.redis_client:
                cache_key = f"response:{hash(question.lower())}"
                data = self.redis_client.get(cache_key)
                return json.loads(data) if data else None
            return None
        except Exception as error:
            print(f"Error getting cached response: {error}")
            return None
    
    async def cache_response(self, question: str, response: str, metadata: Dict[str, Any]):
        """Cache a response"""
        try:
            if self.redis_client:
                cache_key = f"response:{hash(question.lower())}"
                cache_data = {
                    "response": response,
                    "timestamp": time.time(),
                    "metadata": metadata
                }
                self.redis_client.setex(
                    cache_key,
                    1800,  # 30 minutes expiry
                    json.dumps(cache_data)
                )
        except Exception as error:
            print(f"Error caching response: {error}")
