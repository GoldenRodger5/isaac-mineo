/**
 * Enhanced API Client with Authentication and Performance Features
 * Extends the base API client with auth, caching, and advanced features
 */

import { apiClient as baseApiClient } from './apiClient';

class EnhancedAPIClient {
  constructor() {
    this.baseClient = baseApiClient;
    this.authToken = localStorage.getItem('auth_token');
    this.cache = new Map();
    this.requestQueue = [];
    this.isProcessingQueue = false;
    
    // Performance metrics
    this.metrics = {
      requests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      avgResponseTime: 0
    };
  }

  // Authentication methods
  setAuthToken(token) {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
  }

  clearAuthToken() {
    this.authToken = null;
    localStorage.removeItem('auth_token');
  }

  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }

  // Enhanced API request with auth and caching
  async makeRequest(url, options = {}) {
    const startTime = performance.now();
    this.metrics.requests++;
    
    try {
      // Add auth headers
      const enhancedOptions = {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers
        }
      };

      // Check cache for GET requests
      if (!options.method || options.method === 'GET') {
        const cacheKey = this.generateCacheKey(url, options);
        const cached = this.getCachedResponse(cacheKey);
        
        if (cached) {
          this.metrics.cacheHits++;
          return cached;
        }
        this.metrics.cacheMisses++;
      }

      // Make request
      const response = await this.baseClient.fetchWithRetry(url, enhancedOptions);
      
      // Cache successful GET responses
      if ((!options.method || options.method === 'GET') && response.success) {
        const cacheKey = this.generateCacheKey(url, options);
        this.setCachedResponse(cacheKey, response);
      }

      // Update metrics
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      this.updateMetrics(responseTime);

      return response;
      
    } catch (error) {
      console.error('Enhanced API request failed:', error);
      
      // Handle auth errors
      if (error.status === 401) {
        this.clearAuthToken();
        // Optionally trigger re-auth flow
      }
      
      throw error;
    }
  }

  // Cache management
  generateCacheKey(url, options) {
    return `${url}_${JSON.stringify(options.params || {})}`;
  }

  getCachedResponse(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  setCachedResponse(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Simple cache size management
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  clearCache() {
    this.cache.clear();
  }

  // Follow-up question handling with conversation context
  async askFollowUpQuestion(question, conversationContext) {
    try {
      const payload = {
        question,
        context: conversationContext,
        mode: 'followup'
      };

      const response = await this.makeRequest(
        `${this.baseClient.baseURL}/github/explain-code`,
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      );

      return response;
    } catch (error) {
      console.error('Follow-up question failed:', error);
      return {
        success: false,
        error: error.message,
        fallback: true,
        data: {
          explanation: "I'm having trouble processing your follow-up question right now. Please try rephrasing or ask again in a moment."
        }
      };
    }
  }

  // Batch code explanation for multiple selections
  async explainMultipleCodeSections(codeSections, mode = 'explain', fileContext = null) {
    try {
      const requests = codeSections.map((code, index) => 
        this.baseClient.explainCode(code, mode, fileContext, null)
      );

      const responses = await Promise.allSettled(requests);
      
      return responses.map((result, index) => ({
        index,
        code: codeSections[index],
        result: result.status === 'fulfilled' ? result.value : {
          success: false,
          error: result.reason?.message || 'Unknown error'
        }
      }));
    } catch (error) {
      console.error('Batch explanation failed:', error);
      throw error;
    }
  }

  // Performance monitoring
  updateMetrics(responseTime) {
    const totalTime = this.metrics.avgResponseTime * (this.metrics.requests - 1) + responseTime;
    this.metrics.avgResponseTime = totalTime / this.metrics.requests;
  }

  getPerformanceMetrics() {
    return {
      ...this.metrics,
      cacheHitRate: this.metrics.requests > 0 ? 
        (this.metrics.cacheHits / this.metrics.requests) * 100 : 0
    };
  }

  // Request queue for rate limiting
  async queueRequest(requestFn) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const { requestFn, resolve, reject } = this.requestQueue.shift();
      
      try {
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
      
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.isProcessingQueue = false;
  }

  // Export explanation as markdown
  generateExplanationMarkdown(explanation, codeContext) {
    const timestamp = new Date().toISOString().split('T')[0];
    const language = codeContext?.language || 'text';
    const filename = codeContext?.path || 'code-snippet';
    
    return `# Code Explanation - ${filename}

**Generated:** ${timestamp}  
**Language:** ${language}  
**Mode:** ${explanation.mode || 'explain'}

## Code

\`\`\`${language}
${codeContext?.content || 'Code not available'}
\`\`\`

## Explanation

${explanation.explanation || 'No explanation available'}

---
*Generated by Claude AI Code Explainer*
`;
  }

  // Save explanation to local storage
  saveExplanation(explanation, codeContext) {
    const savedExplanations = JSON.parse(localStorage.getItem('saved_explanations') || '[]');
    
    const explanationRecord = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      explanation,
      codeContext,
      filename: codeContext?.path || 'unknown'
    };
    
    savedExplanations.unshift(explanationRecord);
    
    // Keep only last 50 explanations
    if (savedExplanations.length > 50) {
      savedExplanations.splice(50);
    }
    
    localStorage.setItem('saved_explanations', JSON.stringify(savedExplanations));
    return explanationRecord.id;
  }

  // Get saved explanations
  getSavedExplanations() {
    return JSON.parse(localStorage.getItem('saved_explanations') || '[]');
  }

  // Delete saved explanation
  deleteSavedExplanation(id) {
    const saved = this.getSavedExplanations();
    const filtered = saved.filter(item => item.id !== id);
    localStorage.setItem('saved_explanations', JSON.stringify(filtered));
  }

  // Health check with retry logic
  async healthCheck() {
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const response = await this.makeRequest(`${this.baseClient.baseURL}/github/health`);
        return response;
      } catch (error) {
        attempts++;
        if (attempts === maxAttempts) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
  }
}

// Create and export enhanced client instance
export const enhancedApiClient = new EnhancedAPIClient();
export default enhancedApiClient;
