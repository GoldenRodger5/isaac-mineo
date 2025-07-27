import Redis from 'redis';

/**
 * Redis caching utility with write-through strategy
 */
class CacheManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.defaultTTL = 3600; // 1 hour default
    this.embeddingTTL = 86400; // 24 hours for embeddings
    this.responseTTL = 1800; // 30 minutes for API responses
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    if (this.isConnected) return;

    try {
      // Try to connect to Redis (local or cloud)
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.client = Redis.createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 5000,
          lazyConnect: true
        },
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.log('Redis connection refused - running without cache');
            return false;
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return false;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      await this.client.connect();
      this.isConnected = true;
      console.log('Redis connected successfully');
    } catch (error) {
      console.log('Redis connection failed - running without cache:', error.message);
      this.client = null;
      this.isConnected = false;
    }
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} Cached value or null
   */
  async get(key) {
    if (!this.isConnected || !this.client) return null;

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   */
  async set(key, value, ttl = this.defaultTTL) {
    if (!this.isConnected || !this.client) return;

    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Cache embedding with write-through strategy
   * @param {string} text - Text that was embedded
   * @param {Array} embedding - The embedding vector
   */
  async cacheEmbedding(text, embedding) {
    const key = `embedding:${this.hashText(text)}`;
    await this.set(key, embedding, this.embeddingTTL);
  }

  /**
   * Get cached embedding
   * @param {string} text - Text to get embedding for
   * @returns {Promise<Array|null>} Cached embedding or null
   */
  async getCachedEmbedding(text) {
    const key = `embedding:${this.hashText(text)}`;
    return await this.get(key);
  }

  /**
   * Cache API response
   * @param {string} question - User question
   * @param {string} response - AI response
   * @param {Object} metadata - Additional metadata
   */
  async cacheResponse(question, response, metadata = {}) {
    const key = `response:${this.hashText(question.toLowerCase())}`;
    const cacheData = {
      response,
      metadata,
      timestamp: new Date().toISOString()
    };
    await this.set(key, cacheData, this.responseTTL);
  }

  /**
   * Get cached response
   * @param {string} question - User question
   * @returns {Promise<Object|null>} Cached response data or null
   */
  async getCachedResponse(question) {
    const key = `response:${this.hashText(question.toLowerCase())}`;
    return await this.get(key);
  }

  /**
   * Cache session data
   * @param {string} sessionId - Session identifier
   * @param {Array} messages - Conversation messages
   */
  async cacheSession(sessionId, messages) {
    const key = `session:${sessionId}`;
    await this.set(key, { messages, lastUpdated: Date.now() }, 7200); // 2 hours
  }

  /**
   * Get session data
   * @param {string} sessionId - Session identifier
   * @returns {Promise<Object|null>} Session data or null
   */
  async getSession(sessionId) {
    const key = `session:${sessionId}`;
    return await this.get(key);
  }

  /**
   * Cache vector search results
   * @param {string} query - Search query
   * @param {Array} results - Search results
   */
  async cacheSearchResults(query, results) {
    const key = `search:${this.hashText(query)}`;
    await this.set(key, results, 1800); // 30 minutes
  }

  /**
   * Get cached search results
   * @param {string} query - Search query
   * @returns {Promise<Array|null>} Cached results or null
   */
  async getCachedSearchResults(query) {
    const key = `search:${this.hashText(query)}`;
    return await this.get(key);
  }

  /**
   * Increment rate limit counter
   * @param {string} identifier - User/IP identifier
   * @param {number} windowSeconds - Time window in seconds
   * @returns {Promise<number>} Current count
   */
  async incrementRateLimit(identifier, windowSeconds = 3600) {
    if (!this.isConnected || !this.client) return 0;

    try {
      const key = `ratelimit:${identifier}`;
      const current = await this.client.incr(key);
      
      if (current === 1) {
        await this.client.expire(key, windowSeconds);
      }
      
      return current;
    } catch (error) {
      console.error('Rate limit error:', error);
      return 0;
    }
  }

  /**
   * Clear cache by pattern
   * @param {string} pattern - Redis key pattern
   */
  async clearPattern(pattern) {
    if (!this.isConnected || !this.client) return;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Hash text for consistent cache keys
   * @param {string} text - Text to hash
   * @returns {string} Hash string
   */
  hashText(text) {
    // Simple hash function for cache keys
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Health check for cache
   * @returns {Promise<boolean>} Cache health status
   */
  async healthCheck() {
    if (!this.isConnected || !this.client) return false;

    try {
      await this.client.ping();
      return true;
    } catch (error) {
      console.error('Cache health check failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

// Singleton instance
const cacheManager = new CacheManager();

export default cacheManager;
