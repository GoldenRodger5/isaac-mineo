"""
Enhanced Performance Service with Advanced Caching and Optimization
Includes parallel processing, intelligent caching, and real-time monitoring
"""

import asyncio
import hashlib
import json
import time
from typing import Dict, Any, Optional, List, AsyncGenerator, Tuple
from datetime import datetime, timedelta
from collections import deque, defaultdict
import weakref

from app.utils.cache_manager import CacheManager
from app.services.error_handler import error_handler


class EnhancedPerformanceService:
    """Advanced performance optimization service with intelligent caching and monitoring"""
    
    def __init__(self):
        self.cache_manager = CacheManager()
        
        # Enhanced metrics with detailed tracking
        self.metrics = {
            "explanation_cache_hits": 0,
            "explanation_cache_misses": 0,
            "memory_cache_hits": 0,
            "parallel_search_gains": 0,
            "avg_explanation_time": 0.0,
            "total_explanations": 0,
            "concurrent_requests": 0,
            "peak_concurrent_requests": 0,
            "request_queue_size": 0
        }
        
        # Advanced cache configuration with adaptive TTL
        self.cache_ttl = {
            "explanation_hot": 3600,      # 1 hour for frequently accessed
            "explanation_warm": 7200,     # 2 hours for moderately accessed
            "explanation_cold": 14400,    # 4 hours for rarely accessed
            "file_content": 3600,         # 1 hour
            "repo_tree": 1800,           # 30 minutes
            "github_repos": 3600,        # 1 hour
            "search_results": 1800,      # 30 minutes for search results
            "user_session": 7200         # 2 hours for user sessions
        }
        
        # Memory cache for ultra-fast access
        self.memory_cache = {}
        self.memory_cache_stats = defaultdict(int)
        self.max_memory_cache_size = 200
        
        # Request deduplication and batching
        self.pending_requests = {}
        self.batch_queue = deque()
        self.batch_processing = False
        
        # Performance monitoring
        self.request_times = deque(maxlen=1000)  # Last 1000 requests
        self.error_rates = deque(maxlen=100)     # Last 100 operations
        
        # Adaptive optimization
        self.access_patterns = defaultdict(list)
        self.optimization_rules = {}
        
    async def smart_cache_get(self, key: str, category: str = "warm") -> Optional[Any]:
        """Multi-layer cache retrieval with performance tracking"""
        start_time = time.time()
        
        try:
            # Layer 1: Memory cache (fastest)
            memory_key = f"mem:{key}"
            if memory_key in self.memory_cache:
                hit_time = self.memory_cache[memory_key]['timestamp']
                max_age = 300  # 5 minutes for memory cache
                
                if time.time() - hit_time < max_age:
                    self.memory_cache[memory_key]['hits'] += 1
                    self.metrics["memory_cache_hits"] += 1
                    
                    # Update access pattern
                    self.access_patterns[key].append(time.time())
                    
                    return self.memory_cache[memory_key]['data']
                else:
                    # Expired, remove from memory cache
                    del self.memory_cache[memory_key]
            
            # Layer 2: Redis cache
            cache_key = f"perf:{category}:{key}"
            cached_result = await self.cache_manager.get(cache_key)
            
            if cached_result:
                self.metrics["explanation_cache_hits"] += 1
                
                # Store in memory cache for faster future access
                await self.set_memory_cache(memory_key, cached_result)
                
                return json.loads(cached_result) if isinstance(cached_result, str) else cached_result
            
            self.metrics["explanation_cache_misses"] += 1
            return None
            
        except Exception as e:
            error_handler.log_error(e, {"function": "smart_cache_get", "key": key[:50]})
            return None
        finally:
            # Track performance
            self.request_times.append(time.time() - start_time)

    async def smart_cache_set(self, key: str, data: Any, category: str = "warm", custom_ttl: Optional[int] = None):
        """Intelligent cache storage with adaptive TTL"""
        try:
            # Determine optimal TTL based on access patterns
            ttl = custom_ttl or self.get_adaptive_ttl(key, category)
            
            # Store in Redis
            cache_key = f"perf:{category}:{key}"
            cache_data = {
                "data": data,
                "timestamp": time.time(),
                "category": category,
                "access_count": 1
            }
            
            await self.cache_manager.set(
                cache_key,
                json.dumps(cache_data) if not isinstance(data, str) else data,
                expire=ttl
            )
            
            # Also store in memory cache if it's likely to be accessed soon
            if self.should_memory_cache(key, category):
                memory_key = f"mem:{key}"
                await self.set_memory_cache(memory_key, data)
                
        except Exception as e:
            error_handler.log_error(e, {"function": "smart_cache_set", "key": key[:50]})

    def get_adaptive_ttl(self, key: str, category: str) -> int:
        """Calculate adaptive TTL based on access patterns"""
        base_ttl = self.cache_ttl.get(category, self.cache_ttl["explanation_warm"])
        
        # Check access frequency in the last hour
        recent_accesses = [t for t in self.access_patterns[key] if time.time() - t < 3600]
        
        if len(recent_accesses) > 10:  # High frequency
            return max(base_ttl // 2, 1800)  # Shorter TTL, more frequent refreshes
        elif len(recent_accesses) > 3:  # Medium frequency
            return base_ttl
        else:  # Low frequency
            return min(base_ttl * 2, 28800)  # Longer TTL, 8 hours max

    def should_memory_cache(self, key: str, category: str) -> bool:
        """Determine if item should be stored in memory cache"""
        # Memory cache hot items and frequently accessed content
        if category in ["explanation_hot", "search_results"]:
            return True
            
        # Check recent access frequency
        recent_accesses = len([t for t in self.access_patterns[key] if time.time() - t < 1800])
        return recent_accesses >= 2  # If accessed 2+ times in last 30 minutes

    async def set_memory_cache(self, key: str, data: Any):
        """Set item in memory cache with LRU eviction"""
        if len(self.memory_cache) >= self.max_memory_cache_size:
            # Remove least recently used item
            oldest_key = min(self.memory_cache.keys(), 
                           key=lambda k: self.memory_cache[k]['timestamp'])
            del self.memory_cache[oldest_key]
        
        self.memory_cache[key] = {
            'data': data,
            'timestamp': time.time(),
            'hits': 0
        }

    async def parallel_search_optimization(self, queries: List[Dict]) -> List[Dict]:
        """Execute multiple searches in parallel with intelligent batching"""
        if not queries:
            return []
        
        start_time = time.time()
        
        try:
            # Group queries by type for optimization
            query_groups = self.group_queries_by_type(queries)
            
            # Execute groups in parallel
            tasks = []
            for group_type, group_queries in query_groups.items():
                if group_type == "cached":
                    # Fast path for cached results
                    tasks.append(self.process_cached_queries(group_queries))
                elif group_type == "vector_search":
                    # Batch vector searches
                    tasks.append(self.batch_vector_search(group_queries))
                elif group_type == "keyword_search":
                    # Batch keyword searches
                    tasks.append(self.batch_keyword_search(group_queries))
                else:
                    # Process individually
                    tasks.extend([self.process_single_query(q) for q in group_queries])
            
            # Execute all tasks in parallel
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Flatten and filter results
            flattened_results = []
            for result in results:
                if isinstance(result, Exception):
                    error_handler.log_error(result, {"function": "parallel_search"})
                    continue
                
                if isinstance(result, list):
                    flattened_results.extend(result)
                else:
                    flattened_results.append(result)
            
            # Track performance gain
            parallel_time = time.time() - start_time
            estimated_sequential_time = len(queries) * 0.5  # Assume 0.5s per query
            
            if parallel_time < estimated_sequential_time:
                self.metrics["parallel_search_gains"] += estimated_sequential_time - parallel_time
            
            return flattened_results
            
        except Exception as e:
            error_handler.log_error(e, {"function": "parallel_search_optimization"})
            return []

    def group_queries_by_type(self, queries: List[Dict]) -> Dict[str, List[Dict]]:
        """Group queries by type for optimal processing"""
        groups = defaultdict(list)
        
        for query in queries:
            # Check if result is cached
            cache_key = self.generate_query_cache_key(query)
            if cache_key in self.memory_cache:
                groups["cached"].append(query)
            elif query.get("type") == "vector":
                groups["vector_search"].append(query)
            elif query.get("type") == "keyword":
                groups["keyword_search"].append(query)
            else:
                groups["general"].append(query)
        
        return dict(groups)

    async def process_cached_queries(self, queries: List[Dict]) -> List[Dict]:
        """Process queries with cached results"""
        results = []
        for query in queries:
            cache_key = self.generate_query_cache_key(query)
            cached_result = self.memory_cache.get(cache_key)
            if cached_result:
                results.append(cached_result['data'])
        return results

    async def batch_vector_search(self, queries: List[Dict]) -> List[Dict]:
        """Batch process vector searches"""
        # Implement batch vector search logic here
        # This is a placeholder for the actual implementation
        results = []
        
        # Group similar queries to reduce API calls
        query_texts = [q.get("text", "") for q in queries]
        
        # Process in smaller batches to avoid timeout
        batch_size = 5
        for i in range(0, len(queries), batch_size):
            batch = queries[i:i + batch_size]
            # Process batch (implement actual vector search logic)
            batch_results = await self.process_vector_batch(batch)
            results.extend(batch_results)
            
            # Small delay between batches to prevent rate limiting
            if i + batch_size < len(queries):
                await asyncio.sleep(0.1)
        
        return results

    async def process_vector_batch(self, batch: List[Dict]) -> List[Dict]:
        """Process a batch of vector searches"""
        # Placeholder for actual vector search implementation
        # This would integrate with your existing vector search service
        return [{"result": f"vector_result_{i}"} for i in range(len(batch))]

    async def batch_keyword_search(self, queries: List[Dict]) -> List[Dict]:
        """Batch process keyword searches"""
        # Similar to vector search but for keyword-based queries
        results = []
        
        for query in queries:
            # Process keyword search (implement actual logic)
            result = await self.process_keyword_query(query)
            results.append(result)
        
        return results

    async def process_keyword_query(self, query: Dict) -> Dict:
        """Process a single keyword query"""
        # Placeholder for keyword search implementation
        return {"result": f"keyword_result_{query.get('text', '')[:20]}"}

    async def process_single_query(self, query: Dict) -> Dict:
        """Process a single query"""
        # Placeholder for general query processing
        return {"result": f"general_result_{query.get('id', 'unknown')}"}

    def generate_query_cache_key(self, query: Dict) -> str:
        """Generate cache key for query"""
        query_str = json.dumps(query, sort_keys=True)
        return hashlib.md5(query_str.encode()).hexdigest()[:16]

    async def optimize_request_batching(self, requests: List[Dict]) -> List[Any]:
        """Optimize multiple requests through intelligent batching"""
        if len(requests) <= 1:
            return await self.process_requests_individually(requests)
        
        # Check for duplicate requests
        deduplicated = self.deduplicate_requests(requests)
        
        if len(deduplicated) < len(requests):
            # Some deduplication occurred
            results = await self.process_requests_individually(deduplicated)
            # Map results back to original request order
            return self.map_deduplicated_results(requests, deduplicated, results)
        
        # No deduplication, process with batching
        return await self.parallel_search_optimization(requests)

    def deduplicate_requests(self, requests: List[Dict]) -> List[Dict]:
        """Remove duplicate requests"""
        seen = set()
        deduplicated = []
        
        for req in requests:
            req_key = self.generate_query_cache_key(req)
            if req_key not in seen:
                seen.add(req_key)
                deduplicated.append(req)
        
        return deduplicated

    async def process_requests_individually(self, requests: List[Dict]) -> List[Any]:
        """Process requests individually with concurrency"""
        tasks = [self.process_single_query(req) for req in requests]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions
        return [r for r in results if not isinstance(r, Exception)]

    def map_deduplicated_results(self, original: List[Dict], deduplicated: List[Dict], results: List[Any]) -> List[Any]:
        """Map deduplicated results back to original request order"""
        # Create mapping from deduplicated to results
        dedup_to_result = {}
        for dedup_req, result in zip(deduplicated, results):
            key = self.generate_query_cache_key(dedup_req)
            dedup_to_result[key] = result
        
        # Map back to original order
        mapped_results = []
        for original_req in original:
            key = self.generate_query_cache_key(original_req)
            mapped_results.append(dedup_to_result.get(key, None))
        
        return mapped_results

    async def get_performance_insights(self) -> Dict[str, Any]:
        """Get comprehensive performance insights"""
        current_time = time.time()
        
        # Calculate recent performance metrics
        recent_times = [t for t in self.request_times if current_time - t < 3600]
        avg_response_time = sum(recent_times) / len(recent_times) if recent_times else 0
        
        # Cache efficiency
        total_cache_requests = self.metrics["explanation_cache_hits"] + self.metrics["explanation_cache_misses"]
        cache_hit_rate = (self.metrics["explanation_cache_hits"] / total_cache_requests * 100) if total_cache_requests > 0 else 0
        
        memory_cache_hit_rate = (self.metrics["memory_cache_hits"] / total_cache_requests * 100) if total_cache_requests > 0 else 0
        
        return {
            "performance": {
                "avg_response_time_ms": round(avg_response_time * 1000, 2),
                "total_requests": len(self.request_times),
                "recent_requests_1h": len(recent_times),
                "cache_hit_rate": round(cache_hit_rate, 1),
                "memory_cache_hit_rate": round(memory_cache_hit_rate, 1),
                "parallel_gains_seconds": round(self.metrics["parallel_search_gains"], 2)
            },
            "cache_stats": {
                "memory_cache_size": len(self.memory_cache),
                "memory_cache_max": self.max_memory_cache_size,
                "pending_requests": len(self.pending_requests)
            },
            "optimization": {
                "most_accessed_patterns": self.get_top_access_patterns(5),
                "recommended_optimizations": self.get_optimization_recommendations()
            },
            "timestamp": datetime.now().isoformat()
        }

    def get_top_access_patterns(self, limit: int = 5) -> List[Dict]:
        """Get the most frequently accessed patterns"""
        patterns = []
        for key, accesses in self.access_patterns.items():
            recent_accesses = [t for t in accesses if time.time() - t < 3600]
            if recent_accesses:
                patterns.append({
                    "pattern": key[:50] + "..." if len(key) > 50 else key,
                    "access_count": len(recent_accesses),
                    "avg_interval": sum(recent_accesses) / len(recent_accesses) if recent_accesses else 0
                })
        
        return sorted(patterns, key=lambda x: x["access_count"], reverse=True)[:limit]

    def get_optimization_recommendations(self) -> List[str]:
        """Get performance optimization recommendations"""
        recommendations = []
        
        # Check cache hit rate
        total_requests = self.metrics["explanation_cache_hits"] + self.metrics["explanation_cache_misses"]
        if total_requests > 100:
            hit_rate = self.metrics["explanation_cache_hits"] / total_requests
            if hit_rate < 0.7:
                recommendations.append("Cache hit rate is below 70%. Consider increasing cache TTL or improving cache key strategies.")
        
        # Check memory cache utilization
        if len(self.memory_cache) < self.max_memory_cache_size * 0.5:
            recommendations.append("Memory cache is underutilized. Consider caching more frequently accessed data in memory.")
        
        # Check response times
        if self.request_times:
            avg_time = sum(self.request_times) / len(self.request_times)
            if avg_time > 0.5:  # 500ms
                recommendations.append("Average response time is high. Consider implementing more aggressive caching or optimizing query processing.")
        
        # Check for parallel processing opportunities
        if self.metrics["parallel_search_gains"] < 10:  # Less than 10 seconds saved
            recommendations.append("Limited parallel processing gains detected. Consider batching more operations or increasing concurrency.")
        
        return recommendations

    async def cleanup_old_performance_data(self):
        """Clean up old performance monitoring data"""
        try:
            current_time = time.time()
            
            # Clean up old access patterns (keep last 24 hours)
            for key in list(self.access_patterns.keys()):
                self.access_patterns[key] = [
                    t for t in self.access_patterns[key] 
                    if current_time - t < 86400  # 24 hours
                ]
                
                # Remove empty patterns
                if not self.access_patterns[key]:
                    del self.access_patterns[key]
            
            # Clean up old memory cache entries
            expired_keys = []
            for key, data in self.memory_cache.items():
                if current_time - data['timestamp'] > 1800:  # 30 minutes
                    expired_keys.append(key)
            
            for key in expired_keys:
                del self.memory_cache[key]
            
            print(f"🧹 Performance data cleanup: removed {len(expired_keys)} expired memory cache entries")
            
        except Exception as e:
            error_handler.log_error(e, {"function": "cleanup_old_performance_data"})


# Global enhanced performance service instance
enhanced_performance_service = EnhancedPerformanceService()

# Schedule periodic cleanup
async def periodic_cleanup():
    """Periodic cleanup of performance data"""
    while True:
        await asyncio.sleep(3600)  # Every hour
        await enhanced_performance_service.cleanup_old_performance_data()

# Start cleanup task
asyncio.create_task(periodic_cleanup())
