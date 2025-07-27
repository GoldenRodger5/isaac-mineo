import logging
import time
from typing import Dict, Any, Optional
from datetime import datetime
import json
import os

class ErrorHandler:
    """Centralized error handling and logging system"""
    
    def __init__(self):
        self.setup_logging()
        self.error_counts = {}
        self.performance_metrics = {}
    
    def setup_logging(self):
        """Configure logging for the application"""
        log_level = logging.DEBUG if os.getenv("DEBUG", "false").lower() == "true" else logging.INFO
        
        logging.basicConfig(
            level=log_level,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler(),
                logging.FileHandler('app.log') if os.getenv("ENVIRONMENT") != "production" else logging.StreamHandler()
            ]
        )
        
        self.logger = logging.getLogger(__name__)
    
    def log_error(self, error: Exception, context: Dict[str, Any] = None) -> str:
        """Log an error with context and return error ID"""
        error_id = f"err_{int(time.time())}_{hash(str(error)) % 10000}"
        
        error_data = {
            "error_id": error_id,
            "timestamp": datetime.now().isoformat(),
            "error_type": type(error).__name__,
            "error_message": str(error),
            "context": context or {}
        }
        
        # Count error types
        error_type = type(error).__name__
        self.error_counts[error_type] = self.error_counts.get(error_type, 0) + 1
        
        # Log the error
        self.logger.error(f"Error {error_id}: {json.dumps(error_data, indent=2)}")
        
        return error_id
    
    def log_performance(self, operation: str, duration: float, metadata: Dict[str, Any] = None):
        """Log performance metrics"""
        metric_data = {
            "operation": operation,
            "duration_ms": round(duration * 1000, 2),
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        
        # Store metrics
        if operation not in self.performance_metrics:
            self.performance_metrics[operation] = []
        
        self.performance_metrics[operation].append(metric_data)
        
        # Keep only last 100 metrics per operation
        if len(self.performance_metrics[operation]) > 100:
            self.performance_metrics[operation] = self.performance_metrics[operation][-100:]
        
        # Log slow operations
        if duration > 2.0:  # More than 2 seconds
            self.logger.warning(f"Slow operation: {json.dumps(metric_data)}")
        else:
            self.logger.info(f"Performance: {operation} took {metric_data['duration_ms']}ms")
    
    def get_error_summary(self) -> Dict[str, Any]:
        """Get summary of errors"""
        total_errors = sum(self.error_counts.values())
        
        return {
            "total_errors": total_errors,
            "error_types": self.error_counts,
            "most_common_error": max(self.error_counts.items(), key=lambda x: x[1])[0] if self.error_counts else None
        }
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get performance metrics summary"""
        summary = {}
        
        for operation, metrics in self.performance_metrics.items():
            if metrics:
                durations = [m["duration_ms"] for m in metrics]
                summary[operation] = {
                    "count": len(metrics),
                    "avg_duration_ms": round(sum(durations) / len(durations), 2),
                    "max_duration_ms": max(durations),
                    "min_duration_ms": min(durations),
                    "last_24h": len([m for m in metrics if (datetime.now() - datetime.fromisoformat(m["timestamp"])).total_seconds() < 86400])
                }
        
        return summary
    
    def health_check(self) -> Dict[str, Any]:
        """Return application health status"""
        error_summary = self.get_error_summary()
        performance_summary = self.get_performance_summary()
        
        # Determine health status
        total_errors = error_summary["total_errors"]
        health_status = "healthy"
        
        if total_errors > 50:
            health_status = "degraded"
        elif total_errors > 100:
            health_status = "unhealthy"
        
        return {
            "status": health_status,
            "timestamp": datetime.now().isoformat(),
            "uptime_info": "Application is running",
            "error_summary": error_summary,
            "performance_summary": performance_summary,
            "environment": {
                "debug_mode": os.getenv("DEBUG", "false").lower() == "true",
                "environment": os.getenv("ENVIRONMENT", "development")
            }
        }

# Create singleton instance
error_handler = ErrorHandler()


# Decorator for performance monitoring
def monitor_performance(operation_name: str):
    """Decorator to monitor function performance"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time
                error_handler.log_performance(operation_name, duration, {"success": True})
                return result
            except Exception as e:
                duration = time.time() - start_time
                error_handler.log_performance(operation_name, duration, {"success": False, "error": str(e)})
                raise
        return wrapper
    return decorator


# Context manager for performance monitoring
class PerformanceMonitor:
    """Context manager for monitoring code block performance"""
    
    def __init__(self, operation_name: str, metadata: Dict[str, Any] = None):
        self.operation_name = operation_name
        self.metadata = metadata or {}
        self.start_time = None
    
    def __enter__(self):
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        duration = time.time() - self.start_time
        success = exc_type is None
        
        self.metadata.update({"success": success})
        if not success:
            self.metadata.update({"error": str(exc_val)})
        
        error_handler.log_performance(self.operation_name, duration, self.metadata)
