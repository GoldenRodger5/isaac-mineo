// Enhanced API Client with Advanced Optimizations
// Includes request deduplication, intelligent caching, and performance monitoring

import { apiClient } from './apiClient.js';

class OptimizedAPIClient {
  constructor() {
    this.baseClient = apiClient;
    
    // Request deduplication
    this.pendingRequests = new Map();
    this.requestCache = new Map();
    
    // Multi-layer caching
    this.memoryCache = new Map();
    this.memoryCacheSize = 50; // Limit memory cache size
    
    // Performance tracking
    this.metrics = {
      requests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      memoryHits: 0,
      deduplicationHits: 0,
      averageResponseTime: 0,
      totalResponseTime: 0
    };
    
    // Batch processing
    this.batchQueue = [];
    this.batchTimeout = null;
    this.maxBatchSize = 5;
    this.batchDelay = 100; // ms
  }

  // Enhanced request with deduplication and multi-layer caching
  async optimizedRequest(endpoint, options = {}) {
    const startTime = performance.now();
    this.metrics.requests++;
    
    // Generate unique key for this request
    const requestKey = this.generateRequestKey(endpoint, options);
    
    try {
      // 1. Check for pending identical request (deduplication)
      if (this.pendingRequests.has(requestKey)) {
        this.metrics.deduplicationHits++;
        console.log('🔄 Request deduplicated:', requestKey);
        return await this.pendingRequests.get(requestKey);
      }
      
      // 2. Check memory cache (L1)
      const memoryResult = this.getFromMemoryCache(requestKey);
      if (memoryResult) {
        this.metrics.memoryHits++;
        this.metrics.cacheHits++;
        console.log('⚡ Memory cache hit:', requestKey);
        return memoryResult;
      }
      
      // 3. Check persistent cache (L2) for GET requests
      if (!options.method || options.method === 'GET') {
        const cacheResult = this.getCachedResponse(requestKey);
        if (cacheResult) {
          this.metrics.cacheHits++;
          console.log('💾 Cache hit:', requestKey);
          
          // Store in memory cache for faster future access
          this.setMemoryCache(requestKey, cacheResult);
          return cacheResult;
        }
      }
      
      // 4. Make the actual request
      this.metrics.cacheMisses++;
      const requestPromise = this.executeRequest(endpoint, options);
      this.pendingRequests.set(requestKey, requestPromise);
      
      try {
        const result = await requestPromise;
        
        // Cache successful responses
        if (result.success && (!options.method || options.method === 'GET')) {
          this.setCachedResponse(requestKey, result);
          this.setMemoryCache(requestKey, result);
        }
        
        // Update performance metrics
        const responseTime = performance.now() - startTime;
        this.updateMetrics(responseTime);
        
        return result;
        
      } finally {
        // Clean up pending request
        this.pendingRequests.delete(requestKey);
      }
      
    } catch (error) {
      console.error('🚨 Optimized request error:', error);
      this.pendingRequests.delete(requestKey);
      throw error;
    }
  }

  // Execute the actual request with retry logic
  async executeRequest(endpoint, options) {
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Use the appropriate baseClient method based on endpoint
        let result;
        
        if (endpoint === '/api/chatbot' || endpoint.includes('/api/chatbot')) {
          const body = options.body ? JSON.parse(options.body) : {};
          // Fix: Use sendChatMessage instead of sendMessage
          result = await this.baseClient.sendChatMessage(body.question, body.session_id || body.sessionId);
        } else if (endpoint === '/api/contact' || endpoint.includes('/api/contact')) {
          const body = options.body ? JSON.parse(options.body) : {};
          // Fix: Use sendContactMessage instead of sendContactEmail  
          result = await this.baseClient.sendContactMessage(body.name, body.email, body.message);
        } else if (endpoint === '/api/projects' || endpoint.includes('/api/projects')) {
          result = await this.baseClient.getProjects();
        } else if (endpoint === '/health' || endpoint.includes('/health')) {
          const healthResult = await this.baseClient.healthCheck();
          result = { success: healthResult.success, data: healthResult.data || { status: healthResult.success ? 'healthy' : 'unhealthy' } };
        } else {
          // Generic fetch for other endpoints
          const url = endpoint.startsWith('http') ? endpoint : `${this.baseClient.baseURL}${endpoint}`;
          const response = await fetch(url, {
            method: options.method || 'GET',
            headers: options.headers || { 'Content-Type': 'application/json' },
            body: options.body
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          result = { success: true, data };
        }
        
        return result;
      } catch (error) {
        lastError = error;
        console.warn(`🔄 Request attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError;
  }

  // Memory cache management (L1)
  setMemoryCache(key, data) {
    // Remove oldest entries if cache is full
    if (this.memoryCache.size >= this.memoryCacheSize) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }
    
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      access_count: 1
    });
  }

  getFromMemoryCache(key) {
    const cached = this.memoryCache.get(key);
    if (!cached) return null;
    
    // Check if still fresh (2 minutes for memory cache)
    const maxAge = 2 * 60 * 1000; // 2 minutes
    if (Date.now() - cached.timestamp > maxAge) {
      this.memoryCache.delete(key);
      return null;
    }
    
    // Update access count for LRU-like behavior
    cached.access_count++;
    return cached.data;
  }

  // Intelligent cache key generation
  generateRequestKey(endpoint, options) {
    const keyData = {
      endpoint,
      method: options.method || 'GET',
      params: options.params || {},
      body: options.body ? this.hashString(JSON.stringify(options.body)) : null
    };
    
    return btoa(JSON.stringify(keyData)).replace(/[+=\/]/g, '').substr(0, 32);
  }

  // Simple string hashing for cache keys
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  // Enhanced cache management (L2)
  getCachedResponse(key) {
    const cached = this.baseClient.getCachedResponse?.(key);
    return cached;
  }

  setCachedResponse(key, data) {
    if (this.baseClient.setCachedResponse) {
      this.baseClient.setCachedResponse(key, data);
    }
  }

  // Batch processing for multiple requests
  async batchRequest(requests) {
    console.log('📦 Processing batch of', requests.length, 'requests');
    
    // Group requests by priority
    const highPriority = requests.filter(r => r.priority === 'high');
    const normalPriority = requests.filter(r => r.priority !== 'high');
    
    // Process high priority requests first
    const highPriorityResults = await Promise.allSettled(
      highPriority.map(req => this.optimizedRequest(req.endpoint, req.options))
    );
    
    // Process normal priority with concurrency limit
    const normalPriorityResults = await this.processWithConcurrencyLimit(
      normalPriority,
      3 // Max 3 concurrent requests
    );
    
    return [...highPriorityResults, ...normalPriorityResults];
  }

  async processWithConcurrencyLimit(requests, limit) {
    const results = [];
    
    for (let i = 0; i < requests.length; i += limit) {
      const batch = requests.slice(i, i + limit);
      const batchResults = await Promise.allSettled(
        batch.map(req => this.optimizedRequest(req.endpoint, req.options))
      );
      results.push(...batchResults);
    }
    
    return results;
  }

  // Performance monitoring
  updateMetrics(responseTime) {
    this.metrics.totalResponseTime += responseTime;
    this.metrics.averageResponseTime = this.metrics.totalResponseTime / this.metrics.requests;
  }

  getPerformanceReport() {
    const cacheHitRate = this.metrics.requests > 0 ? 
      (this.metrics.cacheHits / this.metrics.requests) * 100 : 0;
    
    const memoryHitRate = this.metrics.requests > 0 ?
      (this.metrics.memoryHits / this.metrics.requests) * 100 : 0;
    
    const deduplicationRate = this.metrics.requests > 0 ?
      (this.metrics.deduplicationHits / this.metrics.requests) * 100 : 0;

    return {
      totalRequests: this.metrics.requests,
      cacheHitRate: cacheHitRate.toFixed(1) + '%',
      memoryHitRate: memoryHitRate.toFixed(1) + '%',
      deduplicationRate: deduplicationRate.toFixed(1) + '%',
      averageResponseTime: this.metrics.averageResponseTime.toFixed(0) + 'ms',
      memoryCacheSize: this.memoryCache.size,
      pendingRequests: this.pendingRequests.size
    };
  }

  // Preload frequently accessed data
  async preloadFrequentData() {
    const frequentQueries = [
      { endpoint: '/api/chatbot', options: { body: JSON.stringify({ question: "What is Isaac's technical stack?" }) } },
      { endpoint: '/api/chatbot', options: { body: JSON.stringify({ question: "Tell me about Nutrivize" }) } },
      { endpoint: '/api/chatbot', options: { body: JSON.stringify({ question: "What roles is Isaac looking for?" }) } }
    ];
    
    console.log('🚀 Preloading frequent data...');
    
    // Preload in background without blocking
    Promise.allSettled(
      frequentQueries.map(query => 
        this.optimizedRequest(query.endpoint, { 
          ...query.options, 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      )
    ).then(() => {
      console.log('✅ Preloading completed');
    });
  }

  // Smart cache cleanup
  cleanupCaches() {
    // Clean memory cache of least recently used items
    if (this.memoryCache.size > this.memoryCacheSize * 0.8) {
      const entries = Array.from(this.memoryCache.entries());
      entries.sort((a, b) => a[1].access_count - b[1].access_count);
      
      const toRemove = Math.floor(entries.length * 0.2);
      for (let i = 0; i < toRemove; i++) {
        this.memoryCache.delete(entries[i][0]);
      }
      
      console.log('🧹 Cleaned up', toRemove, 'memory cache entries');
    }
  }

  // Helper method
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Clear all caches
  clearAllCaches() {
    this.memoryCache.clear();
    this.requestCache.clear();
    this.pendingRequests.clear();
    if (this.baseClient.clearCache) {
      this.baseClient.clearCache();
    }
    console.log('🧹 All caches cleared');
  }
}

// Global instance
const optimizedApiClient = new OptimizedAPIClient();

// Auto-cleanup every 5 minutes
setInterval(() => {
  optimizedApiClient.cleanupCaches();
}, 5 * 60 * 1000);

// Preload on initialization
if (typeof window !== 'undefined') {
  setTimeout(() => {
    optimizedApiClient.preloadFrequentData();
  }, 1000);
}

export { optimizedApiClient };
export default optimizedApiClient;
