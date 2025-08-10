from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import openai
import os
from uuid import uuid4
import time
import json
import re
from datetime import datetime

# Import our utilities
from app.utils.pinecone_service import hybrid_search, initialize_pinecone_indexes
from app.utils.cache_manager import CacheManager
from app.utils.rate_limiter import RateLimiter
from app.services.email_service import email_service
from app.services.unified_chat_service import unified_chat_service
from app.models.chat_models import ChatRequest, ChatResponse, ContactRequest, ContactResponse

router = APIRouter()

# Initialize services
cache_manager = CacheManager()
rate_limiter = RateLimiter()

# Initialize OpenAI client
openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def is_portfolio_related(text: str) -> bool:
    """Check if the question is related to Isaac's portfolio, projects, or professional background"""
    text_lower = text.lower()
    
    # Portfolio-related keywords
    portfolio_keywords = [
        # Personal/Professional
        "isaac", "you", "your", "yourself", "who are you", "tell me about",
        
        # Projects
        "nutrivize", "echopod", "quizium", "signalflow", "project", "projects", "work", "built", "created",
        
        # Technical skills
        "tech stack", "technology", "technologies", "programming", "coding", "development", "developer",
        "react", "fastapi", "python", "javascript", "ai", "machine learning", "mongodb", "redis",
        "framework", "library", "database", "api", "backend", "frontend", "full-stack",
        
        # Professional background
        "experience", "background", "education", "skills", "abilities", "expertise", "career",
        "work history", "professional", "resume", "cv", "qualifications", "achievements",
        
        # Contact/Business
        "contact", "reach", "email", "hire", "opportunity", "available", "collaboration",
        "freelance", "consulting", "services"
    ]
    
    # Off-topic indicators (things clearly not about Isaac)
    off_topic_indicators = [
        "weather", "news", "politics", "sports", "movie", "recipe", "cooking", "travel",
        "health advice", "medical", "legal advice", "financial advice", "investment",
        "how to", "tutorial", "explain quantum", "what is the capital", "who won",
        "current events", "celebrity", "entertainment", "joke", "funny", "meme"
    ]
    
    # Check for off-topic indicators first
    if any(indicator in text_lower for indicator in off_topic_indicators):
        return False
    
    # Check for portfolio-related content
    return any(keyword in text_lower for keyword in portfolio_keywords)

def generate_redirect_response(question: str) -> str:
    """Generate a friendly response that redirects off-topic questions back to portfolio topics"""
    question_lower = question.lower()
    
    # Specific redirects based on question type
    if any(word in question_lower for word in ["football", "sports", "team", "game"]):
        return """I appreciate your curiosity! While I don't have information about Isaac's sports preferences, I'd love to tell you about his **professional interests** and **technical projects**. 

🚀 **What I can help you with:**
- **Projects**: Nutrivize (AI nutrition tracker), EchoPod (podcast generator), Quizium (AI flashcard creator)
- **Technical Skills**: React, FastAPI, Python, AI/ML integrations
- **Professional Background**: Full-stack development, AI engineering
- **Career Goals**: What Isaac is looking for in his next role

What aspect of Isaac's **portfolio** or **technical expertise** would you like to explore?"""
    
    elif any(word in question_lower for word in ["weather", "news", "politics"]):
        return """I'm focused on sharing information about **Isaac's professional portfolio** and **technical projects**! 

🎯 **I can tell you about:**
- **Featured Projects**: Nutrivize, EchoPod, Quizium, and Signalflow
- **Technical Expertise**: React, FastAPI, Python, AI APIs, and full-stack development  
- **Educational Background**: Computer Science studies and technical achievements
- **Career Aspirations**: What Isaac is looking for in his next opportunity

Which of Isaac's **projects** or **technical skills** interests you most?"""
    
    elif any(word in question_lower for word in ["recipe", "cooking", "food"]) and "nutrivize" not in question_lower:
        return """While I can't help with recipes, I can tell you about Isaac's **Nutrivize project** - an AI-powered nutrition tracker that uses computer vision for food recognition! 

🍎 **Nutrivize Features:**
- **AI Food Recognition**: Upload photos to automatically identify meals
- **Nutrition Tracking**: Detailed macro and micronutrient analysis  
- **Tech Stack**: React frontend, FastAPI backend, OpenAI GPT-4 Vision
- **Real-world Impact**: Helps users maintain healthy eating habits

Want to learn more about **Nutrivize** or Isaac's other **technical projects**?"""
    
    else:
        return """I'm Isaac's **portfolio assistant**, focused on sharing information about his **professional work** and **technical projects**! 

💼 **I can help you discover:**
- **Project Portfolio**: Nutrivize, EchoPod, Quizium, and more
- **Technical Skills**: React, FastAPI, Python, AI integrations
- **Professional Experience**: Full-stack development and AI engineering
- **Educational Background**: Computer Science and technical achievements
- **Contact Information**: How to reach Isaac for opportunities

What would you like to know about Isaac's **professional background** or **technical projects**?"""

def extract_entities(text: str) -> Dict[str, List[str]]:
    """Extract entities and topics from user messages for context tracking"""
    entities = {
        "projects": [],
        "topics": [],
        "skills": [],
        "companies": []
    }
    
    text_lower = text.lower()
    
    # Projects
    project_patterns = {
        "nutrivize": ["nutrivize", "nutrition tracker", "food recognition", "health app"],
        "echopod": ["echopod", "podcast", "echo pod", "voice synthesis"],
        "quizium": ["quizium", "quiz", "flashcard", "study app"],
        "signalflow": ["signalflow", "signal flow", "trading", "ai trading"],
        "portfolio": ["portfolio", "this website", "this site", "personal website"]
    }
    
    for project, keywords in project_patterns.items():
        if any(keyword in text_lower for keyword in keywords):
            entities["projects"].append(project)
    
    # Detailed Topics for Better Response Targeting
    topic_patterns = {
        "tech_stack": ["tech stack", "technology", "technologies", "programming languages", "what tech", "built with", "tools used"],
        "experience": ["experience", "background", "career", "work history", "professional", "years", "how long"],
        "skills": ["skills", "abilities", "expertise", "proficient", "good at", "strengths", "capabilities"],
        "education": ["education", "degree", "university", "college", "school", "middlebury", "study"],
        "contact": ["contact", "reach", "email", "phone", "connect", "hire", "available"],
        "projects_overview": ["projects", "what built", "what made", "work on", "created", "developed"],
        "career_goals": ["looking for", "seeking", "job", "role", "position", "career goals", "next step"],
        "ai_experience": ["ai", "artificial intelligence", "machine learning", "ml", "openai", "gpt"],
        "architecture": ["architecture", "design", "structure", "how works", "system design"],
        "challenges": ["challenges", "difficult", "problems", "obstacles", "hard", "complex"],
        "learning": ["learn", "learning", "self taught", "education", "how did you", "start"],
        "deployment": ["deploy", "deployment", "hosting", "live", "production", "cloud"],
        "performance": ["performance", "speed", "fast", "optimization", "scalable"],
        "why_chosen": ["why", "choice", "reason", "decide", "choose", "picked"],
        "future_plans": ["future", "next", "plans", "roadmap", "upcoming", "working on"]
    }
    
    for topic, keywords in topic_patterns.items():
        if any(keyword in text_lower for keyword in keywords):
            entities["topics"].append(topic)
    
    # Enhanced Skills Detection
    skill_patterns = {
        "react": ["react", "reactjs", "jsx", "hooks"],
        "python": ["python", "py", "django", "flask"],
        "fastapi": ["fastapi", "fast api", "api"],
        "javascript": ["javascript", "js", "node", "nodejs"],
        "ai": ["ai", "machine learning", "ml", "openai", "gpt", "llm"],
        "databases": ["database", "db", "mongodb", "mongo", "redis", "sql", "postgresql"],
        "frontend": ["frontend", "front-end", "ui", "ux", "css", "html", "tailwind"],
        "backend": ["backend", "back-end", "server", "api"],
        "cloud": ["cloud", "aws", "vercel", "render", "deployment"]
    }
    
    for skill, keywords in skill_patterns.items():
        if any(keyword in text_lower for keyword in keywords):
            entities["skills"].append(skill)
    
    return entities

def get_contextual_instructions(entities: Dict[str, List[str]], conversation_history: List[Dict]) -> str:
    """Generate contextual instructions based on detected entities and conversation history"""
    instructions = []
    
    # Check conversation history for context
    recent_entities = set()
    for msg in conversation_history[-4:]:  # Last 2 exchanges
        if msg.get("role") == "user":
            msg_entities = extract_entities(msg.get("content", ""))
            for entity_type, entity_list in msg_entities.items():
                recent_entities.update(entity_list)
    
    # Current message entities
    current_entities = set()
    for entity_type, entity_list in entities.items():
        current_entities.update(entity_list)
    
    # Specific contextual guidance based on question types
    if "tech_stack" in current_entities:
        if "nutrivize" in recent_entities or "nutrivize" in current_entities:
            instructions.append("Focus on Nutrivize's comprehensive tech stack: React 18 + Vite + Tailwind CSS frontend, FastAPI + Python backend, MongoDB Atlas + Redis Cloud for data, Firebase Auth, OpenAI GPT-4 Vision for food recognition, deployed on Vercel + Render.")
        elif "echopod" in recent_entities or "echopod" in current_entities:
            instructions.append("Focus on EchoPod's AI-powered tech stack: Python + FastAPI for backend processing, advanced AI voice synthesis, NLP for script optimization, audio processing pipelines, React frontend for user interface.")
        elif "signalflow" in recent_entities or "signalflow" in current_entities:
            instructions.append("Focus on SignalFlow's trading tech stack: Python 3.11+ with FastAPI, Streamlit dashboards, MongoDB Atlas for data, OpenAI GPT-4o + Claude for AI analysis, Polygon.io + Alpaca APIs for market data, Railway cloud deployment, Telegram bot integration.")
        elif "portfolio" in recent_entities or "portfolio" in current_entities:
            instructions.append("Focus on this portfolio's tech stack: React + Vite + Tailwind CSS frontend, FastAPI + Python backend, Pinecone vector database for AI knowledge base, OpenAI GPT-4o for chat, WebSocket for voice features, Deepgram + ElevenLabs for voice processing.")
        else:
            instructions.append("Provide Isaac's COMPLETE technology stack organized by categories (Frontend, Backend, AI/ML, Databases, Cloud) with proficiency levels and specific project examples for each technology.")
    
    if "experience" in current_entities or "background" in current_entities:
        instructions.append("Emphasize Isaac's self-directed learning journey (2021-present), production applications, and real-world impact. Include specific examples from Nutrivize (active users), portfolio (AI integration), and growth from basics to expert-level full-stack development.")
    
    if "projects_overview" in current_entities:
        instructions.append("Provide detailed overview of Isaac's key projects: Nutrivize (AI nutrition tracker with computer vision), EchoPod (AI podcast generator), Quizium (intelligent flashcards), SignalFlow (AI trading analysis), and this portfolio (AI-powered with voice chat).")
    
    if "career_goals" in current_entities or "looking for" in [item.lower() for item in current_entities]:
        instructions.append("Detail Isaac's target roles (Backend Engineer, AI Engineer, Full-Stack), preferred industries (HealthTech, AI tools, Developer tooling), what he brings (speed + quality, AI expertise, full-stack capabilities), and ideal work environment (collaborative, learning-focused, impact-driven).")
    
    if "ai_experience" in current_entities:
        instructions.append("Highlight Isaac's AI expertise: OpenAI GPT-4/Vision integration (Nutrivize food recognition, portfolio chat), Claude API usage, vector databases (Pinecone), prompt engineering, and building AI-first applications rather than just using AI tools.")
    
    if "challenges" in current_entities:
        instructions.append("Discuss specific technical challenges Isaac has solved: real-time food recognition accuracy, conversation context management, scalable API design, performance optimization, AI response quality, and production deployment complexities.")
    
    if "learning" in current_entities:
        instructions.append("Emphasize Isaac's self-taught journey: started with HTML/CSS/JS in 2021, progressed to React/Node.js in 2022, mastered FastAPI/AI integration by 2023, now expert-level with focus on AI-powered applications. Continuous learning through documentation, projects, and experimentation.")
    
    if "why_chosen" in current_entities:
        instructions.append("Explain Isaac's technology choices: React for component reusability, FastAPI for Python performance + async, MongoDB for flexible data models, Redis for caching, OpenAI for cutting-edge AI capabilities, Vercel/Render for deployment simplicity and scalability.")
    
    # Context-aware follow-up detection
    if "what" in [item.lower() for item in current_entities] and recent_entities:
        last_project = next((p for p in ["nutrivize", "echopod", "quizium", "signalflow", "portfolio"] if p in recent_entities), None)
        if last_project:
            instructions.append(f"This appears to be a follow-up question about {last_project}. Provide detailed, specific information about {last_project}.")
    
    if current_entities & recent_entities:
        instructions.append("This is a follow-up question. Build upon the previous context and provide deeper, more specific details.")
    
    return " ".join(instructions) if instructions else ""

async def chat_with_assistant_core(request: ChatRequest, client_ip: str = "unknown") -> ChatResponse:
    """
    Core chat function that can be used by both REST API and WebSocket endpoints
    """
    # Rate limiting - 60 requests per hour
    if not rate_limiter.check_rate_limit(client_ip, limit=60, window=3600):
        raise HTTPException(
            status_code=429, 
            detail={"error": "Rate limit exceeded. Please try again later.", "retryAfter": 3600}
        )
    
    # GUARDRAILS: Check if question is obviously off-topic (basic filter)
    if not is_portfolio_related(request.question):
        # Return redirect response for clearly off-topic questions
        redirect_response = generate_redirect_response(request.question)
        
        return ChatResponse(
            response=redirect_response,
            sessionId=request.sessionId or str(uuid4()),
            searchMethod="guardrail_redirect",
            conversationLength=1,
            cached=False,
            timestamp=datetime.now().isoformat(),
            entities={"projects": [], "topics": ["redirect"], "skills": [], "companies": []},
            contextUsed=["Off-topic question filtered by keyword guardrails"]
        )
    
    # Ensure cache manager is connected
    if not cache_manager.connected:
        await cache_manager.connect()
    
    # Session management with enhanced entity tracking
    session_id = request.sessionId or str(uuid4())
    session_data = await cache_manager.get_session(session_id)
    
    if not session_data:
        session_data = {
            "messages": [], 
            "lastUpdated": time.time(),
            "entities": {"projects": [], "topics": [], "skills": [], "companies": []}
        }
    
    # Extract entities from current question
    current_entities = extract_entities(request.question)
    
    # Update session entities
    for entity_type, entity_list in current_entities.items():
        if entity_type in session_data["entities"]:
            session_data["entities"][entity_type].extend(entity_list)
            # Remove duplicates while preserving order
            session_data["entities"][entity_type] = list(dict.fromkeys(session_data["entities"][entity_type]))
    
    # Get contextual instructions
    contextual_instructions = get_contextual_instructions(current_entities, session_data["messages"])
    
    # Check for cached response (30 minutes cache)
    cache_key = f"{request.question}_{hash(str(session_data['entities']))}"
    cached_response = await cache_manager.get_cached_response(cache_key)
    if cached_response and (time.time() - cached_response.get("timestamp", 0)) < 1800:
        # Update session with cached interaction
        session_data["messages"].extend([
            {"role": "user", "content": request.question, "timestamp": time.time(), "entities": current_entities},
            {"role": "assistant", "content": cached_response["response"], "timestamp": time.time(), "cached": True}
        ])
        
        await cache_manager.cache_session(session_id, session_data)
        
        return ChatResponse(
            response=cached_response["response"],
            sessionId=session_id,
            searchMethod="cached",
            conversationLength=len(session_data["messages"]) // 2,
            cached=True,
            timestamp=datetime.now().isoformat(),
            entities=current_entities,
            contextUsed=[contextual_instructions] if contextual_instructions else []
        )
    
    # Search the knowledge base using hybrid search
    try:
        relevant_info = await hybrid_search(request.question)
        search_successful = True
    except Exception as search_error:
        print(f"Hybrid search failed: {search_error}")
        relevant_info = get_fallback_info(request.question)
        search_successful = False
    
    # Build enhanced conversation context with entity awareness
    recent_messages = session_data["messages"][-6:]  # Last 3 exchanges
    conversation_context = ""
    if recent_messages:
        conversation_context = "\\n\\nRecent conversation context:\\n" + \
            "\\n".join([f"{msg['role']}: {msg['content']}" for msg in recent_messages])
    
    # Add entity context
    entity_context = ""
    if any(session_data["entities"].values()):
        entity_context = "\\n\\nConversation entities tracked:\\n"
        for entity_type, entities in session_data["entities"].items():
            if entities:
                entity_context += f"- {entity_type}: {', '.join(entities)}\\n"
    
    # Create enhanced prompt for GPT-4o with contextual awareness and strong guardrails
    system_prompt = f"""You are Isaac Mineo's AI portfolio assistant. Your SOLE PURPOSE is to discuss Isaac's professional portfolio, projects, and technical expertise.

🚨 STRICT GUARDRAILS - MUST FOLLOW:
1. ONLY respond to questions about:
   - Isaac's projects (Nutrivize, EchoPod, Quizium, Signalflow, etc.)
   - His technical skills and expertise
   - Professional background and experience
   - Education and achievements
   - Career goals and aspirations
   - Contact information for professional inquiries

2. If asked about ANYTHING else (sports, personal preferences, general knowledge, current events, other people, weather, politics, entertainment, recipes, travel, health advice, etc.), you MUST:
   - Politely acknowledge the question
   - Explain you're focused on Isaac's portfolio
   - Redirect to relevant portfolio topics
   - Offer specific alternatives about Isaac's work

3. ALWAYS redirect off-topic questions with responses like:
   "I'm Isaac's portfolio assistant focused on his professional work. Instead, I can tell you about [specific Isaac project/skill]. What interests you about Isaac's [technical expertise/projects]?"

4. Never make up information about Isaac that isn't in the knowledge base
5. Stay professional but conversational
6. Use the knowledge base as your primary source

🔧 SPECIAL HANDLING FOR COMMON PORTFOLIO QUESTIONS:

**TECH STACK QUESTIONS:** When asked about "tech stack", "technologies", "what tech", provide COMPREHENSIVE breakdown with:
- Specific technologies organized by categories (Frontend, Backend, AI/ML, Databases, Cloud, Dev Tools)
- Proficiency levels for each technology
- Real project examples showing practical usage
- How technologies work together in Isaac's projects

**PROJECT QUESTIONS:** When asked about "projects", "what built", "work on":
- Provide detailed information about each project's purpose, impact, and technical implementation
- Include specific features, architecture decisions, and technical challenges solved
- Mention current status (Live, In Development, etc.) and real-world usage

**EXPERIENCE QUESTIONS:** When asked about "experience", "background", "how long":
- Detail Isaac's self-directed learning journey from 2021 to present
- Include specific timeline of skill development and technology adoption
- Mention production applications and real-world impact

**CAREER/JOB QUESTIONS:** When asked about "looking for", "career", "job":
- Specify target roles, preferred industries, and company types
- Detail what Isaac brings to teams and his ideal work environment
- Include specific technologies and types of projects he's excited about

**AI QUESTIONS:** When asked about "AI", "machine learning", "intelligent":
- Emphasize Isaac's AI-first development approach
- Detail specific AI integrations and real implementations
- Mention experience with OpenAI, Claude, vector databases, and prompt engineering

**CHALLENGE/PROBLEM QUESTIONS:** When asked about "challenges", "difficult", "problems":
- Provide specific technical challenges Isaac has solved
- Include approaches used and technologies employed
- Connect to real projects and measurable outcomes

**LEARNING QUESTIONS:** When asked about "learn", "self-taught", "education":
- Detail Isaac's continuous learning approach and self-directed path
- Include timeline of skill development and how he stays current
- Mention specific resources and methodologies used

CONTEXTUAL INSTRUCTIONS: {contextual_instructions}

Use markdown formatting extensively for better readability. Be thorough and informative while maintaining a conversational tone that reflects Isaac's personality and expertise. Include specific examples, technical details, and context from the knowledge base.

For contact: isaacmineo@gmail.com"""

    user_prompt = f"""KNOWLEDGE BASE: {relevant_info}

CONTEXT: {conversation_context}{entity_context}

QUESTION: {request.question}

Provide a comprehensive, detailed response about Isaac. Be thorough and informative, using specific examples and concrete details from the knowledge base. 

SPECIAL INSTRUCTIONS FOR DETAILED RESPONSES:

**TECH STACK QUESTIONS:** Provide comprehensive technology breakdown including:
  * Frontend: React 18 (Expert - Hooks, Context, performance) used in Nutrivize + Portfolio
  * Backend: Python + FastAPI (Expert - async, APIs, documentation) in all projects  
  * AI/ML: OpenAI GPT-4/Vision (Expert - Nutrivize food recognition, portfolio chat), Claude API, Pinecone vector DB
  * Databases: MongoDB Atlas (production), Redis Cloud (caching), Firebase Auth
  * Cloud: Vercel (frontend), Render (backend), performance optimization
  * Dev Tools: VS Code, Git/GitHub, Postman, Chrome DevTools
  * Specific project tech combinations and why chosen

**PROJECT QUESTIONS:** For each project provide:
  * **Nutrivize**: AI nutrition tracker, React+FastAPI+MongoDB, OpenAI Vision for food recognition, active users, production-ready
  * **EchoPod**: AI podcast generator, Python+NLP+voice synthesis, advanced audio processing
  * **SignalFlow**: AI trading analysis, Python+Streamlit+MongoDB, 60-65% win rate, multi-agent architecture  
  * **Portfolio**: This site, React+FastAPI+Pinecone, AI chat with voice features, innovative design
  * Technical challenges solved, architecture decisions, real-world impact

**EXPERIENCE QUESTIONS:** Detail Isaac's journey:
  * 2021: Started with HTML/CSS/JavaScript fundamentals
  * 2022: Advanced to React, Node.js, modern development practices  
  * 2023: Mastered FastAPI, AI integration, cloud deployment, full-stack architecture
  * 2024-Present: Expert-level with focus on AI-powered applications and scalable systems
  * Self-taught through projects, documentation, continuous experimentation
  * Production applications with real users and measurable impact

**CAREER QUESTIONS:** Specify Isaac's goals:
  * Target roles: Backend Engineer, AI Engineer, Full-Stack Developer, Senior positions
  * Industries: HealthTech, AI/Productivity Tools, Developer Tooling, Innovative Startups
  * What he brings: Speed+Quality, AI expertise, full-stack capabilities, performance focus
  * Ideal environment: Collaborative teams, learning culture, impact-focused, technical excellence
  * Remote preferred, open to relocation for right opportunity

**AI/ML QUESTIONS:** Highlight Isaac's expertise:
  * AI-first development approach (builds AI-powered apps, not just uses AI tools)
  * OpenAI integration: GPT-4 for analysis, Vision for image recognition (Nutrivize)
  * Vector databases: Pinecone for semantic search (portfolio knowledge base)
  * Prompt engineering: Context design, response optimization
  * Real implementations: Food recognition, conversational AI, intelligent recommendations

**CHALLENGE QUESTIONS:** Specific technical problems solved:
  * Real-time food recognition accuracy improvements
  * Conversation context management and entity tracking
  * Scalable API design handling concurrent users
  * Performance optimization (sub-2s load times)
  * AI response quality and relevance tuning
  * Production deployment and monitoring

Use markdown formatting for better readability:
- **Bold** for important points and key terms
- *Italics* for emphasis 
- Bullet points for lists
- Line breaks for better structure
- Code blocks for technical details when relevant

Make your response engaging and conversational while maintaining professionalism. Aim for depth and detail rather than brevity, especially for technical questions."""

    # Call OpenAI API with GPT-4o
    completion = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        max_tokens=800,
        temperature=0.7,
        presence_penalty=0.1,
        frequency_penalty=0.1
    )
    
    response_text = completion.choices[0].message.content or "I'm having trouble processing your question right now."
    
    # Update session with new interaction including entities
    session_data["messages"].extend([
        {"role": "user", "content": request.question, "timestamp": time.time(), "entities": current_entities},
        {"role": "assistant", "content": response_text, "timestamp": time.time()}
    ])
    
    # Keep only last 20 messages to prevent bloat
    if len(session_data["messages"]) > 20:
        session_data["messages"] = session_data["messages"][-20:]
    
    # Cache the session and response
    await cache_manager.cache_session(session_id, session_data)
    await cache_manager.cache_response(cache_key, response_text, {
        "searchSuccessful": search_successful,
        "sessionId": session_id,
        "entities": current_entities,
        "userIP": client_ip[:8] if client_ip != "unknown" else "unknown"
    })
    
    return ChatResponse(
        response=response_text,
        sessionId=session_id,
        searchMethod="vector_search" if search_successful else "fallback",
        conversationLength=len(session_data["messages"]) // 2,
        cached=False,
        timestamp=datetime.now().isoformat(),
        entities=current_entities,
        contextUsed=[contextual_instructions] if contextual_instructions else []
    )

@router.post("/chatbot", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest, req: Request):
    """
    Main AI Chatbot endpoint - now uses unified service for optimal performance
    """
    try:
        # Get client IP for rate limiting
        client_ip = req.headers.get("x-forwarded-for", req.client.host if req.client else "unknown")
        
        # Rate limiting - 60 requests per hour for main endpoint
        if not rate_limiter.check_rate_limit(client_ip, limit=60, window=3600):
            raise HTTPException(
                status_code=429, 
                detail={"error": "Rate limit exceeded. Please try again later.", "retryAfter": 3600}
            )
        
        # Use unified chat service for all processing
        result = await unified_chat_service.process_message(
            question=request.question,
            session_id=request.sessionId,
            client_ip=client_ip
        )
        
        # Convert to ChatResponse format
        return ChatResponse(
            response=result["response"],
            sessionId=result["sessionId"],
            searchMethod=result["searchMethod"],
            conversationLength=result["conversationLength"],
            cached=result["cached"],
            timestamp=result["timestamp"],
            entities=result["entities"],
            contextUsed=result["contextUsed"]
        )
        
    except HTTPException:
        raise
    except Exception as error:
        print(f"Error in main chatbot API: {error}")
        
        # Fallback response
        fallback_response = get_fallback_response(request.question)
        
        return ChatResponse(
            response=fallback_response,
            sessionId=request.sessionId or str(uuid4()),
            searchMethod="fallback_unified",
            conversationLength=0,
            cached=False,
            timestamp=datetime.now().isoformat(),
            entities=extract_entities(request.question),
            contextUsed=[]
        )

@router.post("/chatbot/fast", response_model=ChatResponse)
async def fast_chat_with_assistant(request: ChatRequest, req: Request):
    """
    Fast optimized chat endpoint with unified service
    """
    try:
        # Get client IP for rate limiting
        client_ip = req.headers.get("x-forwarded-for", req.client.host if req.client else "unknown")
        
        # Rate limiting - 120 requests per hour (higher for fast endpoint)
        if not rate_limiter.check_rate_limit(client_ip, limit=120, window=3600):
            raise HTTPException(
                status_code=429, 
                detail={"error": "Rate limit exceeded. Please try again later.", "retryAfter": 3600}
            )
        
        # Use unified chat service for all processing
        result = await unified_chat_service.process_message(
            question=request.question,
            session_id=request.sessionId,
            client_ip=client_ip
        )
        
        # Convert to ChatResponse format
        return ChatResponse(
            response=result["response"],
            sessionId=result["sessionId"],
            searchMethod=result["searchMethod"],
            conversationLength=result["conversationLength"],
            cached=result["cached"],
            timestamp=result["timestamp"],
            entities=result["entities"],
            contextUsed=result["contextUsed"]
        )
        
    except HTTPException:
        raise
    except Exception as error:
        print(f"Error in fast chat API: {error}")
        
        # Fallback response
        fallback_response = get_fallback_response(request.question)
        
        return ChatResponse(
            response=fallback_response,
            sessionId=request.sessionId or str(uuid4()),
            searchMethod="fallback_fast",
            conversationLength=0,
            cached=False,
            timestamp=datetime.now().isoformat(),
            entities=extract_entities(request.question),
            contextUsed=[]
        )

def get_fallback_info(question: str) -> str:
    """Get fallback information when vector search fails"""
    return "Isaac is a Full-Stack Developer and AI Engineer specializing in React, FastAPI, Python, and AI integrations."

def get_fallback_response(question: str) -> str:
    """Enhanced fallback responses when everything fails - provide detailed, specific information"""
    question_lower = question.lower()
    
    # Tech Stack - Comprehensive Response
    if any(word in question_lower for word in ['tech', 'stack', 'technologies', 'skills', 'programming']):
        return """**Isaac's Complete Technology Stack:**

🚀 **Frontend (Expert Level)**
• **React 18** - Hooks, Context, performance optimization - Used in Nutrivize, Portfolio
• **JavaScript/TypeScript** - ES6+, async programming - All projects
• **Tailwind CSS** - Utility-first styling - Portfolio UI, responsive design
• **HTML5/CSS3** - Semantic markup, animations - Professional interfaces

⚙️ **Backend (Expert Level)**  
• **Python + FastAPI** - Async APIs, documentation - Nutrivize backend, Portfolio API
• **Node.js** - Server-side JavaScript - API development experience
• **RESTful API Design** - Clean architecture, error handling - Production APIs
• **WebSocket** - Real-time communication - Voice chat features

🤖 **AI & Machine Learning (Expert Level)**
• **OpenAI GPT-4/Vision** - Food recognition (Nutrivize), AI chat (Portfolio)
• **Claude API** - Advanced conversation handling
• **Vector Databases** - Pinecone for semantic search - Portfolio knowledge base
• **Prompt Engineering** - Context optimization, response quality

💾 **Databases & Storage**
• **MongoDB Atlas** - Document storage - Nutrivize user data, production-ready
• **Redis Cloud** - Caching, session management - Performance optimization
• **Firebase Auth** - Authentication systems - Multi-provider support

☁️ **Cloud & Deployment**
• **Vercel** - Frontend hosting - Portfolio, optimized deployment
• **Render** - Backend hosting - FastAPI services, database management
• **Performance Optimization** - Sub-2s load times, caching strategies

**Real Projects:** Nutrivize (AI nutrition), SignalFlow (trading analysis), EchoPod (AI podcasts), Portfolio (AI chat)"""
    
    # Projects - Detailed Overview
    elif any(word in question_lower for word in ['project', 'built', 'made', 'work', 'developed']):
        return """**Isaac's Key Projects:**

🍎 **Nutrivize** (Live - Flagship Project)
• **Purpose:** AI-powered nutrition tracker with computer vision food recognition
• **Tech:** React 18 + FastAPI + MongoDB Atlas + OpenAI GPT-4 Vision + Redis Cloud
• **Features:** Photo food recognition, macro tracking, AI meal suggestions, real-time sync
• **Impact:** Active users, production-ready, demonstrates full-stack + AI expertise
• **Live:** https://nutrivize.com

🎙️ **EchoPod** (AI Podcast Generator)
• **Purpose:** Revolutionary AI-powered podcast creation from text content
• **Tech:** Python + FastAPI + Advanced voice synthesis + NLP processing
• **Features:** Script optimization, natural voice synthesis, automated production pipeline
• **Impact:** Democratizing podcast creation through AI

📊 **SignalFlow** (AI Trading System)  
• **Purpose:** Comprehensive AI trading analysis with multi-agent architecture
• **Tech:** Python 3.11+ + FastAPI + Streamlit + MongoDB + OpenAI + Claude + Railway
• **Features:** 60-65% win rate, Kelly Criterion math, real-time analysis, Telegram bot
• **Impact:** Professional-grade trading system with supervised learning
• **Live:** https://web-production-3e19d.up.railway.app

💼 **AI Portfolio** (This Website)
• **Purpose:** Modern portfolio with AI chat, voice features, performance optimization
• **Tech:** React + Vite + Tailwind + FastAPI + Pinecone + WebSocket + Deepgram + ElevenLabs
• **Features:** AI knowledge base, voice chat, glassmorphism UI, PWA capabilities
• **Impact:** Innovative developer portfolio showcasing AI integration"""
    
    # Experience/Background - Detailed Journey
    elif any(word in question_lower for word in ['experience', 'background', 'career', 'journey', 'history']):
        return """**Isaac's Development Journey:**

📈 **Self-Directed Learning Path (2021-Present)**
• **2021:** Started with HTML, CSS, JavaScript fundamentals - Built first websites
• **2022:** Advanced to React, Node.js, modern development practices - Component-based thinking
• **2023:** Mastered FastAPI, AI integration, cloud deployment - Full-stack architecture
• **2024-Present:** Expert-level AI-powered applications - Production systems at scale

🎯 **Core Expertise Developed**
• **Full-Stack Development:** End-to-end application architecture and implementation  
• **AI Integration:** OpenAI, Claude, vector databases - Building intelligent applications
• **Performance Engineering:** Sub-2s load times, scalable APIs, caching strategies
• **Production Systems:** Real users, monitoring, deployment automation

🏆 **Real-World Impact**
• **Nutrivize:** Active users improving their health through AI-powered nutrition tracking
• **Portfolio:** Innovative AI chat helping people learn about Isaac's background
• **Production Experience:** Live applications with monitoring, scaling, user feedback

📚 **Continuous Learning**
• Follows industry blogs, documentation, technical communities
• Experiments with new technologies through side projects
• Masters technologies through hands-on building and iteration
• Stays current with rapidly evolving AI and web technologies

**Education:** Middlebury College (2019-2023) - Liberal Arts with analytical thinking focus"""
    
    # Career/Job Questions - Specific Goals
    elif any(word in question_lower for word in ['job', 'career', 'looking', 'seeking', 'hiring', 'opportunity']):
        return """**Isaac's Career Goals & Opportunities:**

🎯 **Target Roles**
• **Backend Engineer** - Building scalable APIs and intelligent systems
• **AI Engineer** - Integrating AI capabilities into products and workflows
• **Full-Stack Developer** - End-to-end feature development with modern technologies
• **Senior Developer** - Technical leadership and architecture decisions

🏢 **Preferred Industries**
• **HealthTech** - Building tools that improve people's health (like Nutrivize)
• **AI/Productivity Tools** - Creating intelligent applications that enhance productivity
• **Developer Tooling** - Building tools that help other developers be more effective
• **Innovative Startups** - Companies focused on making real-world impact

💪 **What Isaac Brings**
• **Speed + Quality** - Ship features quickly without sacrificing code quality
• **AI Integration Expertise** - Experience building intelligent, context-aware applications  
• **Full-Stack Capabilities** - Handle everything from database design to user interfaces
• **Performance Focus** - Always optimizing for speed, scalability, user experience
• **Problem-Solving Mindset** - Enjoys tackling complex technical challenges

🌟 **Ideal Work Environment**
• **Collaborative Teams** - Smart, creative people who push each other to excel
• **Learning Culture** - Environment encouraging growth and staying current with technology
• **Impact-Focused** - Building products that solve real problems for real people
• **Technical Excellence** - Teams valuing code quality, testing, best practices

📍 **Work Preferences:** Remote-first preferred, open to relocation for exceptional opportunities
📧 **Contact:** isaac@isaacmineo.com"""
    
    # AI/ML Specific Questions
    elif any(word in question_lower for word in ['ai', 'artificial intelligence', 'machine learning', 'ml', 'intelligent']):
        return """**Isaac's AI & Machine Learning Expertise:**

🧠 **AI-First Development Approach**
Isaac doesn't just use AI tools - he builds AI-powered applications from the ground up.

⚡ **Core AI Technologies**
• **OpenAI Integration** - GPT-4 for analysis, Vision for image recognition (Nutrivize food detection)
• **Claude API** - Advanced conversation handling and content generation
• **Vector Databases** - Pinecone for semantic search and knowledge retrieval
• **Prompt Engineering** - Context design, response optimization, conversation flow

🚀 **Real AI Implementations**
• **Nutrivize Food Recognition** - Computer vision for automatic meal identification and nutrition analysis
• **Portfolio AI Chat** - Context-aware conversations with memory and entity tracking
• **SignalFlow Analysis** - Multi-agent AI architecture for trading decisions with 60-65% accuracy
• **EchoPod Generation** - AI-powered content-to-podcast conversion with voice synthesis

💡 **AI Architecture Experience**
• **Multi-Agent Systems** - Coordinated AI agents for complex tasks (SignalFlow)
• **Conversation Management** - Session tracking, context preservation, entity recognition
• **Performance Optimization** - Efficient AI API usage, response caching, fallback handling
• **Real-time Processing** - WebSocket integration for live AI interactions

📊 **Measurable Results**
• Food recognition accuracy improvements through iterative prompt engineering
• Conversation quality metrics and user engagement optimization
• AI response time optimization (sub-3s responses with caching)
• Production AI systems serving real users daily"""
    
    # Contact Information
    elif any(word in question_lower for word in ['contact', 'email', 'reach', 'hire', 'connect']):
        return """**Contact Isaac Mineo:**

📧 **Primary Email:** isaac@isaacmineo.com  
⚡ **Response Time:** Typically within 24 hours  

🌐 **Professional Links:**
• **GitHub:** https://github.com/GoldenRodger5 - All public projects and code
• **LinkedIn:** https://linkedin.com/in/isaacmineo2001 - Professional network and updates  
• **Portfolio:** https://isaacmineo.com - This website with full project details

💼 **Best For Contacting:**
• Job opportunities and career discussions
• Technical collaborations and project partnerships  
• Questions about projects, code, or technical approaches
• Speaking opportunities or technical consultations

🚀 **Current Status:** 
Actively seeking new opportunities in backend, AI engineering, or full-stack development roles.

📞 **Interview Availability:** 
Flexible schedule for calls, technical interviews, and project discussions.

🏠 **Location Preferences:**
Remote-first preferred, open to relocation for exceptional opportunities. Particularly interested in tech hubs but values company culture over specific location."""
    
    # Default comprehensive response
    else:
        return """**Isaac Mineo - Full-Stack Developer & AI Engineer**

🚀 **Quick Overview:**
Expert in React, Python, FastAPI, and AI integration. Builds production-ready applications with real users like Nutrivize (AI nutrition tracker) and innovative projects like AI-powered trading systems.

💻 **Core Technologies:**
React 18, Python, FastAPI, MongoDB, Redis, OpenAI APIs, Vector Databases, Cloud Deployment

🎯 **Featured Projects:**
• **Nutrivize** - AI nutrition tracker with computer vision (Live)
• **SignalFlow** - AI trading analysis with 60-65% win rate (Live)  
• **EchoPod** - AI podcast generator with voice synthesis
• **Portfolio** - This AI-powered website with voice chat

📧 **Contact:** isaac@isaacmineo.com | [GitHub](https://github.com/GoldenRodger5) | [LinkedIn](https://linkedin.com/in/isaacmineo2001)

*Ask me about Isaac's tech stack, specific projects, AI experience, or career goals for detailed information!*"""

@router.post("/contact", response_model=ContactResponse)
async def submit_contact_form(request: ContactRequest, req: Request):
    """Handle contact form submissions and send email"""
    try:
        # Get client IP for rate limiting
        client_ip = req.headers.get("x-forwarded-for", req.client.host if req.client else "unknown")
        
        # Rate limiting - 5 contact form submissions per hour
        if not rate_limiter.check_rate_limit(f"contact_{client_ip}", limit=5, window=3600):
            raise HTTPException(
                status_code=429, 
                detail={"error": "Rate limit exceeded for contact form. Please try again later.", "retryAfter": 3600}
            )
        
        # Prepare contact data
        contact_data = {
            "name": request.name,
            "email": request.email,
            "subject": request.subject,
            "message": request.message,
            "interest": request.interest,
            "timestamp": datetime.now().isoformat(),
            "ip_address": client_ip[:8] if client_ip != "unknown" else "unknown"
        }
        
        # Send email
        result = await email_service.send_contact_email(contact_data)
        
        if result["status"] == "success":
            return ContactResponse(
                status="success",
                message="Thank you for your message! Isaac will get back to you soon."
            )
        else:
            return ContactResponse(
                status="partial_success", 
                message="Your message has been received and logged. Isaac will follow up manually if needed."
            )
            
    except HTTPException:
        raise
    except Exception as error:
        print(f"Error in contact form: {error}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process contact form submission"
        )
