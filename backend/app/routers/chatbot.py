from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import openai
import os
from uuid import uuid4
import time
from datetime import datetime

# Import our utilities
from app.utils.pinecone_service import hybrid_search, initialize_pinecone_indexes
from app.utils.cache_manager import CacheManager
from app.utils.rate_limiter import RateLimiter
from app.services.email_service import email_service

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

class ContactRequest(BaseModel):
    name: str
    email: str
    subject: str
    message: str
    interest: Optional[str] = None

class ContactResponse(BaseModel):
    status: str
    message: str

@router.post("/chatbot", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest, req: Request):
    """
    AI Chatbot endpoint that uses GPT-4o with comprehensive knowledge base
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
        
        # Session management
        session_id = request.sessionId or str(uuid4())
        session_data = await cache_manager.get_session(session_id)
        
        if not session_data:
            session_data = {"messages": [], "lastUpdated": time.time()}
        
        # Check for cached response (30 minutes cache)
        cached_response = await cache_manager.get_cached_response(request.question)
        if cached_response and (time.time() - cached_response.get("timestamp", 0)) < 1800:
            # Update session with cached interaction
            session_data["messages"].extend([
                {"role": "user", "content": request.question, "timestamp": time.time()},
                {"role": "assistant", "content": cached_response["response"], "timestamp": time.time(), "cached": True}
            ])
            
            await cache_manager.cache_session(session_id, session_data["messages"])
            
            return ChatResponse(
                response=cached_response["response"],
                sessionId=session_id,
                searchMethod="cached",
                conversationLength=len(session_data["messages"]) // 2,
                cached=True,
                timestamp=datetime.now().isoformat()
            )
        
        # Search the knowledge base using hybrid search
        try:
            relevant_info = await hybrid_search(request.question)
            search_successful = True
        except Exception as search_error:
            print(f"Hybrid search failed: {search_error}")
            relevant_info = get_fallback_info(request.question)
            search_successful = False
        
        # Build conversation context
        recent_messages = session_data["messages"][-6:]  # Last 3 exchanges
        conversation_context = ""
        if recent_messages:
            conversation_context = "\\n\\nRecent conversation context:\\n" + \
                "\\n".join([f"{msg['role']}: {msg['content']}" for msg in recent_messages])
        
        # Create concise prompt for GPT-4o
        user_prompt = f"""KNOWLEDGE BASE: {relevant_info}

CONTEXT: {conversation_context}

QUESTION: {request.question}

Provide a concise, professional response about Isaac. Be specific and helpful, but keep it brief and conversational. Use concrete details from the knowledge base when relevant."""

        # Call OpenAI API with GPT-4o
        completion = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are Isaac Mineo's AI assistant. Provide concise, professional responses about Isaac's projects, skills, and background using the knowledge base. Keep answers brief but informative. Use a conversational tone that reflects Isaac's personality. For contact: isaacmineo@gmail.com"
                },
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=300,
            temperature=0.7,
            presence_penalty=0.1,
            frequency_penalty=0.1
        )
        
        response_text = completion.choices[0].message.content or "I'm having trouble processing your question right now."
        
        # Update session with new interaction
        session_data["messages"].extend([
            {"role": "user", "content": request.question, "timestamp": time.time()},
            {"role": "assistant", "content": response_text, "timestamp": time.time()}
        ])
        
        # Keep only last 20 messages to prevent bloat
        if len(session_data["messages"]) > 20:
            session_data["messages"] = session_data["messages"][-20:]
        
        # Cache the session and response
        await cache_manager.cache_session(session_id, session_data["messages"])
        await cache_manager.cache_response(request.question, response_text, {
            "searchSuccessful": search_successful,
            "sessionId": session_id,
            "userIP": client_ip[:8] if client_ip != "unknown" else "unknown"
        })
        
        return ChatResponse(
            response=response_text,
            sessionId=session_id,
            searchMethod="vector_search" if search_successful else "fallback",
            conversationLength=len(session_data["messages"]) // 2,
            cached=False,
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as error:
        print(f"Error in chatbot API: {error}")
        
        # Fallback response
        fallback_response = get_fallback_response(request.question)
        
        return ChatResponse(
            response=fallback_response,
            sessionId=request.sessionId or str(uuid4()),
            searchMethod="fallback",
            conversationLength=0,
            cached=False,
            timestamp=datetime.now().isoformat()
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
