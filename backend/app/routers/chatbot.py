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
from backend.app.utils.pinecone_service import hybrid_search, initialize_pinecone_indexes
from backend.app.utils.cache_manager import CacheManager
from backend.app.utils.rate_limiter import RateLimiter
from backend.app.services.email_service import email_service

router = APIRouter()

# Initialize services
cache_manager = CacheManager()
rate_limiter = RateLimiter()

# Initialize OpenAI client
openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ChatRequest(BaseModel):
    question: str
    sessionId: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    sessionId: str
    searchMethod: str
    conversationLength: int
    cached: bool = False
    timestamp: str
    entities: Optional[Dict[str, Any]] = None
    contextUsed: Optional[List[str]] = None

class ContactRequest(BaseModel):
    name: str
    email: str
    subject: str
    message: str
    interest: Optional[str] = None

class ContactResponse(BaseModel):
    status: str
    message: str

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
        "nutrivize": ["nutrivize", "nutrition tracker", "food recognition"],
        "echopod": ["echopod", "podcast", "echo pod"],
        "quizium": ["quizium", "quiz", "flashcard"]
    }
    
    for project, keywords in project_patterns.items():
        if any(keyword in text_lower for keyword in keywords):
            entities["projects"].append(project)
    
    # Topics
    topic_patterns = {
        "tech_stack": ["tech stack", "technology", "technologies", "programming languages"],
        "experience": ["experience", "background", "career", "work history"],
        "skills": ["skills", "abilities", "expertise", "proficient"],
        "education": ["education", "degree", "university", "college", "school"],
        "contact": ["contact", "reach", "email", "phone", "connect"]
    }
    
    for topic, keywords in topic_patterns.items():
        if any(keyword in text_lower for keyword in keywords):
            entities["topics"].append(topic)
    
    # Skills
    skill_keywords = ["react", "fastapi", "python", "javascript", "ai", "machine learning", "mongodb", "redis"]
    for skill in skill_keywords:
        if skill in text_lower:
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
    
    # Determine context
    if current_entities & recent_entities:
        instructions.append("This is a follow-up question. Reference the previous context.")
    
    if "nutrivize" in recent_entities and "tech_stack" in current_entities:
        instructions.append("User is asking about Nutrivize's tech stack specifically.")
    
    if "echopod" in recent_entities and "tech_stack" in current_entities:
        instructions.append("User is asking about EchoPod's tech stack specifically.")
    
    if "quizium" in recent_entities and "tech_stack" in current_entities:
        instructions.append("User is asking about Quizium's tech stack specifically.")
    
    return " ".join(instructions) if instructions else ""

@router.post("/chatbot", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest, req: Request):
    """
    Enhanced AI Chatbot endpoint with entity tracking and context awareness
    """
    try:
        # Get client IP for rate limiting
        client_ip = req.headers.get("x-forwarded-for", req.client.host if req.client else "unknown")
        
        # Rate limiting - 60 requests per hour
        if not rate_limiter.check_rate_limit(client_ip, limit=60, window=3600):
            raise HTTPException(
                status_code=429, 
                detail={"error": "Rate limit exceeded. Please try again later.", "retryAfter": 3600}
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
        
        # Create enhanced prompt for GPT-4o with contextual awareness
        system_prompt = f"""You are Isaac Mineo's AI assistant. Provide comprehensive, detailed responses about Isaac's projects, skills, and background using the knowledge base. 

CONTEXTUAL INSTRUCTIONS: {contextual_instructions}

Use markdown formatting extensively for better readability. Be thorough and informative while maintaining a conversational tone that reflects Isaac's personality and expertise. Include specific examples, technical details, and context. 

For contact: isaacmineo@gmail.com"""

        user_prompt = f"""KNOWLEDGE BASE: {relevant_info}

CONTEXT: {conversation_context}{entity_context}

QUESTION: {request.question}

Provide a comprehensive, detailed response about Isaac. Be thorough and informative, using specific examples and concrete details from the knowledge base. Use markdown formatting for better readability:
- **Bold** for important points and key terms
- *Italics* for emphasis 
- Bullet points for lists
- Line breaks for better structure
- Code blocks for technical details when relevant

Make your response engaging and conversational while maintaining professionalism. Aim for depth and detail rather than brevity."""

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
        
    except HTTPException:
        raise
    except Exception as error:
        print(f"Error in chatbot API: {error}")
        
        # Fallback response with entity awareness
        fallback_response = get_fallback_response(request.question)
        
        return ChatResponse(
            response=fallback_response,
            sessionId=request.sessionId or str(uuid4()),
            searchMethod="fallback",
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
    """Enhanced fallback responses when everything fails"""
    question_lower = question.lower()
    
    if any(word in question_lower for word in ['tech', 'stack', 'technologies']):
        return "Isaac's main tech stack includes React, FastAPI, Python, MongoDB, and Redis. He specializes in AI integrations with OpenAI APIs and building scalable backend systems."
    
    elif any(word in question_lower for word in ['nutrivize', 'project']):
        return "Nutrivize is Isaac's flagship project - an AI-powered nutrition tracker using computer vision for food recognition. It's built with React, FastAPI, and integrates OpenAI's GPT-4 Vision for intelligent meal tracking."
    
    elif any(word in question_lower for word in ['experience', 'background']):
        return "Isaac is a Full-Stack Developer and AI Engineer specializing in intelligent, scalable web applications. He focuses on clean code, performance optimization, and building tools with real-world impact."
    
    elif any(word in question_lower for word in ['contact', 'email', 'reach']):
        return "You can reach Isaac at isaac@isaacmineo.com, GitHub at github.com/GoldenRodger5, or LinkedIn at linkedin.com/in/isaacmineo. He's always open to discussing opportunities!"
    
    else:
        return "Isaac is a Full-Stack Developer specializing in AI-powered applications. Ask me about his tech stack, projects like Nutrivize, experience, or career goals. Contact him at isaac@isaacmineo.com!"

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
