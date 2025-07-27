// API Client Service - Centralized API communication
// Handles all API calls with error handling, retry logic, and caching

class APIClient {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    this.timeout = 10000; // 10 seconds
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
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

  // Send contact form email
  async sendContactEmail(contactData) {
    try {
      const response = await this.fetchWithRetry(`${this.baseURL}/contact`, {
        method: 'POST',
        body: JSON.stringify(contactData),
      });

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Contact form error:', error);
      return {
        success: false,
        error: error.message
      };
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
      return "You can reach Isaac at isaac@isaacmineo.com, GitHub at github.com/GoldenRodger5, or LinkedIn at linkedin.com/in/isaacmineo2001. He's always open to discussing opportunities and collaborations!";
    }
    
    if (questionLower.includes('job') || questionLower.includes('career') || questionLower.includes('hiring')) {
      return "Isaac is seeking backend, AI engineering, or full-stack roles with innovative teams. He's particularly interested in healthtech, AI-powered productivity tools, developer tooling, and startups focused on making real-world impact.";
    }
    
    return "Isaac is a Full-Stack Developer specializing in AI-powered applications. Ask me about his tech stack, projects like Nutrivize, experience, or career goals. Contact him at isaac@isaacmineo.com for opportunities!";
  }
}

// Create and export singleton instance
export const apiClient = new APIClient();
export default apiClient;
