"""
Voice-optimized chat service for low-latency responses
"""

import openai
import os
import json
import time
from typing import Optional, Dict, Any, List
from uuid import uuid4
from datetime import datetime

from app.utils.pinecone_service import semantic_search, IndexType
from app.utils.cache_manager import CacheManager
from app.routers.chatbot import ChatRequest, ChatResponse

# Initialize services
openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
cache_manager = CacheManager()

# Voice-optimized system prompt
VOICE_SYSTEM_PROMPT = """You are Isaac's portfolio assistant for VOICE CHAT. Keep responses:
- BRIEF (1-2 sentences max)
- CONVERSATIONAL (like speaking)
- FOCUSED on Isaac's work

Isaac Mineo:
- Full-stack developer with React, Python, FastAPI
- Built: Nutrivize (nutrition app), EchoPod (podcast tool), Quizium (quiz platform)
- Skills: AI integration, cloud deployment, modern web dev
- Education: Computer Science student
- Contact: isaacmineo@gmail.com

Give quick, helpful answers. If you need more info, ask one specific follow-up question."""

async def voice_chat_response(request: ChatRequest) -> ChatResponse:
    """
    Voice-optimized chat function for low-latency responses
    Uses minimal knowledge base search and simplified processing
    """
    start_time = time.time()
    
    # Ensure cache manager is connected
    if not cache_manager.connected:
        await cache_manager.connect()
    
    session_id = request.sessionId or str(uuid4())
    
    # Quick cache check (5 minutes for voice)
    cache_key = f"voice_{hash(request.question)}"
    cached_response = await cache_manager.get_cached_response(cache_key)
    if cached_response and (time.time() - cached_response.get("timestamp", 0)) < 300:  # 5 min cache
        return ChatResponse(
            response=cached_response["response"],
            sessionId=session_id,
            searchMethod="voice_cached",
            conversationLength=1,
            cached=True,
            timestamp=datetime.now().isoformat(),
            entities={},
            contextUsed=["Voice cache hit"]
        )
    
    # Quick knowledge base search (limited results)
    context_info = ""
    try:
        # Use a faster, limited search - try personal info first
        search_results = await semantic_search(request.question, IndexType.PERSONAL, top_k=2)
        if not search_results:
            # Fallback to projects if no personal info found
            search_results = await semantic_search(request.question, IndexType.PROJECTS, top_k=2)
        
        if search_results:
            context_info = "\n".join([item.get("text", "")[:150] for item in search_results])  # Limit text
    except Exception as e:
        print(f"Voice search error: {e}")
        context_info = ""
    
    # Create voice-optimized prompt
    voice_prompt = f"""
{VOICE_SYSTEM_PROMPT}

Context (if relevant): {context_info[:300]}

User question: {request.question}

Voice response (brief & conversational):"""
    
    try:
        # Use faster model and settings for voice
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",  # Faster model
            messages=[{"role": "user", "content": voice_prompt}],
            max_tokens=100,  # Limit response length
            temperature=0.7,
            timeout=10  # 10 second timeout
        )
        
        ai_response = response.choices[0].message.content
        if ai_response:
            ai_response = ai_response.strip()
        else:
            ai_response = "I'd be happy to help you learn about Isaac's work. What would you like to know?"
        
        # Cache the response
        await cache_manager.cache_response(
            cache_key, 
            ai_response,
            {"voice_optimized": True, "timestamp": time.time()}
        )
        
        execution_time = time.time() - start_time
        print(f"Voice response generated in {execution_time:.2f}s")
        
        return ChatResponse(
            response=ai_response,
            sessionId=session_id,
            searchMethod="voice_optimized",
            conversationLength=1,
            cached=False,
            timestamp=datetime.now().isoformat(),
            entities={},
            contextUsed=[f"Voice KB search ({len(context_info)} chars)"] if context_info else ["Direct AI response"]
        )
        
    except Exception as e:
        print(f"Voice chat error: {e}")
        # Fallback response
        return ChatResponse(
            response="I'm Isaac's portfolio assistant. Could you rephrase your question about his projects or experience?",
            sessionId=session_id,
            searchMethod="voice_fallback",
            conversationLength=1,
            cached=False,
            timestamp=datetime.now().isoformat(),
            entities={},
            contextUsed=["Error fallback"]
        )
