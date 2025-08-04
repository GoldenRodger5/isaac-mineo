"""
Analytics Router
Handles analytics endpoints for portfolio dashboard
"""

from fastapi import APIRouter, HTTPException, Depends, Request, Header
from typing import Dict, Any, Optional
import json
from datetime import datetime

from app.services.analytics_service import analytics_service
from app.services.auth_service import auth_service, get_current_user_optional
from app.middleware.rate_limiter import RateLimiter
from app.services.error_handler import error_handler

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]
)

# Rate limiters
track_limiter = RateLimiter(max_requests=60, window_seconds=60)  # 60 requests per minute
public_limiter = RateLimiter(max_requests=30, window_seconds=60)  # 30 requests per minute
admin_limiter = RateLimiter(max_requests=100, window_seconds=60)  # 100 requests per minute


def get_client_ip(request: Request) -> str:
    """Safely get client IP address"""
    try:
        # Check for forwarded headers first (common in production)
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        # Check for real IP header
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip
        
        # Fall back to direct client host
        if request.client and hasattr(request.client, 'host'):
            return request.client.host
        
        return "unknown"
    except Exception:
        return "unknown"


@router.post("/track/visitor")
async def track_visitor_endpoint(
    request: Request,
    visitor_data: Optional[Dict[str, Any]] = None
):
    """Track a new visitor"""
    try:
        # Apply rate limiting
        client_ip = get_client_ip(request)
        if not await track_limiter.is_allowed(client_ip):
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        
        # Prepare visitor data
        if not visitor_data:
            visitor_data = {}
        
        # Extract request info
        visitor_data.update({
            'ip': client_ip,
            'user_agent': request.headers.get('user-agent', ''),
            'referrer': request.headers.get('referer', ''),
            'timestamp': datetime.now().isoformat()
        })
        
        # Track the visitor
        visitor_id = await analytics_service.track_visitor(visitor_data)
        
        return {
            'success': True,
            'visitor_id': visitor_id,
            'message': 'Visitor tracked successfully'
        }
        
    except Exception as e:
        error_handler.log_error(e, {
            'endpoint': '/analytics/track/visitor',
            'ip': get_client_ip(request)
        })
        raise HTTPException(status_code=500, detail="Failed to track visitor")


@router.post("/track/page")
async def track_page_view_endpoint(
    request: Request,
    page_data: Dict[str, Any]
):
    """Track page view"""
    try:
        # Apply rate limiting
        client_ip = get_client_ip(request)
        if not await track_limiter.is_allowed(client_ip):
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        
        visitor_id = page_data.get('visitor_id')
        if not visitor_id:
            raise HTTPException(status_code=400, detail="visitor_id required")
        
        # Track page view
        await analytics_service.track_page_view(visitor_id, page_data)
        
        return {
            'success': True,
            'message': 'Page view tracked successfully'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        error_handler.log_error(e, {
            'endpoint': '/analytics/track/page',
            'data': page_data
        })
        raise HTTPException(status_code=500, detail="Failed to track page view")


@router.post("/track/ai-interaction")
async def track_ai_interaction_endpoint(
    request: Request,
    interaction_data: Dict[str, Any]
):
    """Track AI chat interaction"""
    try:
        # Apply rate limiting
        client_ip = get_client_ip(request)
        if not await track_limiter.is_allowed(client_ip):
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        
        visitor_id = interaction_data.get('visitor_id')
        if not visitor_id:
            raise HTTPException(status_code=400, detail="visitor_id required")
        
        # Track AI interaction
        await analytics_service.track_ai_interaction(visitor_id, interaction_data)
        
        return {
            'success': True,
            'message': 'AI interaction tracked successfully'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        error_handler.log_error(e, {
            'endpoint': '/analytics/track/ai-interaction',
            'data': interaction_data
        })
        raise HTTPException(status_code=500, detail="Failed to track AI interaction")


@router.post("/track/project")
async def track_project_interest_endpoint(
    request: Request,
    project_data: Dict[str, Any]
):
    """Track project engagement"""
    try:
        # Apply rate limiting
        client_ip = get_client_ip(request)
        if not await track_limiter.is_allowed(client_ip):
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        
        visitor_id = project_data.get('visitor_id')
        if not visitor_id:
            raise HTTPException(status_code=400, detail="visitor_id required")
        
        # Track project interest
        await analytics_service.track_project_interest(visitor_id, project_data)
        
        return {
            'success': True,
            'message': 'Project interest tracked successfully'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        error_handler.log_error(e, {
            'endpoint': '/analytics/track/project',
            'data': project_data
        })
        raise HTTPException(status_code=500, detail="Failed to track project interest")


@router.post("/track/contact")
async def track_contact_interaction_endpoint(
    request: Request,
    contact_data: Dict[str, Any]
):
    """Track contact form interaction"""
    try:
        # Apply rate limiting
        client_ip = get_client_ip(request)
        if not await track_limiter.is_allowed(client_ip):
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        
        visitor_id = contact_data.get('visitor_id')
        if not visitor_id:
            raise HTTPException(status_code=400, detail="visitor_id required")
        
        # Track contact interaction
        await analytics_service.track_contact_interaction(visitor_id, contact_data)
        
        return {
            'success': True,
            'message': 'Contact interaction tracked successfully'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        error_handler.log_error(e, {
            'endpoint': '/analytics/track/contact',
            'data': contact_data
        })
        raise HTTPException(status_code=500, detail="Failed to track contact interaction")


@router.get("/public/metrics")
async def get_public_metrics_endpoint(request: Request):
    """Get public analytics metrics"""
    try:
        # Apply rate limiting
        client_ip = get_client_ip(request)
        if not await public_limiter.is_allowed(client_ip):
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        
        # Get public metrics
        metrics = await analytics_service.get_public_metrics()
        
        return {
            'success': True,
            'data': metrics
        }
        
    except Exception as e:
        error_handler.log_error(e, {
            'endpoint': '/analytics/public/metrics',
            'ip': get_client_ip(request)
        })
        raise HTTPException(status_code=500, detail="Failed to load public metrics")


@router.get("/admin/test")
async def admin_test_endpoint(request: Request):
    """Simple test endpoint for admin access"""
    auth_header = request.headers.get('authorization', '')
    
    if auth_header.startswith('Bearer '):
        token = auth_header.replace('Bearer ', '')
        if token in ['admin', 'isaac@isaacmineo.com']:
            return {"success": True, "message": "Admin access verified", "user": token}
    
    return {"success": False, "message": "Authentication failed"}


@router.get("/admin/dashboard")
async def get_admin_dashboard_endpoint(request: Request):
    """Get admin analytics dashboard (requires authentication)"""
    try:
        # Apply rate limiting
        client_ip = get_client_ip(request)
        if not await admin_limiter.is_allowed(client_ip):
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        
        # Check for authentication
        auth_header = request.headers.get('authorization', '')
        admin_user_id = None
        
        if auth_header.startswith('Bearer '):
            token = auth_header.replace('Bearer ', '')
            
            # First check for simple admin tokens
            if token in ['admin', 'isaac@isaacmineo.com']:
                admin_user_id = token
            else:
                # Try JWT authentication
                try:
                    payload = await auth_service.verify_token(token)
                    admin_user_id = payload.get('email') or payload.get('user_id') or payload.get('sub')
                except:
                    pass  # JWT verification failed
        
        if not admin_user_id:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        # Get admin analytics
        analytics = await analytics_service.get_admin_analytics(str(admin_user_id))
        
        if 'error' in analytics:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return {
            'success': True,
            'data': analytics
        }
        
    except HTTPException:
        raise
    except Exception as e:
        error_handler.log_error(e, {
            'endpoint': '/analytics/admin/dashboard',
            'user': admin_user_id if 'admin_user_id' in locals() else 'unknown'
        })
        raise HTTPException(status_code=500, detail="Failed to load admin analytics")


@router.get("/admin/visitors")
async def get_visitor_details_endpoint(
    request: Request,
    days: int = 7,
    current_user: Optional[Dict] = Depends(get_current_user_optional)
):
    """Get detailed visitor analytics (admin only)"""
    try:
        # Apply rate limiting
        client_ip = get_client_ip(request)
        if not await admin_limiter.is_allowed(client_ip):
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        
        # Check authentication
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        admin_user_id = current_user.get('email') or current_user.get('user_id')
        
        if not admin_user_id:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
        
        # Verify admin access
        if not await analytics_service._verify_admin_access(str(admin_user_id)):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Get visitor details (placeholder - implement based on needs)
        visitor_data = {
            'period': f"Last {days} days",
            'summary': 'Detailed visitor analytics would be here',
            'note': 'This endpoint can be extended based on specific requirements'
        }
        
        return {
            'success': True,
            'data': visitor_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        error_handler.log_error(e, {
            'endpoint': '/analytics/admin/visitors',
            'user': current_user.get('email') if current_user else 'unknown'
        })
        raise HTTPException(status_code=500, detail="Failed to load visitor details")


@router.get("/admin/export")
async def export_analytics_endpoint(
    request: Request,
    format: str = "json",
    current_user: Optional[Dict] = Depends(get_current_user_optional)
):
    """Export analytics data (admin only)"""
    try:
        # Apply rate limiting
        client_ip = get_client_ip(request)
        if not await admin_limiter.is_allowed(client_ip):
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        
        # Check authentication
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        admin_user_id = current_user.get('email') or current_user.get('user_id')
        
        if not admin_user_id:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
        
        # Verify admin access
        if not await analytics_service._verify_admin_access(str(admin_user_id)):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        if format not in ["json", "csv"]:
            raise HTTPException(status_code=400, detail="Format must be 'json' or 'csv'")
        
        # Get full analytics for export
        analytics = await analytics_service.get_admin_analytics(str(admin_user_id))
        
        return {
            'success': True,
            'format': format,
            'data': analytics,
            'exported_at': datetime.now().isoformat(),
            'note': 'CSV formatting would be implemented for production use'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        error_handler.log_error(e, {
            'endpoint': '/analytics/admin/export',
            'user': current_user.get('email') if current_user else 'unknown'
        })
        raise HTTPException(status_code=500, detail="Failed to export analytics")


@router.get("/health")
async def analytics_health_check():
    """Health check for analytics service"""
    try:
        # Simple health check
        test_metrics = await analytics_service.get_public_metrics()
        
        return {
            'status': 'healthy',
            'service': 'analytics',
            'timestamp': datetime.now().isoformat(),
            'metrics_available': bool(test_metrics)
        }
        
    except Exception as e:
        error_handler.log_error(e, {'endpoint': '/analytics/health'})
        return {
            'status': 'unhealthy',
            'service': 'analytics',
            'timestamp': datetime.now().isoformat(),
            'error': 'Service check failed'
        }
