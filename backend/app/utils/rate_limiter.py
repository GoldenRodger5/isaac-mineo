import time
from collections import defaultdict
from typing import Dict

class RateLimiter:
    def __init__(self):
        # In-memory rate limiting (can be moved to Redis later)
        self.requests: Dict[str, list] = defaultdict(list)
    
    def check_rate_limit(self, client_ip: str, limit: int = 60, window: int = 3600) -> bool:
        """
        Check if client is within rate limit
        
        Args:
            client_ip: Client IP address
            limit: Maximum requests allowed
            window: Time window in seconds
        
        Returns:
            True if within limit, False if exceeded
        """
        current_time = time.time()
        
        # Clean old requests outside the window
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if current_time - req_time < window
        ]
        
        # Check if limit exceeded
        if len(self.requests[client_ip]) >= limit:
            return False
        
        # Add current request
        self.requests[client_ip].append(current_time)
        return True
    
    def get_request_count(self, client_ip: str, window: int = 3600) -> int:
        """Get current request count for client"""
        current_time = time.time()
        
        # Clean old requests
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if current_time - req_time < window
        ]
        
        return len(self.requests[client_ip])
