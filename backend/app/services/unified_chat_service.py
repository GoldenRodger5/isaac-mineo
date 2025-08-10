"""
Unified Chat Service - Single optimized service for all chat functionality
Combines AI routing, ultra-fast search, voice support, and intelligent caching
"""

import openai
import asyncio
import os
import time
import json
from typing import Dict, Any, Optional, List
from uuid import uuid4
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

from app.utils.cache_manager import CacheManager
from app.models.chat_models import ChatRequest, ChatResponse
from app.services.ultra_fast_search import ultra_fast_search

class UnifiedChatService:
    """Single optimized chat service for all functionality"""
    
    def __init__(self):
        # Core services
        self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.cache_manager = CacheManager()
        self.executor = ThreadPoolExecutor(max_workers=3)
        
        # AI routing prompts
        self.classifier_prompt = """Classify this query into one of these categories:

1. SIMPLE - Basic greetings, acknowledgments, and short phrases like "hi", "hello", "hey", "thanks", "thank you", "ok", "goodbye", "nice", "cool" (< 20 characters, no specific questions)
2. DETAILED - All substantive questions about projects, skills, experience, technology, etc. (DEFAULT)
3. CONTACT - Direct requests for contact information only

Query: {query}
Response: Just the category name (SIMPLE/DETAILED/CONTACT)"""

        self.simple_prompt = """You are Isaac Mineo's friendly portfolio assistant. For simple greetings and basic interactions, respond warmly and briefly, then offer to help with more specific information.

Isaac is a full-stack developer and AI engineer specializing in modern web technologies and intelligent applications.

For simple greetings like "hi", "hello", "thanks" - respond with a friendly greeting and briefly mention what you can help with.

**If asked for more details, I can share:**
• **Projects**: Nutrivize (AI nutrition tracker), EchoPod (AI podcast generator), Quizium (smart flashcards), SignalFlow (trading analysis)
• **Technical Skills**: React, Python, FastAPI, AI/ML integration, MongoDB, Redis
• **Contact**: isaacmineo@gmail.com | LinkedIn | GitHub

Keep simple responses brief and friendly. Use markdown formatting for clarity."""

        self.detailed_prompt = """You are Isaac Mineo's professional portfolio assistant for recruiters and collaborators. Provide comprehensive, impressive responses showcasing Isaac's expertise.

Isaac Mineo - Full-stack Developer & AI Engineer:

**COMPLETE TECHNICAL STACK:**

🚀 Frontend Technologies:
• React 18 (Expert) - Hooks, Context, performance optimization - Used in Nutrivize, Portfolio
• JavaScript/TypeScript (Expert) - ES6+, async programming - All frontend projects  
• Tailwind CSS (Expert) - Utility-first styling - Portfolio Website, modern UI/UX
• HTML5/CSS3 (Expert) - Semantic markup, animations - All web applications
• Vite (Proficient) - Build optimization - Portfolio development environment

🔧 Backend Technologies:
• Python (Expert) - OOP, async programming - Nutrivize, EchoPod, SignalFlow backends
• FastAPI (Expert) - REST APIs, WebSockets - Nutrivize API, Portfolio chat system
• Node.js (Proficient) - Express, middleware - Quizium backend development

🤖 AI & Machine Learning:
• OpenAI API (Expert) - GPT-4, Vision, embeddings - Nutrivize food recognition, Portfolio AI
• Claude API (Proficient) - Advanced conversations - Nutrivize nutrition companion
• Vector Databases (Learning) - Pinecone semantic search - Portfolio knowledge base
• Prompt Engineering (Expert) - Context optimization - All AI-powered features

💾 Databases & Cloud:
• MongoDB (Expert) - Document design, Atlas - Nutrivize user data, SignalFlow analytics
• Redis (Proficient) - Caching, sessions - Portfolio performance, Nutrivize optimization
• Firebase (Proficient) - Authentication, real-time - Nutrivize user management
• Vercel/Render (Expert) - Deployment, scaling - All production applications

**FEATURED PROJECT IMPLEMENTATIONS:**

• **Nutrivize**: Full-stack AI nutrition tracker
  - Tech: React PWA + Python FastAPI + MongoDB + OpenAI Vision + Redis caching
  - Features: AI food recognition, ML recommendations, real-time analytics
  
• **Portfolio Website**: AI-powered professional showcase  
  - Tech: React + Vite + Tailwind + FastAPI + Pinecone + OpenAI chat
  - Features: Vector search, conversational AI, performance optimization

• **EchoPod**: AI podcast generation platform
  - Tech: Python + NLP + Voice synthesis + Audio processing
  - Features: Automated content creation, voice personality customization

• **SignalFlow**: Trading analysis platform
  - Tech: Python + FastAPI + MongoDB + Real-time data + Analytics dashboards
  - Features: Multi-agent AI, risk management, performance tracking

**Education:** Computer Science with AI/ML specialization
**Contact:** isaacmineo@gmail.com | LinkedIn | GitHub

SPECIAL INSTRUCTIONS FOR TECH STACK QUESTIONS:
When users ask about "tech stack", "technologies", "what tech", provide the COMPLETE detailed breakdown above with specific project examples and proficiency levels. Always reference which projects use which technologies and explain real-world applications.

Create detailed, professional responses with markdown formatting. Highlight technical achievements and innovation with specific examples from actual projects."""

    async def process_message(self, question: str, session_id: Optional[str] = None, client_ip: str = "unknown") -> Dict[str, Any]:
        """Main entry point for all chat processing"""
        start_time = time.time()
        
        # Initialize session
        if not session_id:
            session_id = str(uuid4())
        
        # Ensure cache is connected
        if not self.cache_manager.connected:
            await self.cache_manager.connect()
        
        try:
            # Step 1: AI-powered query classification
            query_type = await self._classify_query(question)
            
            # Step 2: Get context using ultra-fast search
            context = await self._get_context(question, query_type)
            
            # Step 3: Generate response with appropriate model
            response = await self._generate_response(question, context, query_type)
            
            # Step 4: Cache and return
            await self._cache_response(session_id, question, response)
            
            processing_time = time.time() - start_time
            
            return {
                "response": response,
                "sessionId": session_id,
                "searchMethod": f"unified_{query_type.lower()}",
                "conversationLength": 1,  # Will be implemented with session tracking
                "cached": False,
                "timestamp": datetime.now().isoformat(),
                "entities": {},  # Will be implemented with NER
                "contextUsed": [f"AI-routed {query_type.lower()}: {processing_time:.2f}s | Ultra-fast search"],
                "processingTime": processing_time
            }
            
        except Exception as e:
            print(f"❌ Unified chat error: {e}")
            # Fallback response
            return await self._fallback_response(question, session_id, str(e))

    async def _classify_query(self, question: str) -> str:
        """AI-powered query classification"""
        try:
            response = await asyncio.wait_for(
                asyncio.get_event_loop().run_in_executor(
                    self.executor,
                    lambda: self.openai_client.chat.completions.create(
                        model="gpt-4o-mini",  # Fast, cheap classifier
                        messages=[
                            {"role": "user", "content": self.classifier_prompt.format(query=question)}
                        ],
                        max_tokens=10,
                        temperature=0
                    )
                ),
                timeout=3.0
            )
            
            classification = response.choices[0].message.content.strip().upper()
            
            # Validate classification
            if classification in ["SIMPLE", "DETAILED", "CONTACT"]:
                return classification
            else:
                # Default fallback - be more precise about SIMPLE classification
                simple_keywords = ["hi", "hello", "hey", "thanks", "thank you", "ok", "okay", "yes", "no", "nice", "cool", "good", "bye", "goodbye"]
                very_short = len(question.strip()) < 20
                question_clean = question.lower().strip().rstrip('!?.')
                is_simple_greeting = question_clean in simple_keywords
                
                # Only classify as SIMPLE if it's clearly a greeting/acknowledgment
                if very_short and is_simple_greeting:
                    return "SIMPLE"
                else:
                    return "DETAILED"  # Default to detailed for everything else
                    
        except Exception as e:
            print(f"⚠️ Classification fallback: {e}")
            # Smart fallback classification - be more precise for simple greetings
            if any(word in question.lower() for word in ["email", "contact", "phone", "linkedin"]):
                return "CONTACT"
            elif len(question.strip()) < 20 and question.lower().strip().rstrip('!?.') in ["hi", "hello", "hey", "thanks", "thank you", "ok", "okay", "yes", "no", "nice", "cool", "good", "bye", "goodbye"]:
                return "SIMPLE"
            else:
                return "DETAILED"  # Default to detailed

    async def _get_context(self, question: str, query_type: str) -> str:
        """Get context using ultra-fast search"""
        try:
            # Use different search complexity based on classification
            if query_type == "CONTACT":
                # Contact queries can use instant responses
                return await ultra_fast_search.smart_search(question)
            elif query_type == "SIMPLE":
                return await ultra_fast_search.unified_search(question, "simple")
            else:  # DETAILED
                return await ultra_fast_search.unified_search(question, "detailed")
                
        except Exception as e:
            print(f"⚠️ Context search failed: {e}")
            return ultra_fast_search._get_fast_fallback(question, query_type.lower())

    async def _generate_response(self, question: str, context: str, query_type: str) -> str:
        """Generate response with appropriate model and prompt"""
        try:
            # Choose model and prompt based on classification
            if query_type == "DETAILED":
                model = "gpt-4o"  # Best model for detailed responses
                system_prompt = self.detailed_prompt
                max_tokens = 2000
                timeout = 25.0
            else:  # SIMPLE or CONTACT
                model = "gpt-4o-mini"  # Fast model for simple responses
                system_prompt = self.simple_prompt
                max_tokens = 1200  # Increased for more informative simple responses
                timeout = 12.0  # Slightly increased timeout
            
            # Create messages
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Context: {context}\n\nQuestion: {question}"}
            ]
            
            # Generate response
            response = await asyncio.wait_for(
                asyncio.get_event_loop().run_in_executor(
                    self.executor,
                    lambda: self.openai_client.chat.completions.create(
                        model=model,
                        messages=messages,
                        max_tokens=max_tokens,
                        temperature=0.7,
                        stream=False
                    )
                ),
                timeout=timeout
            )
            
            return response.choices[0].message.content.strip()
            
        except asyncio.TimeoutError:
            print(f"⚠️ Response timeout for {query_type}")
            return self._get_timeout_fallback(question, query_type)
        except Exception as e:
            print(f"⚠️ Response generation failed: {e}")
            return self._get_error_fallback(question, query_type)

    async def _cache_response(self, session_id: str, question: str, response: str):
        """Cache response for future use"""
        try:
            cache_key = f"chat_{session_id}_{hash(question)}"
            await self.cache_manager.set(
                cache_key, 
                {"question": question, "response": response, "timestamp": time.time()},
                expire=1800  # 30 minutes
            )
        except Exception as e:
            print(f"⚠️ Caching failed: {e}")

    async def _fallback_response(self, question: str, session_id: str, error: str) -> Dict[str, Any]:
        """Generate fallback response when main processing fails"""
        fallback_text = """I'm Isaac Mineo's portfolio assistant. I can help you learn about Isaac's projects and experience.

**Isaac Mineo - Full-stack Developer**
• **Projects:** Nutrivize (AI nutrition tracker), EchoPod (AI podcasts), Quizium (smart flashcards), Signalflow (trading analysis)
• **Skills:** React, Python, FastAPI, AI/ML integration, cloud deployment
• **Contact:** isaacmineo@gmail.com | [LinkedIn](https://linkedin.com/in/isaac-mineo) | [GitHub](https://github.com/isaac-mineo)

Please try asking about Isaac's specific projects, skills, or contact information."""
        
        return {
            "response": fallback_text,
            "sessionId": session_id,
            "searchMethod": "fallback",
            "conversationLength": 1,
            "cached": False,
            "timestamp": datetime.now().isoformat(),
            "entities": {},
            "contextUsed": [f"Fallback response due to error: {error}"],
            "processingTime": 0.1
        }

    def _get_timeout_fallback(self, question: str, query_type: str) -> str:
        """Quick fallback for timeouts"""
        if "contact" in question.lower():
            return "You can reach Isaac at isaacmineo@gmail.com or connect on LinkedIn: https://linkedin.com/in/isaac-mineo"
        elif "nutrivize" in question.lower():
            return "Nutrivize is Isaac's AI-powered nutrition tracker that provides personalized dietary recommendations using machine learning."
        else:
            return "Isaac Mineo is a full-stack developer specializing in React, Python, and AI integration. Contact: isaacmineo@gmail.com"

    def _get_error_fallback(self, question: str, query_type: str) -> str:
        """Fallback for errors"""
        return """Isaac Mineo - Full-stack Developer & AI Engineer

**Featured Projects:**
• Nutrivize: AI nutrition tracker with ML recommendations
• EchoPod: AI podcast generator with voice synthesis
• Quizium: Intelligent flashcard creator
• Signalflow: Trading analysis platform

**Contact:** isaacmineo@gmail.com | [LinkedIn](https://linkedin.com/in/isaac-mineo)"""

    # Voice chat support methods
    async def process_voice_message(self, audio_data: bytes, session_id: Optional[str] = None) -> Dict[str, Any]:
        """Process voice input and return text + audio response"""
        # This would integrate with Deepgram/ElevenLabs for voice processing
        # For now, return text processing
        text_query = "Voice processing not implemented yet"
        return await self.process_message(text_query, session_id)

    async def get_session_history(self, session_id: str) -> List[Dict[str, Any]]:
        """Get conversation history for a session"""
        try:
            # Implementation for session tracking
            history = await self.cache_manager.get(f"session_{session_id}")
            return history or []
        except Exception as e:
            print(f"⚠️ Session history failed: {e}")
            return []

# Global instance
unified_chat_service = UnifiedChatService()
