"""
Performance monitoring router
Provides endpoints for performance metrics and optimization insights
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import time

from app.services.enhanced_performance_service import enhanced_performance_service
from app.services.error_handler import error_handler

router = APIRouter()

@router.get("/performance/metrics")
async def get_performance_metrics():
    """Get comprehensive performance metrics"""
    try:
        start_time = time.time()
        
        # Get performance insights
        insights = await enhanced_performance_service.get_performance_insights()
        
        # Add request processing time
        processing_time = time.time() - start_time
        insights["meta"] = {
            "request_processing_time_ms": round(processing_time * 1000, 2),
            "timestamp": time.time()
        }
        
        return insights
        
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/performance/metrics"})
        raise HTTPException(status_code=500, detail="Failed to retrieve performance metrics")

@router.get("/performance/cache/stats")
async def get_cache_statistics():
    """Get detailed cache statistics"""
    try:
        cache_stats = {
            "memory_cache": {
                "size": len(enhanced_performance_service.memory_cache),
                "max_size": enhanced_performance_service.max_memory_cache_size,
                "hit_rate": enhanced_performance_service.metrics.get("memory_cache_hits", 0),
                "entries": list(enhanced_performance_service.memory_cache.keys())[:10]  # First 10 keys
            },
            "access_patterns": {
                "total_patterns": len(enhanced_performance_service.access_patterns),
                "active_patterns": len([
                    key for key, accesses in enhanced_performance_service.access_patterns.items()
                    if accesses and time.time() - max(accesses) < 3600  # Active in last hour
                ])
            },
            "performance_metrics": enhanced_performance_service.metrics
        }
        
        return cache_stats
        
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/performance/cache/stats"})
        raise HTTPException(status_code=500, detail="Failed to retrieve cache statistics")

@router.post("/performance/optimize")
async def trigger_optimization():
    """Trigger performance optimization routines"""
    try:
        start_time = time.time()
        
        # Clean up old performance data
        await enhanced_performance_service.cleanup_old_performance_data()
        
        # Get optimization recommendations
        recommendations = enhanced_performance_service.get_optimization_recommendations()
        
        processing_time = time.time() - start_time
        
        return {
            "status": "optimization_completed",
            "processing_time_ms": round(processing_time * 1000, 2),
            "recommendations": recommendations,
            "actions_taken": [
                "Cleaned up old performance data",
                "Updated access patterns",
                "Generated optimization recommendations"
            ]
        }
        
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/performance/optimize"})
        raise HTTPException(status_code=500, detail="Optimization failed")

@router.delete("/performance/cache/clear")
async def clear_performance_caches():
    """Clear all performance-related caches"""
    try:
        # Clear memory cache
        cache_size_before = len(enhanced_performance_service.memory_cache)
        enhanced_performance_service.memory_cache.clear()
        
        # Clear access patterns
        patterns_before = len(enhanced_performance_service.access_patterns)
        enhanced_performance_service.access_patterns.clear()
        
        # Reset metrics (keep cumulative counters)
        metrics_to_reset = ["concurrent_requests", "request_queue_size"]
        for metric in metrics_to_reset:
            enhanced_performance_service.metrics[metric] = 0
        
        return {
            "status": "caches_cleared",
            "cleared": {
                "memory_cache_entries": cache_size_before,
                "access_patterns": patterns_before,
                "metrics_reset": len(metrics_to_reset)
            }
        }
        
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/performance/cache/clear"})
        raise HTTPException(status_code=500, detail="Failed to clear caches")

@router.get("/performance/health")
async def performance_health_check():
    """Get performance-focused health check"""
    try:
        current_time = time.time()
        
        # Calculate recent performance
        recent_requests = [t for t in enhanced_performance_service.request_times 
                          if current_time - t < 300]  # Last 5 minutes
        
        avg_response_time = sum(recent_requests) / len(recent_requests) if recent_requests else 0
        
        # Determine health status
        health_status = "healthy"
        warnings = []
        
        if avg_response_time > 1.0:  # 1 second
            health_status = "degraded"
            warnings.append("High average response time")
        
        if len(enhanced_performance_service.memory_cache) > enhanced_performance_service.max_memory_cache_size * 0.9:
            warnings.append("Memory cache near capacity")
        
        if enhanced_performance_service.metrics["concurrent_requests"] > 20:
            warnings.append("High concurrent request load")
        
        return {
            "status": health_status,
            "timestamp": current_time,
            "metrics": {
                "avg_response_time_ms": round(avg_response_time * 1000, 2),
                "recent_requests_5min": len(recent_requests),
                "memory_cache_utilization": round(
                    len(enhanced_performance_service.memory_cache) / 
                    enhanced_performance_service.max_memory_cache_size * 100, 1
                ),
                "concurrent_requests": enhanced_performance_service.metrics["concurrent_requests"]
            },
            "warnings": warnings
        }
        
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/performance/health"})
        raise HTTPException(status_code=500, detail="Performance health check failed")

@router.get("/performance/insights")
async def get_performance_insights():
    """Get AI-powered performance insights and recommendations"""
    try:
        insights = await enhanced_performance_service.get_performance_insights()
        
        # Add AI-powered analysis
        ai_insights = generate_ai_performance_insights(insights)
        
        return {
            **insights,
            "ai_insights": ai_insights
        }
        
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/performance/insights"})
        raise HTTPException(status_code=500, detail="Failed to generate performance insights")

def generate_ai_performance_insights(metrics: Dict[str, Any]) -> Dict[str, Any]:
    """Generate AI-powered performance insights"""
    insights = {
        "score": 85,  # Default good score
        "recommendations": [],
        "priority_actions": [],
        "trends": {}
    }
    
    try:
        performance_data = metrics.get("performance", {})
        
        # Analyze response time
        avg_response = performance_data.get("avg_response_time_ms", 0)
        if avg_response > 1000:
            insights["score"] -= 20
            insights["priority_actions"].append({
                "action": "Optimize slow endpoints",
                "impact": "high",
                "effort": "medium"
            })
        
        # Analyze cache hit rate
        cache_hit_rate = float(performance_data.get("cache_hit_rate", 0))
        if cache_hit_rate < 70:
            insights["score"] -= 15
            insights["recommendations"].append(
                "Improve caching strategy - current hit rate is below optimal (70%+)"
            )
        
        # Analyze memory usage
        cache_stats = metrics.get("cache_stats", {})
        memory_size = cache_stats.get("memory_cache_size", 0)
        memory_max = cache_stats.get("memory_cache_max", 100)
        
        if memory_size / memory_max > 0.8:
            insights["recommendations"].append(
                "Memory cache is near capacity - consider increasing size or implementing better eviction"
            )
        
        # Set overall health
        if insights["score"] >= 90:
            insights["health"] = "excellent"
        elif insights["score"] >= 75:
            insights["health"] = "good"
        elif insights["score"] >= 60:
            insights["health"] = "fair"
        else:
            insights["health"] = "needs_attention"
        
    except Exception as e:
        error_handler.log_error(e, {"function": "generate_ai_performance_insights"})
    
    return insights
