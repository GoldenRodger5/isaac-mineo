// API Client Service - Centralized API communication
// Handles all API calls with error handling, retry logic, and caching

class APIClient {
  constructor() {
    // Smart environment detection
    this.environment = this.detectEnvironment();
    this.baseURL = this.getApiBaseUrl();
    this.timeout = 30000; // 30 seconds - increased for better reliability
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
    
    console.log(`🌍 Environment: ${this.environment}`);
    console.log(`🔗 API Base URL: ${this.baseURL}`);
  }

  // Detect current environment
  detectEnvironment() {
    const hostname = window.location.hostname;
    const isDev = import.meta.env.DEV;
    
    if (isDev || hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    } else if (hostname === 'isaacmineo.com' || hostname === 'www.isaacmineo.com') {
      return 'production';
    } else {
      return 'preview'; // Vercel preview deployments
    }
  }

  // Get API base URL based on environment
  getApiBaseUrl() {
    switch (this.environment) {
      case 'development':
        // Local development - try localhost backend
        return 'http://localhost:8000/api';
      case 'production':
      case 'preview':
        // Production/Preview - use Render backend
        return 'https://isaac-mineo-api.onrender.com/api';
      default:
        return 'http://localhost:8000/api';
    }
  }

  // Generic fetch wrapper with error handling and retry logic
  async fetchWithRetry(url, options = {}, attempt = 1) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt < this.retryAttempts && !error.name === 'AbortError') {
        console.warn(`API call failed (attempt ${attempt}/${this.retryAttempts}), retrying...`, error);
        await this.delay(this.retryDelay * attempt);
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      throw error;
    }
  }

  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Health check endpoint
  async healthCheck() {
    try {
      const response = await this.fetchWithRetry(`${this.baseURL.replace('/api', '')}/health`);
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Send message to chatbot
  async sendMessage(question, sessionId = null) {
    try {
      const payload = {
        question,
        sessionId
      };

      const response = await this.fetchWithRetry(`${this.baseURL}/chatbot`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Chatbot API error:', error);
      
      // Return fallback response
      return {
        success: false,
        data: {
          response: this.getFallbackResponse(question),
          sessionId: sessionId || `fallback_${Date.now()}`,
          searchMethod: 'fallback',
          cached: false,
          error: true,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Send contact form email with smart environment-aware fallback
  async sendContactEmail(contactData) {
    const startTime = Date.now();
    
    // In development, try localhost backend first, then Vercel function
    // In production, try Render backend first, then Vercel function
    
    console.log(`📧 Sending contact email via ${this.environment} environment...`);
    
    // Primary method: Try main backend
    try {
      console.log(`🎯 Trying primary backend: ${this.baseURL}/contact`);
      const response = await this.fetchWithRetry(`${this.baseURL}/contact`, {
        method: 'POST',
        body: JSON.stringify(contactData),
      });

      const elapsed = Date.now() - startTime;
      console.log(`✅ Primary backend success in ${elapsed}ms`);
      
      return {
        success: true,
        data: response,
        method: this.environment === 'development' ? 'localhost' : 'render',
        duration: elapsed
      };
    } catch (backendError) {
      console.warn(`⚠️ Primary backend failed:`, backendError.message);
      
      // Fallback method: Try Vercel serverless function
      try {
        console.log(`🚀 Trying Vercel function fallback...`);
        const vercelResponse = await this.fetchWithRetry('/api/contact', {
          method: 'POST',
          body: JSON.stringify(contactData),
        });

        const elapsed = Date.now() - startTime;
        console.log(`✅ Vercel function success in ${elapsed}ms`);
        
        return {
          success: true,
          data: vercelResponse,
          method: 'vercel',
          duration: elapsed,
          fallback: true
        };
      } catch (vercelError) {
        console.error(`❌ Both contact methods failed:`, { 
          primary: backendError.message, 
          fallback: vercelError.message 
        });
        
        const elapsed = Date.now() - startTime;
        
        return {
          success: false,
          error: 'All contact methods failed',
          duration: elapsed,
          details: {
            primary: backendError.message,
            fallback: vercelError.message,
            environment: this.environment
          }
        };
      }
    }
  }

  // Get projects data
  async getProjects() {
    try {
      const response = await this.fetchWithRetry(`${this.baseURL}/projects`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Projects API error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Fallback responses when API is unavailable
  getFallbackResponse(question) {
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes('tech') || questionLower.includes('stack') || questionLower.includes('skills')) {
      return "Isaac's main tech stack includes React, FastAPI, Python, MongoDB, and Redis. He specializes in AI integrations with OpenAI APIs and building scalable backend systems. He's expert in full-stack development with a focus on clean code and performance.";
    }
    
    if (questionLower.includes('nutrivize') || questionLower.includes('project')) {
      return "Nutrivize is Isaac's flagship project - an AI-powered nutrition tracker using computer vision for food recognition. It's built with React, FastAPI, and integrates OpenAI's GPT-4 Vision for intelligent meal tracking with personalized insights.";
    }
    
    if (questionLower.includes('experience') || questionLower.includes('background')) {
      return "Isaac is a Full-Stack Developer and AI Engineer specializing in intelligent, scalable web applications. He focuses on clean code, performance optimization, and building tools with real-world impact. He's passionate about AI integration and modern web technologies.";
    }
    
    if (questionLower.includes('contact') || questionLower.includes('email') || questionLower.includes('reach')) {
      return "You can reach Isaac at isaacmineo@gmail.com, GitHub at github.com/GoldenRodger5, or LinkedIn at linkedin.com/in/isaacmineo2001. He's always open to discussing opportunities and collaborations!";
    }
    
    if (questionLower.includes('job') || questionLower.includes('career') || questionLower.includes('hiring')) {
      return "Isaac is seeking backend, AI engineering, or full-stack roles with innovative teams. He's particularly interested in healthtech, AI-powered productivity tools, developer tooling, and startups focused on making real-world impact.";
    }
    
    return "Isaac is a Full-Stack Developer specializing in AI-powered applications. Ask me about his tech stack, projects like Nutrivize, experience, or career goals. Contact him at isaacmineo@gmail.com for opportunities!";
  }
}

// Create and export singleton instance
export const apiClient = new APIClient();
export default apiClient;
