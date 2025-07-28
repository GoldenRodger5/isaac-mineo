"""
Performance Optimization Service for Code Explainer
Handles caching, streaming, and performance monitoring
"""

import asyncio
import hashlib
import json
import time
from typing import Dict, Any, Optional, List, AsyncGenerator
from datetime import datetime, timedelta

from app.utils.cache_manager import CacheManager
from app.services.error_handler import error_handler


class PerformanceService:
    """Service for performance optimization and monitoring"""
    
    def __init__(self):
        self.cache_manager = CacheManager()
        self.metrics = {
            "explanation_cache_hits": 0,
            "explanation_cache_misses": 0,
            "avg_explanation_time": 0.0,
            "total_explanations": 0
        }
        
        # Cache configuration
        self.cache_ttl = {
            "explanation": 7200,      # 2 hours
            "file_content": 3600,     # 1 hour
            "repo_tree": 1800,        # 30 minutes
            "github_repos": 3600      # 1 hour
        }

    async def get_cached_explanation(self, code: str, mode: str, file_context: Optional[Dict] = None) -> Optional[Dict]:
        """Get cached explanation if available"""
        try:
            cache_key = self.generate_explanation_cache_key(code, mode, file_context)
            cached_result = await self.cache_manager.get(f"explanation:{cache_key}")
            
            if cached_result:
                self.metrics["explanation_cache_hits"] += 1
                return json.loads(cached_result)
            
            self.metrics["explanation_cache_misses"] += 1
            return None
            
        except Exception as e:
            error_handler.log_error(e, {"function": "get_cached_explanation"})
            return None

    async def cache_explanation(self, code: str, mode: str, explanation: str, file_context: Optional[Dict] = None):
        """Cache explanation result"""
        try:
            cache_key = self.generate_explanation_cache_key(code, mode, file_context)
            cache_data = {
                "explanation": explanation,
                "timestamp": datetime.now().isoformat(),
                "mode": mode,
                "code_hash": hashlib.md5(code.encode()).hexdigest()[:8]
            }
            
            await self.cache_manager.set(
                f"explanation:{cache_key}",
                json.dumps(cache_data),
                expire=self.cache_ttl["explanation"]
            )
            
        except Exception as e:
            error_handler.log_error(e, {"function": "cache_explanation"})

    def generate_explanation_cache_key(self, code: str, mode: str, file_context: Optional[Dict] = None) -> str:
        """Generate cache key for explanation"""
        # Create deterministic key from code content and context
        key_data = {
            "code_hash": hashlib.md5(code.encode()).hexdigest(),
            "mode": mode,
            "language": file_context.get("language") if file_context else None,
            "file_size": len(code)
        }
        
        key_string = json.dumps(key_data, sort_keys=True)
        return hashlib.sha256(key_string.encode()).hexdigest()[:16]

    async def stream_explanation(self, explanation: str, chunk_size: int = 50) -> AsyncGenerator[str, None]:
        """Stream explanation in chunks for better UX"""
        try:
            words = explanation.split()
            for i in range(0, len(words), chunk_size):
                chunk = " ".join(words[i:i + chunk_size])
                yield chunk + " "
                await asyncio.sleep(0.1)  # Small delay for streaming effect
                
        except Exception as e:
            error_handler.log_error(e, {"function": "stream_explanation"})
            yield explanation  # Fallback to full text

    async def optimize_code_analysis(self, code: str, max_size: int = 50000) -> str:
        """Optimize code for analysis by truncating if too large"""
        if len(code) <= max_size:
            return code
        
        # Try to find natural break points
        lines = code.split('\n')
        optimized_lines = []
        current_size = 0
        
        for line in lines:
            if current_size + len(line) > max_size:
                break
            optimized_lines.append(line)
            current_size += len(line) + 1  # +1 for newline
        
        optimized_code = '\n'.join(optimized_lines)
        optimized_code += f"\n\n... [TRUNCATED: Original size {len(code)} chars, showing first {len(optimized_code)} chars]"
        
        return optimized_code

    async def batch_process_files(self, files: List[Dict], batch_size: int = 5) -> List[Dict]:
        """Process multiple files in batches for better performance"""
        try:
            results = []
            
            for i in range(0, len(files), batch_size):
                batch = files[i:i + batch_size]
                
                # Process batch concurrently
                tasks = [self.process_file_metadata(file_data) for file_data in batch]
                batch_results = await asyncio.gather(*tasks, return_exceptions=True)
                
                # Handle results and exceptions
                for j, result in enumerate(batch_results):
                    if isinstance(result, Exception):
                        error_handler.log_error(result, {"function": "batch_process_files", "file_index": i + j})
                        results.append({"error": str(result), "file": batch[j]})
                    else:
                        results.append(result)
                
                # Small delay between batches to prevent overwhelming APIs
                if i + batch_size < len(files):
                    await asyncio.sleep(0.1)
            
            return results
            
        except Exception as e:
            error_handler.log_error(e, {"function": "batch_process_files"})
            return []

    async def process_file_metadata(self, file_data: Dict) -> Dict:
        """Process individual file metadata"""
        try:
            # Add performance metadata
            file_data["processed_at"] = datetime.now().isoformat()
            file_data["estimated_complexity"] = self.estimate_code_complexity(file_data.get("content", ""))
            
            return file_data
            
        except Exception as e:
            error_handler.log_error(e, {"function": "process_file_metadata"})
            return file_data

    def estimate_code_complexity(self, code: str) -> str:
        """Estimate code complexity based on simple metrics"""
        if not code:
            return "unknown"
        
        lines = len(code.split('\n'))
        chars = len(code)
        
        # Simple complexity estimation
        if lines < 50 and chars < 2000:
            return "low"
        elif lines < 200 and chars < 10000:
            return "medium"
        else:
            return "high"

    async def record_performance_metric(self, operation: str, duration: float, metadata: Optional[Dict] = None):
        """Record performance metrics"""
        try:
            metric_key = f"perf:{operation}:{datetime.now().strftime('%Y%m%d_%H')}"
            
            # Get existing metrics for this hour
            existing_metrics = await self.cache_manager.get(metric_key)
            if existing_metrics:
                metrics = json.loads(existing_metrics)
            else:
                metrics = {"count": 0, "total_duration": 0.0, "max_duration": 0.0, "min_duration": float('inf')}
            
            # Update metrics
            metrics["count"] += 1
            metrics["total_duration"] += duration
            metrics["max_duration"] = max(metrics["max_duration"], duration)
            metrics["min_duration"] = min(metrics["min_duration"], duration)
            metrics["avg_duration"] = metrics["total_duration"] / metrics["count"]
            
            if metadata:
                metrics["metadata"] = metadata
            
            # Cache updated metrics (expire after 25 hours to keep recent data)
            await self.cache_manager.set(metric_key, json.dumps(metrics), expire=90000)
            
        except Exception as e:
            error_handler.log_error(e, {"function": "record_performance_metric"})

    async def get_performance_stats(self) -> Dict[str, Any]:
        """Get current performance statistics"""
        try:
            # Get recent performance data
            current_hour = datetime.now().strftime('%Y%m%d_%H')
            prev_hour = (datetime.now() - timedelta(hours=1)).strftime('%Y%m%d_%H')
            
            current_metrics = await self.cache_manager.get(f"perf:explanation:{current_hour}")
            prev_metrics = await self.cache_manager.get(f"perf:explanation:{prev_hour}")
            
            stats = {
                "cache_hit_rate": 0.0,
                "current_hour": {},
                "previous_hour": {},
                "total_explanations": self.metrics["total_explanations"]
            }
            
            # Calculate cache hit rate
            total_requests = self.metrics["explanation_cache_hits"] + self.metrics["explanation_cache_misses"]
            if total_requests > 0:
                stats["cache_hit_rate"] = self.metrics["explanation_cache_hits"] / total_requests
            
            # Add hourly stats
            if current_metrics:
                stats["current_hour"] = json.loads(current_metrics)
            
            if prev_metrics:
                stats["previous_hour"] = json.loads(prev_metrics)
            
            return stats
            
        except Exception as e:
            error_handler.log_error(e, {"function": "get_performance_stats"})
            return {"error": "Could not retrieve performance stats"}

    async def cleanup_old_cache(self, max_age_hours: int = 24):
        """Cleanup old cache entries (would need Redis SCAN in production)"""
        try:
            # This is a simplified version - in production you'd use Redis SCAN
            # to find and delete old keys based on timestamps
            pass
        except Exception as e:
            error_handler.log_error(e, {"function": "cleanup_old_cache"})


# Global performance service instance
performance_service = PerformanceService()
