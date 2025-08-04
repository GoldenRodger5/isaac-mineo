"""
Rate Limiter Middleware
Provides rate limiting functionality for API endpoints
"""

import time
from typing import Dict, Optional
from app.utils.cache_manager import CacheManager


class RateLimiter:
    """Simple rate limiter using cache storage"""
    
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.cache_manager = CacheManager()
    
    async def is_allowed(self, identifier: str) -> bool:
        """Check if request is allowed for the given identifier"""
        try:
            key = f"rate_limit:{identifier}"
            current_time = int(time.time())
            window_start = current_time - self.window_seconds
            
            # Get current request count in the window
            cached_data = await self.cache_manager.get(key)
            
            if cached_data:
                requests = [t for t in eval(cached_data) if t > window_start]
            else:
                requests = []
            
            # Check if we're within the limit
            if len(requests) >= self.max_requests:
                return False
            
            # Add current request timestamp
            requests.append(current_time)
            
            # Store updated requests list
            await self.cache_manager.set(
                key, 
                str(requests), 
                expire=self.window_seconds
            )
            
            return True
            
        except Exception:
            # On error, allow the request (fail open)
            return True
    
    async def get_remaining_requests(self, identifier: str) -> int:
        """Get remaining requests for the identifier"""
        try:
            key = f"rate_limit:{identifier}"
            current_time = int(time.time())
            window_start = current_time - self.window_seconds
            
            cached_data = await self.cache_manager.get(key)
            
            if cached_data:
                requests = [t for t in eval(cached_data) if t > window_start]
                return max(0, self.max_requests - len(requests))
            else:
                return self.max_requests
                
        except Exception:
            return self.max_requests
    
    async def reset_limit(self, identifier: str) -> None:
        """Reset rate limit for identifier"""
        try:
            key = f"rate_limit:{identifier}"
            await self.cache_manager.delete(key)
        except Exception:
            pass
