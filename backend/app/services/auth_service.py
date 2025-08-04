"""
Authentication Service for Code Explainer
Provides JWT-based authentication and authorization
"""

import jwt
import os
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from passlib.context import CryptContext
import redis
import json

from app.utils.cache_manager import CacheManager
from app.services.error_handler import error_handler


class AuthService:
    """Service for handling authentication and authorization"""
    
    def __init__(self):
        self.secret_key = os.getenv("JWT_SECRET_KEY", secrets.token_urlsafe(32))
        self.algorithm = "HS256"
        self.access_token_expire_minutes = 60  # 1 hour
        self.refresh_token_expire_days = 30   # 30 days
        
        # Password hashing
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        # Cache for token blacklist and rate limiting
        self.cache_manager = CacheManager()
        
        # Rate limiting configuration
        self.rate_limits = {
            "explanation_requests": {"limit": 50, "window": 3600},  # 50 per hour
            "auth_attempts": {"limit": 5, "window": 900},           # 5 per 15 minutes
            "api_requests": {"limit": 200, "window": 3600}          # 200 per hour
        }

    async def create_access_token(self, data: Dict[str, Any]) -> str:
        """Create JWT access token"""
        try:
            to_encode = data.copy()
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
            to_encode.update({"exp": expire, "type": "access"})
            
            encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
            return encoded_jwt
        except Exception as e:
            error_handler.log_error(e, {"function": "create_access_token"})
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not create access token"
            )

    async def create_refresh_token(self, data: Dict[str, Any]) -> str:
        """Create JWT refresh token"""
        try:
            to_encode = data.copy()
            expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
            to_encode.update({"exp": expire, "type": "refresh"})
            
            encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
            return encoded_jwt
        except Exception as e:
            error_handler.log_error(e, {"function": "create_refresh_token"})
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not create refresh token"
            )

    async def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify and decode JWT token"""
        try:
            # Check if token is blacklisted
            if await self.is_token_blacklisted(token):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has been revoked"
                )
            
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.JWTError as e:
            error_handler.log_error(e, {"function": "verify_token"})
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )

    async def blacklist_token(self, token: str) -> None:
        """Add token to blacklist"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm], options={"verify_exp": False})
            exp = payload.get("exp")
            if exp:
                # Calculate TTL based on token expiration
                exp_datetime = datetime.fromtimestamp(exp)
                ttl = int((exp_datetime - datetime.utcnow()).total_seconds())
                if ttl > 0:
                    await self.cache_manager.set(f"blacklist:{token}", "true", expire=ttl)
        except Exception as e:
            error_handler.log_error(e, {"function": "blacklist_token"})

    async def is_token_blacklisted(self, token: str) -> bool:
        """Check if token is blacklisted"""
        try:
            result = await self.cache_manager.get(f"blacklist:{token}")
            return result is not None
        except Exception:
            return False

    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        return self.pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return self.pwd_context.verify(plain_password, hashed_password)

    async def check_rate_limit(self, identifier: str, action: str, ip_address: Optional[str] = None) -> bool:
        """Check if action is within rate limits"""
        try:
            if action not in self.rate_limits:
                return True
            
            rate_config = self.rate_limits[action]
            
            # Create unique key for rate limiting
            rate_key = f"rate_limit:{action}:{identifier}"
            if ip_address:
                rate_key += f":{ip_address}"
            
            # Get current count
            current_count = await self.cache_manager.get(rate_key)
            current_count = int(current_count) if current_count else 0
            
            if current_count >= rate_config["limit"]:
                return False
            
            # Increment counter
            await self.cache_manager.set(
                rate_key, 
                str(current_count + 1), 
                expire=rate_config["window"]
            )
            
            return True
        except Exception as e:
            error_handler.log_error(e, {"function": "check_rate_limit", "action": action})
            return True  # Allow on error to prevent blocking legitimate requests

    async def get_rate_limit_info(self, identifier: str, action: str, ip_address: Optional[str] = None) -> Dict[str, Any]:
        """Get current rate limit information"""
        try:
            if action not in self.rate_limits:
                return {"allowed": True, "remaining": float('inf')}
            
            rate_config = self.rate_limits[action]
            rate_key = f"rate_limit:{action}:{identifier}"
            if ip_address:
                rate_key += f":{ip_address}"
            
            current_count = await self.cache_manager.get(rate_key)
            current_count = int(current_count) if current_count else 0
            
            remaining = max(0, rate_config["limit"] - current_count)
            
            return {
                "allowed": current_count < rate_config["limit"],
                "limit": rate_config["limit"],
                "remaining": remaining,
                "reset_window": rate_config["window"]
            }
        except Exception as e:
            error_handler.log_error(e, {"function": "get_rate_limit_info"})
            return {"allowed": True, "remaining": float('inf')}

    def generate_api_key(self, user_id: str) -> str:
        """Generate API key for user"""
        # Create deterministic but secure API key
        data = f"{user_id}:{self.secret_key}:{datetime.utcnow().date()}"
        return hashlib.sha256(data.encode()).hexdigest()

    async def verify_api_key(self, api_key: str, user_id: str) -> bool:
        """Verify API key for user"""
        try:
            expected_key = self.generate_api_key(user_id)
            return secrets.compare_digest(api_key, expected_key)
        except Exception as e:
            error_handler.log_error(e, {"function": "verify_api_key"})
            return False

    def sanitize_code_input(self, code: str) -> str:
        """Sanitize code input to prevent injection attacks"""
        if not code:
            return ""
        
        # Remove potentially dangerous patterns
        dangerous_patterns = [
            r'<script.*?>.*?</script>',
            r'javascript:',
            r'data:text/html',
            r'eval\s*\(',
            r'Function\s*\(',
            r'setTimeout\s*\(',
            r'setInterval\s*\('
        ]
        
        import re
        sanitized = code
        for pattern in dangerous_patterns:
            sanitized = re.sub(pattern, '[REMOVED_FOR_SECURITY]', sanitized, flags=re.IGNORECASE | re.DOTALL)
        
        # Limit code size (prevent DoS)
        max_size = 100000  # 100KB
        if len(sanitized) > max_size:
            sanitized = sanitized[:max_size] + "\n\n... [TRUNCATED FOR SIZE LIMIT]"
        
        return sanitized


# Global auth service instance
auth_service = AuthService()


async def get_current_user_optional(authorization: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Optional authentication dependency - returns user if valid token provided, None otherwise
    """
    if not authorization:
        return None
    
    try:
        # Handle Bearer token format
        if authorization.startswith("Bearer "):
            token = authorization.replace("Bearer ", "")
        else:
            token = authorization
        
        # Verify token
        user = await auth_service.verify_token(token)
        return user
    except Exception:
        # Return None if token is invalid instead of raising exception
        return None
