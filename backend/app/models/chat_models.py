"""Shared chat models to avoid circular imports"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ChatRequest(BaseModel):
    question: str
    sessionId: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    sessionId: str
    searchMethod: str
    conversationLength: int
    cached: bool
    timestamp: str
    entities: Dict[str, List[str]]
    contextUsed: List[str]

class ContactRequest(BaseModel):
    name: str
    email: str
    subject: str
    message: str
    interest: str

class ContactResponse(BaseModel):
    status: str
    message: str
