"""
Ultra-fast single-index search service for portfolio chat
Optimized for speed with unified search and embedding reuse
"""

import openai
import asyncio
import os
import time
from typing import Dict, Any, List
import hashlib

class UltraFastSearchService:
    """Lightning-fast single-index search with embedding reuse and smart caching"""
    
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self._embedding_cache = {}  # Cache embeddings for reuse
        self._search_cache = {}     # Cache search results
        
    async def create_embedding_cached(self, text: str) -> List[float]:
        """Create embedding with caching for reuse"""
        # Create hash key for caching
        text_hash = hashlib.md5(text.encode()).hexdigest()
        
        if text_hash in self._embedding_cache:
            return self._embedding_cache[text_hash]
        
        try:
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.openai_client.embeddings.create(
                    model="text-embedding-3-small",  # Faster, cheaper model
                    input=text.replace("\n", " ")
                )
            )
            embedding = response.data[0].embedding
            
            # Cache for reuse (limit cache size)
            if len(self._embedding_cache) < 100:
                self._embedding_cache[text_hash] = embedding
            
            return embedding
            
        except Exception as e:
            print(f"Embedding error: {e}")
            # Return dummy embedding as fallback
            return [0.0] * 1536
    
    async def unified_search(self, query: str, complexity: str = "simple") -> str:
        """Ultra-fast unified search across all content with smart filtering"""
        
        # Check cache first
        cache_key = f"{hash(query)}_{complexity}"
        if cache_key in self._search_cache:
            cached_result = self._search_cache[cache_key]
            if time.time() - cached_result["timestamp"] < 300:  # 5 min cache
                return cached_result["content"]
        
        try:
            # Use ONLY semantic search on PROJECTS index for maximum speed
            from app.utils.pinecone_service import semantic_search, IndexType
            
            # Determine search parameters based on complexity
            if complexity == "simple":
                top_k = 2  # Minimal results for speed
                index_type = IndexType.PROFESSIONAL  # Likely to have contact/basic info
            else:
                top_k = 5  # More results for detailed responses
                index_type = IndexType.PROJECTS  # Projects have technical details
            
            # Single, fast semantic search call
            start_time = time.time()
            search_results = await asyncio.wait_for(
                semantic_search(query, index_type, top_k),
                timeout=1.5  # Very aggressive timeout
            )
            search_time = time.time() - start_time
            
            # Format results quickly
            if search_results and isinstance(search_results, list):
                formatted_results = []
                for result in search_results:
                    if isinstance(result, dict) and result.get("content"):
                        text = result["content"][:300] if complexity == "simple" else result["content"][:500]
                        formatted_results.append(text)
                
                final_content = " ".join(formatted_results)
                print(f"🚀 Ultra-fast search: {search_time:.2f}s | {len(final_content)} chars")
            else:
                final_content = self._get_fast_fallback(query, complexity)
                print(f"🚀 Ultra-fast fallback: {search_time:.2f}s")
            
            # Cache result
            if len(self._search_cache) < 50:  # Limit cache size
                self._search_cache[cache_key] = {
                    "content": final_content,
                    "timestamp": time.time()
                }
            
            return final_content
            
        except asyncio.TimeoutError:
            print("⚡ Search timeout - using fallback")
            return self._get_fast_fallback(query, complexity)
        except Exception as e:
            print(f"Search error: {e}")
            return self._get_fast_fallback(query, complexity)
    
    def _get_fast_fallback(self, query: str, complexity: str) -> str:
        """Ultra-fast fallback knowledge without any external calls"""
        query_lower = query.lower()
        
        # Project-specific fallbacks
        if any(word in query_lower for word in ["nutrivize", "nutrition", "health", "ai nutrition"]):
            if complexity == "detailed":
                return """Nutrivize - AI-Powered Nutrition Tracker:
• Overview: Advanced nutrition tracking application with machine learning recommendations
• Technical Stack: React frontend, Python backend with FastAPI, AI/ML integration
• Key Features: Personalized dietary recommendations, calorie tracking, meal planning
• ML Components: Recommendation algorithms, dietary analysis, nutrition optimization
• Architecture: RESTful API design, cloud deployment, scalable database architecture
• Innovation: Uses AI to provide personalized nutrition guidance based on user data and preferences"""
            else:
                return "Nutrivize: AI-powered nutrition tracker with ML recommendations for personalized dietary guidance. Built with React, Python, and FastAPI."
        
        elif any(word in query_lower for word in ["echopod", "podcast", "audio", "voice synthesis"]):
            if complexity == "detailed":
                return """EchoPod - AI Podcast Generator:
• Overview: Innovative AI-powered podcast creation platform with voice synthesis
• Technical Stack: Python backend, advanced NLP, voice synthesis APIs
• Key Features: Automated content generation, high-quality voice synthesis, audio processing
• AI Components: Natural language processing, text-to-speech conversion, content optimization
• Technical Challenges: Real-time audio processing, voice quality optimization, scalable generation
• Innovation: Automates entire podcast creation workflow using cutting-edge AI technology"""
            else:
                return "EchoPod: AI podcast generator with voice synthesis technology. Creates engaging audio content automatically using advanced NLP."
        
        elif any(word in query_lower for word in ["quizium", "flashcard", "learning", "spaced repetition"]):
            if complexity == "detailed":
                return """Quizium - Intelligent Flashcard Creator:
• Overview: Smart learning platform using spaced repetition algorithms
• Technical Stack: React frontend, Python backend, intelligent scheduling algorithms
• Key Features: Adaptive learning, spaced repetition, progress tracking, performance analytics
• Algorithm: Implements scientifically-proven spaced repetition for optimal retention
• User Experience: Intuitive interface, personalized learning paths, engagement optimization
• Educational Impact: Optimizes learning efficiency through data-driven scheduling"""
            else:
                return "Quizium: Intelligent flashcard creator using spaced repetition algorithms to optimize learning retention and engagement."
        
        elif any(word in query_lower for word in ["signalflow", "trading", "finance", "analysis"]):
            if complexity == "detailed":
                return """Signalflow - Advanced Trading Analysis Platform:
• Overview: Sophisticated financial analysis platform for trading professionals
• Technical Stack: Python backend, real-time data processing, advanced analytics
• Key Features: Real-time market analysis, predictive modeling, risk assessment
• Data Processing: High-frequency data ingestion, complex algorithmic analysis
• Analytics: Technical indicators, pattern recognition, trend analysis
• Professional Tools: Dashboard interfaces, alert systems, portfolio management"""
            else:
                return "Signalflow: Advanced trading analysis platform providing real-time insights and predictive analytics for financial professionals."
        
        # Tech stack and skills specific fallbacks
        elif any(word in query_lower for word in ["tech stack", "technology", "technologies", "skills", "technical", "programming", "development", "expertise"]):
            if complexity == "detailed":
                return """Isaac Mineo - Complete Technology Stack & Expertise:

🚀 **FRONTEND TECHNOLOGIES:**
• **React 18** (Expert) - Hooks, Context, state management, performance optimization
  - Used in: Nutrivize (PWA), Portfolio Website, Quizium
• **JavaScript/TypeScript** (Expert) - ES6+, async/await, modern patterns
  - Projects: All frontend applications, API integrations
• **HTML5/CSS3** (Expert) - Semantic markup, animations, responsive design
  - Used in: All web projects with custom animations and responsive layouts
• **Tailwind CSS** (Expert) - Utility-first styling, custom components, responsive design
  - Projects: Portfolio Website, Nutrivize UI, modern component design
• **Vite** (Proficient) - Build tool, dev server, optimizations
  - Used in: Portfolio Website for lightning-fast development and builds

🔧 **BACKEND TECHNOLOGIES:**
• **Python** (Expert) - OOP, async programming, clean architecture
  - Projects: Nutrivize backend, EchoPod processing, SignalFlow algorithms
• **FastAPI** (Expert) - REST APIs, async programming, documentation, WebSockets
  - Used in: Nutrivize API, Portfolio backend, real-time chat systems
• **Node.js** (Proficient) - Express, REST APIs, middleware
  - Projects: Quizium backend, API development

🤖 **AI & MACHINE LEARNING:**
• **OpenAI API Integration** (Expert) - GPT-4, embeddings, vision models, prompt engineering
  - Used in: Nutrivize food recognition, Portfolio AI chat, EchoPod content generation
• **Claude API** (Proficient) - Anthropic's AI models, conversation design
  - Projects: Nutrivize nutrition companion, advanced AI interactions
• **Vector Databases** (Learning) - Pinecone, embeddings, semantic search
  - Used in: Portfolio AI chat knowledge base, intelligent search systems
• **Prompt Engineering** (Expert) - Context design, response optimization
  - Applied across all AI-powered features and applications

💾 **DATABASES & STORAGE:**
• **MongoDB** (Expert) - Document design, aggregation, indexing, Atlas cloud
  - Projects: Nutrivize user data, SignalFlow trading data, complex data structures
• **Redis** (Proficient) - Caching, session management, rate limiting
  - Used in: Portfolio performance optimization, Nutrivize caching layer
• **Firebase** (Proficient) - Authentication, real-time database, cloud functions
  - Projects: Nutrivize user authentication, real-time data sync

☁️ **CLOUD & DEPLOYMENT:**
• **Vercel** (Expert) - Frontend deployment, serverless functions, domains
  - Used in: Portfolio Website, Nutrivize frontend, optimized deployments
• **Render** (Proficient) - Backend deployment, databases, monitoring
  - Projects: FastAPI backends, database hosting, production environments
• **AWS** (Learning) - S3, Lambda, cloud infrastructure
  - Exploring: Scalable cloud architecture, serverless computing

🛠️ **DEVELOPMENT TOOLS:**
• **Git/GitHub** (Expert) - Version control, collaboration, CI/CD workflows
• **VS Code** (Expert) - Extensions, debugging, productivity optimization
• **Docker** (Basic) - Containerization, development environments
• **Chrome DevTools** (Expert) - Debugging, performance analysis, optimization

📊 **REAL-WORLD PROJECT APPLICATIONS:**
• **Nutrivize**: React + FastAPI + MongoDB + OpenAI + Redis + Vercel/Render
• **Portfolio**: React + Vite + Tailwind + FastAPI + Pinecone + OpenAI
• **EchoPod**: Python + NLP + Voice Synthesis + Audio Processing
• **SignalFlow**: Python + FastAPI + MongoDB + Real-time Data + Analytics
• **Quizium**: React + Node.js + Spaced Repetition Algorithms

Each project demonstrates full-stack capabilities with modern best practices, AI integration, and production deployment experience."""
            else:
                return "Isaac's tech stack: React, TypeScript, Python, FastAPI, MongoDB, Redis, OpenAI APIs, Tailwind CSS, Vercel/Render deployment. Expert in full-stack development with AI integration across multiple production projects."

        # General technical skills and experience
        elif any(word in query_lower for word in ["skills", "experience", "expertise", "background"]):
            if complexity == "detailed":
                return """Isaac Mineo - Full-stack Developer & AI Engineer:

Technical Expertise:
• Frontend: React.js, JavaScript/TypeScript, responsive design, modern UI/UX
• Backend: Python, FastAPI, RESTful API design, microservices architecture  
• AI/ML: Machine learning integration, natural language processing, predictive modeling
• Cloud & DevOps: Cloud deployment, scalable architecture, database optimization
• Development: Full-stack development, system design, performance optimization

Professional Experience:
• Proven track record developing innovative AI-powered applications
• Experience with complex technical challenges and scalable solutions
• Strong foundation in computer science with AI/ML specialization
• Portfolio demonstrates expertise across multiple technology domains

Featured Projects showcase end-to-end development capabilities from concept to deployment."""
            else:
                return "Isaac Mineo - Full-stack developer with expertise in React, Python, FastAPI, and AI/ML integration. Proven experience building innovative applications."
        
        # General portfolio fallback
        if complexity == "detailed":
            return """Isaac Mineo - Full-stack Developer & AI Engineer:

• Technical Stack: React, Python, FastAPI, AI/ML integration, cloud deployment
• Featured Projects: 
  - Nutrivize: AI nutrition tracker with ML recommendations
  - EchoPod: AI podcast generator with voice synthesis
  - Quizium: Smart flashcard creator with spaced repetition
  - Signalflow: Advanced trading analysis platform
• Education: Computer Science with AI/ML specialization
• Professional Focus: Building innovative applications that leverage AI to solve real-world problems
• Contact: isaacmineo@gmail.com | LinkedIn: isaac-mineo | GitHub: isaac-mineo

Ready for challenging opportunities in full-stack development and AI engineering."""
        else:
            return "Isaac Mineo - Full-stack developer specializing in React, Python, FastAPI, and AI integration. Contact: isaacmineo@gmail.com"
    
    async def smart_search(self, query: str, complexity: str = "simple") -> str:
        """Smart search that chooses the fastest appropriate method"""
        
        # For very simple queries, skip search entirely
        simple_patterns = ["email", "contact", "phone", "linkedin", "github"]
        if any(pattern in query.lower() for pattern in simple_patterns) and len(query) < 30:
            return self._get_contact_info(query)
        
        # For everything else, use unified search
        return await self.unified_search(query, complexity)
    
    def _get_contact_info(self, query: str) -> str:
        """Instant contact info without any external calls"""
        query_lower = query.lower()
        
        if "email" in query_lower:
            return "Isaac's email address is isaacmineo@gmail.com"
        elif "linkedin" in query_lower:
            return "Isaac's LinkedIn profile: https://linkedin.com/in/isaac-mineo"
        elif "github" in query_lower:
            return "Isaac's GitHub profile: https://github.com/isaac-mineo"
        elif "phone" in query_lower:
            return "Isaac's phone number is available upon request via email at isaacmineo@gmail.com"
        else:
            return """Isaac's contact information:
• Email: isaacmineo@gmail.com
• LinkedIn: https://linkedin.com/in/isaac-mineo  
• GitHub: https://github.com/isaac-mineo
• Phone: Available upon request"""

# Global instance for reuse
ultra_fast_search = UltraFastSearchService()
