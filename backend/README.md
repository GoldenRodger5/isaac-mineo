# Isaac Mineo Portfolio - FastAPI Backend

FastAPI backend with AI-powered chatbot capabilities, vector search, and comprehensive knowledge base.

## 🚀 Features

- **GPT-4o AI Chatbot** with Isaac's comprehensive knowledge base
- **Vector Search** using Pinecone for semantic question answering
- **Redis Caching** for improved performance and rate limiting
- **API Documentation** with automatic OpenAPI/Swagger generation
- **Health Monitoring** and status endpoints

## 📁 Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── routers/
│   │   └── chatbot.py       # Chatbot API endpoints
│   ├── services/
│   │   ├── pinecone_service.py   # Vector search functionality
│   │   ├── cache_manager.py      # Redis caching
│   │   └── rate_limiter.py       # API rate limiting
│   └── knowledge_base/      # Isaac's comprehensive knowledge base
├── requirements.txt         # Python dependencies
├── setup.sh                # Backend setup script
└── README.md               # This file
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
