"""
Authentication Router for Code Explainer
Provides JWT-based authentication endpoints
"""

from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any
import secrets
import time
import re

from app.services.auth_service import auth_service
from app.services.error_handler import error_handler

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()


class LoginRequest(BaseModel):
    """Login request model"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=100)


class RegisterRequest(BaseModel):
    """Registration request model"""
    username: str = Field(..., min_length=3, max_length=50)
    email: str
    password: str = Field(..., min_length=6, max_length=100)
    full_name: Optional[str] = Field(None, max_length=100)
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', v):
            raise ValueError('Invalid email format')
        return v


class TokenResponse(BaseModel):
    """Token response model"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    """Refresh token request model"""
    refresh_token: str


class RateLimitInfo(BaseModel):
    """Rate limit information model"""
    allowed: bool
    limit: int
    remaining: int
    reset_window: int


def get_client_ip(request: Request) -> str:
    """Extract client IP address from request"""
    # Check for forwarded headers first (for proxies/load balancers)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fallback to direct client IP
    return request.client.host if request.client else "unknown"


@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest, http_request: Request):
    """Register a new user"""
    try:
        client_ip = get_client_ip(http_request)
        
        # Check rate limits for registration attempts
        if not await auth_service.check_rate_limit(client_ip, "auth_attempts", client_ip):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many registration attempts. Please try again later."
            )
        
        # For demo purposes, we'll use a simple in-memory user store
        # In production, this would connect to a real database
        user_data = {
            "user_id": f"user_{secrets.token_urlsafe(8)}",
            "username": request.username,
            "email": request.email,
            "full_name": request.full_name,
            "created_at": time.time()
        }
        
        # Create tokens
        access_token = await auth_service.create_access_token(user_data)
        refresh_token = await auth_service.create_refresh_token(user_data)
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=auth_service.access_token_expire_minutes * 60
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/auth/register", "username": request.username})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again."
        )


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, http_request: Request):
    """Authenticate user and return tokens"""
    try:
        client_ip = get_client_ip(http_request)
        
        # Check rate limits for login attempts
        if not await auth_service.check_rate_limit(client_ip, "auth_attempts", client_ip):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many login attempts. Please try again later."
            )
        
        # For demo purposes, accept any username/password combination
        # In production, this would verify against a real user database
        if len(request.username) < 3 or len(request.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password"
            )
        
        user_data = {
            "user_id": f"user_{secrets.token_urlsafe(8)}",
            "username": request.username,
            "login_time": time.time()
        }
        
        # Create tokens
        access_token = await auth_service.create_access_token(user_data)
        refresh_token = await auth_service.create_refresh_token(user_data)
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=auth_service.access_token_expire_minutes * 60
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/auth/login", "username": request.username})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Please try again."
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest, http_request: Request):
    """Refresh access token using refresh token"""
    try:
        client_ip = get_client_ip(http_request)
        
        # Verify refresh token
        payload = await auth_service.verify_token(request.refresh_token)
        
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        # Create new access token with same user data
        user_data = {k: v for k, v in payload.items() if k not in ["exp", "type"]}
        access_token = await auth_service.create_access_token(user_data)
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=request.refresh_token,  # Keep the same refresh token
            expires_in=auth_service.access_token_expire_minutes * 60
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/auth/refresh"})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )


@router.post("/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Logout user and blacklist token"""
    try:
        token = credentials.credentials
        
        # Add token to blacklist
        await auth_service.blacklist_token(token)
        
        return {"message": "Successfully logged out"}
        
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/auth/logout"})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )


@router.get("/rate-limit/{action}", response_model=RateLimitInfo)
async def get_rate_limit_info(action: str, http_request: Request):
    """Get rate limit information for a specific action"""
    try:
        client_ip = get_client_ip(http_request)
        
        rate_info = await auth_service.get_rate_limit_info(client_ip, action, client_ip)
        
        return RateLimitInfo(
            allowed=rate_info.get("allowed", True),
            limit=rate_info.get("limit", 0),
            remaining=rate_info.get("remaining", 0),
            reset_window=rate_info.get("reset_window", 0)
        )
        
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/auth/rate-limit", "action": action})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get rate limit information"
        )


@router.get("/me")
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user information"""
    try:
        token = credentials.credentials
        payload = await auth_service.verify_token(token)
        
        # Remove sensitive fields
        user_info = {k: v for k, v in payload.items() if k not in ["exp", "type"]}
        
        return {
            "success": True,
            "data": user_info
        }
        
    except HTTPException:
        raise
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/auth/me"})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user information"
        )


@router.get("/health")
async def auth_health():
    """Health check for authentication service"""
    try:
        # Test cache connection
        test_result = await auth_service.check_rate_limit("health_check", "api_requests")
        
        return {
            "success": True,
            "status": "healthy",
            "data": {
                "cache_connected": True,
                "rate_limiting_active": test_result is not None,
                "supported_actions": list(auth_service.rate_limits.keys())
            }
        }
        
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/auth/health"})
        return {
            "success": False,
            "status": "unhealthy",
            "message": str(e)
        }
