"""
Authentication Middleware for Code Explainer
Handles JWT authentication, rate limiting, and security checks
"""

from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import time
from typing import Optional

from app.services.auth_service import auth_service
from app.services.error_handler import error_handler


class AuthMiddleware(BaseHTTPMiddleware):
    """Middleware for authentication and rate limiting"""
    
    def __init__(self, app):
        super().__init__(app)
        self.protected_paths = [
            "/api/github/repos",
            "/api/github/repo",
        ]
        self.public_paths = [
            "/api/github/explain-code",  # Make public for now
            "/api/github/health",
            "/api/github/supported-extensions",
            "/api/analytics/track",  # Analytics tracking
            "/api/analytics/public/metrics",  # Public analytics (corrected path)
            "/api/analytics/admin/dashboard",  # Admin analytics (uses internal auth)
            "/api/analytics/admin/test",  # Admin test endpoint
            "/health",
            "/docs",
            "/openapi.json"
        ]

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Get client IP
        client_ip = self.get_client_ip(request)
        
        try:
            # Check if path requires authentication
            if self.requires_auth(request.url.path):
                # Verify authentication
                await self.verify_authentication(request, client_ip)
            
            # Check rate limits for all requests
            await self.check_rate_limits(request, client_ip)
            
            # Process request
            response = await call_next(request)
            
            # Add security headers
            self.add_security_headers(response)
            
            # Log request
            process_time = time.time() - start_time
            await self.log_request(request, response, process_time, client_ip)
            
            return response
            
        except HTTPException as e:
            return JSONResponse(
                status_code=e.status_code,
                content={"detail": e.detail, "timestamp": time.time()}
            )
        except Exception as e:
            error_handler.log_error(e, {
                "middleware": "AuthMiddleware",
                "path": request.url.path,
                "client_ip": client_ip
            })
            return JSONResponse(
                status_code=500,
                content={"detail": "Internal server error", "timestamp": time.time()}
            )

    def get_client_ip(self, request: Request) -> str:
        """Extract client IP address"""
        # Check for forwarded IP headers (for reverse proxies)
        forwarded_ip = request.headers.get("X-Forwarded-For")
        if forwarded_ip:
            return forwarded_ip.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fallback to direct connection IP
        if request.client and hasattr(request.client, 'host'):
            return request.client.host
        
        return "unknown"

    def requires_auth(self, path: str) -> bool:
        """Check if path requires authentication"""
        # Check if explicitly public
        for public_path in self.public_paths:
            if path.startswith(public_path):
                return False
        
        # Check if explicitly protected
        for protected_path in self.protected_paths:
            if path.startswith(protected_path):
                return True
        
        # Default to requiring auth for API endpoints
        return path.startswith("/api/")

    async def verify_authentication(self, request: Request, client_ip: str):
        """Verify user authentication"""
        # Check for API key in headers
        api_key = request.headers.get("X-API-Key")
        if api_key:
            await self.verify_api_key_auth(api_key, client_ip)
            return
        
        # Check for JWT token
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]  # Remove "Bearer " prefix
            await self.verify_jwt_auth(token, client_ip)
            return
        
        # For now, allow unauthenticated access but track usage
        # In production, you might want to require authentication
        user_id = f"anonymous_{client_ip}"
        request.state.user_id = user_id
        request.state.authenticated = False

    async def verify_api_key_auth(self, api_key: str, client_ip: str):
        """Verify API key authentication"""
        # For demo purposes, accept any API key that looks valid
        if len(api_key) < 32:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid API key format"
            )
        
        # In production, verify against user database
        user_id = f"api_user_{api_key[:8]}"
        
        # Check auth rate limits
        if not await auth_service.check_rate_limit(user_id, "auth_attempts", client_ip):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many authentication attempts"
            )

    async def verify_jwt_auth(self, token: str, client_ip: str):
        """Verify JWT token authentication"""
        try:
            payload = await auth_service.verify_token(token)
            user_id = payload.get("sub")
            
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token payload"
                )
            
            # Check auth rate limits
            if not await auth_service.check_rate_limit(user_id, "auth_attempts", client_ip):
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many authentication attempts"
                )
                
        except HTTPException:
            raise
        except Exception as e:
            error_handler.log_error(e, {"function": "verify_jwt_auth"})
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )

    async def check_rate_limits(self, request: Request, client_ip: str):
        """Check various rate limits"""
        user_id = getattr(request.state, 'user_id', f"anonymous_{client_ip}")
        
        # General API rate limiting
        if not await auth_service.check_rate_limit(user_id, "api_requests", client_ip):
            rate_info = await auth_service.get_rate_limit_info(user_id, "api_requests", client_ip)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Limit: {rate_info['limit']} requests per hour",
                headers={"Retry-After": str(rate_info['reset_window'])}
            )
        
        # Specific rate limiting for explanation requests
        if request.url.path.startswith("/api/github/explain-code"):
            if not await auth_service.check_rate_limit(user_id, "explanation_requests", client_ip):
                rate_info = await auth_service.get_rate_limit_info(user_id, "explanation_requests", client_ip)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Explanation rate limit exceeded. Limit: {rate_info['limit']} explanations per hour",
                    headers={"Retry-After": str(rate_info['reset_window'])}
                )

    def add_security_headers(self, response):
        """Add security headers to response"""
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"

    async def log_request(self, request: Request, response, process_time: float, client_ip: str):
        """Log request for monitoring"""
        try:
            log_data = {
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "process_time": round(process_time, 3),
                "client_ip": client_ip,
                "user_agent": request.headers.get("User-Agent", ""),
                "user_id": getattr(request.state, 'user_id', 'unknown'),
                "authenticated": getattr(request.state, 'authenticated', False)
            }
            
            # Log slow requests
            if process_time > 5.0:
                error_handler.log_error(
                    Exception(f"Slow request: {process_time}s"),
                    log_data
                )
                
        except Exception as e:
            error_handler.log_error(e, {"function": "log_request"})


security = HTTPBearer(auto_error=False)
