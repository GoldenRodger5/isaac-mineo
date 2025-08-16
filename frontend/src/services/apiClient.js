class APIClient {
  constructor() {
    this.environment = import.meta.env.MODE || 'development';
    
    // Dynamic base URL configuration
    this.baseURL = this.environment === 'production' 
      ? 'https://isaac-mineo-api.onrender.com'
      : import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    
    console.log('🌍 Environment:', this.environment);
    console.log('🔗 API Base URL:', this.baseURL);
  }

  // Get API base URL (for compatibility with other services)
  getApiBaseUrl() {
    return this.baseURL;
  }

  // Generic fetch with retry logic
  async fetchWithRetry(url, options = {}, attempt = 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Endpoint not found: ' + url);
        }
        
        if (response.status >= 500 && attempt < this.retryAttempts) {
          throw new Error('Server error: ' + response.status);
        }
        
        throw new Error('HTTP ' + response.status + ': ' + response.statusText);
      }

      return response;
    } catch (error) {
      if (attempt < this.retryAttempts && !error.message.includes('Endpoint not found')) {
        console.warn('API call failed (attempt ' + attempt + '/' + this.retryAttempts + '), retrying...', error);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.fetchWithRetry(this.baseURL.replace('/api', '') + '/health');
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Chat API
  async sendChatMessage(question, sessionId = null, includeFallback = true) {
    const startTime = Date.now();
    
    try {
      const response = await this.fetchWithRetry(this.baseURL + '/api/chatbot', {
        method: 'POST',
        body: JSON.stringify({ question, session_id: sessionId }),
      });

      const data = await response.json();
      const elapsed = Date.now() - startTime;
      
      console.log('✅ Chat response received in ' + elapsed + 'ms');
      return { 
        success: true, 
        data: {
          response: data.response || data.message || "No response received",
          sessionId: data.sessionId || data.session_id || sessionId,
          searchMethod: data.searchMethod,
          cached: data.cached,
          timestamp: data.timestamp,
          conversationLength: data.conversationLength
        }, 
        elapsed 
      };

    } catch (error) {
      console.error('❌ Chat API failed:', error.message);
      
      if (includeFallback) {
        return {
          success: false,
          data: {
            response: this.getFallbackResponse(question),
            sessionId: sessionId || ('fallback_' + Date.now()),
            fallback: true,
            searchMethod: 'fallback'
          },
          error: error.message
        };
      }
      
      throw error;
    }
  }

  // Contact API
  async sendContactMessage(name, email, message) {
    const startTime = Date.now();
    console.log('📧 Sending contact email via ' + this.environment + ' environment...');
    
    try {
      console.log('🎯 Using FastAPI backend: ' + this.baseURL + '/contact');
      const response = await this.fetchWithRetry(this.baseURL + '/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();
      const elapsed = Date.now() - startTime;
      console.log('✅ Contact email sent successfully in ' + elapsed + 'ms');
      
      return { success: true, data, elapsed };

    } catch (error) {
      const elapsed = Date.now() - startTime;
      console.error('❌ Contact email failed:', error.message);
      
      return {
        success: false,
        error: error.message,
        elapsed,
        fallbackMessage: "Thank you for your message! While I couldn't send it through the automated system, you can reach Isaac directly at isaacmineo@gmail.com"
      };
    }
  }

  // Projects API
  async getProjects() {
    try {
      const response = await this.fetchWithRetry(this.baseURL + '/projects');
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('❌ Projects API failed:', error.message);
      return {
        success: false,
        error: error.message,
        data: this.getFallbackResponse('projects')
      };
    }
  }

  // Fallback responses when API is unavailable
  getFallbackResponse(question) {
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes('tech') || questionLower.includes('stack') || questionLower.includes('skills') || questionLower.includes('technologies')) {
      return "**Isaac's Complete Technology Stack:**\\n\\n🚀 **Frontend Technologies (Expert):**\\n• **React 18** (Expert) - Hooks, Context, performance - Used in Nutrivize, Portfolio\\n• **TypeScript/JavaScript** (Expert) - ES6+, async programming - All projects\\n• **Tailwind CSS** (Expert) - Utility-first styling - Portfolio, modern UI/UX\\n• **HTML5/CSS3** (Expert) - Semantic markup, animations - All web applications\\n\\n🔧 **Backend Technologies (Expert):**\\n• **Python** (Expert) - OOP, async programming - Nutrivize, EchoPod, SignalFlow\\n• **FastAPI** (Expert) - RESTful APIs, async, documentation - Production APIs\\n• **Node.js** (Proficient) - Server-side JavaScript, API development\\n• **Database Design** (Expert) - MongoDB, Redis, optimization - Scalable systems\\n\\n🤖 **AI & Machine Learning (Expert):**\\n• **OpenAI GPT-4/Vision** (Expert) - Nutrivize food recognition, Portfolio chat\\n• **Claude API** (Proficient) - Advanced conversations - Nutrivize insights\\n• **Vector Databases** (Proficient) - Pinecone for semantic search - Portfolio AI\\n• **Prompt Engineering** (Expert) - Context optimization, response quality\\n\\n💾 **Databases (Expert):**\\n• **MongoDB Atlas** (Expert) - Production data storage - Nutrivize, SignalFlow\\n• **Redis Cloud** (Expert) - Caching, sessions - Performance optimization\\n• **Firebase** (Proficient) - Auth, real-time features - User management\\n\\n☁️ **Cloud & Deployment (Proficient):**\\n• **Vercel** (Expert) - Frontend deployment - Portfolio, optimized performance\\n• **Render** (Expert) - Backend hosting - FastAPI services, databases\\n• **Performance Optimization** (Expert) - Sub-2s load times, caching strategies\\n\\n**Real-World Projects:**\\n• **Nutrivize**: React + FastAPI + MongoDB + OpenAI Vision (Live)\\n• **SignalFlow**: Python + FastAPI + MongoDB + AI Analysis (Live)\\n• **Portfolio**: React + Vite + Tailwind + FastAPI + Pinecone + AI Chat\\n• **EchoPod**: Python + NLP + Voice Synthesis + Audio Processing\\n\\nIsaac specializes in full-stack development with AI integration and has production experience across all these technologies.";
    }
    
    return "Isaac is a Full-Stack Developer specializing in AI-powered applications. Ask me about his tech stack, projects like Nutrivize, experience, or career goals. Contact him at isaacmineo@gmail.com for opportunities!";
  }
}

// Create and export singleton instance
export const apiClient = new APIClient();
export default apiClient;
