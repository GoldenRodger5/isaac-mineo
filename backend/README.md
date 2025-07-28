# Isaac Mineo Portfolio - FastAPI Backend 🐍

**Centralized backend** with enhanced AI chatbot capabilities, context awareness, and comprehensive API endpoints.

## 🚀 Enhanced Features

- **GPT-4o AI Chatbot** with **entity tracking** and **context awareness**
- **Conversational Memory** - remembers topics and provides contextual responses
- **Vector Search** using Pinecone for semantic question answering  
- **Redis Session Management** for conversation persistence
- **Rate Limiting** and comprehensive error handling
- **Contact Form Processing** with email integration
- **Health Monitoring** and metrics endpoints

## 🧠 Enhanced AI Capabilities

### Context-Aware Conversations
```
User: "Tell me about Nutrivize"
Bot: [Detailed response about Nutrivize]

User: "What's the tech stack?"
Bot: [Understands you mean Nutrivize's tech stack specifically]
```

### Entity Tracking
- **Projects**: Nutrivize, EchoPod, Quizium
- **Topics**: Tech stack, experience, skills, education
- **Skills**: React, FastAPI, Python, AI/ML
- **Companies**: Automatically detected from conversation

## 📁 Clean Architecture

```
backend/
├── app/
│   ├── main.py                    # FastAPI application entry
│   ├── routers/
│   │   └── chatbot.py            # Enhanced chatbot with context
│   ├── services/
│   │   ├── email_service.py      # Contact form processing
│   │   └── error_handler.py      # Comprehensive error handling  
│   └── utils/
│       ├── pinecone_service.py   # Vector search functionality
│       ├── cache_manager.py      # Redis session management
│       └── rate_limiter.py       # API rate limiting
├── knowledge-base/               # Isaac's knowledge base documents
├── requirements.txt              # Python dependencies
└── README.md                    # This file
```

## 🛠️ Tech Stack

- **FastAPI** - Modern Python web framework
- **OpenAI GPT-4o** - AI chatbot responses
- **Pinecone** - Vector database for semantic search
- **Redis** - Caching and rate limiting
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation

## 🚀 Quick Start

### Using Dynamic Start Script (Recommended)
```bash
# From project root
./start-backend.sh
```

### Manual Start
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

## 📚 API Endpoints

### Health Check
```
GET /health
```
Returns backend health status.

### AI Chatbot
```
POST /api/chatbot
Content-Type: application/json

{
  "question": "Tell me about Isaac Mineo",
  "sessionId": "optional-session-id"
}
```

### API Documentation
```
GET /docs        # Swagger UI
GET /redoc       # ReDoc documentation
GET /openapi.json # OpenAPI specification
```

## 🧠 AI Features

- **Semantic Search**: Vector-based search across knowledge base
- **Context Awareness**: Maintains conversation context
- **Intelligent Responses**: GPT-4o powered responses with Isaac's knowledge
- **Caching**: Redis-cached responses for improved performance
- **Rate Limiting**: Production-ready API protection

## 🔧 Environment Variables

The backend requires these environment variables (auto-configured by start scripts):

```env
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=isaac-info
REDIS_URL=your_redis_url
```

## 🌐 Deployment

### Render (Production)
```bash
# From project root
./render-deploy.sh
```

### Manual Deployment
1. Set environment variables on your platform
2. Install dependencies: `pip install -r requirements.txt`
3. Start server: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## 📊 Performance

- **Response Time**: < 500ms for cached responses
- **Vector Search**: < 300ms average
- **Rate Limiting**: Configurable per endpoint
- **Health Monitoring**: Built-in status endpoints

---
*Part of the Isaac Mineo Portfolio project*
