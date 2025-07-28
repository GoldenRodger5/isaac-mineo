# Architecture Documentation 🏗️

## Overview

This project follows a **clean, consolidated architecture** where all business logic, AI functionality, and data processing resides in the FastAPI backend, while the frontend focuses purely on UI/UX.

## 🎯 Design Principles

### 1. Single Source of Truth
- **All API logic** → FastAPI backend
- **All AI functionality** → FastAPI backend  
- **All caching & sessions** → FastAPI backend
- **Frontend** → Pure React UI that calls FastAPI

### 2. No Duplication
- **Single vercel.json** (removed 4 duplicates)
- **Single App.jsx** (removed old versions)
- **Single contact endpoint** (removed Vercel fallbacks)
- **Single chatbot implementation** (consolidated 3 versions)

### 3. Clear Separation of Concerns
```
Frontend (React)     Backend (FastAPI)
├── UI Components    ├── API Endpoints
├── User Interface   ├── Business Logic  
├── API Client       ├── AI Processing
└── Static Assets    ├── Database Access
                     ├── Caching Layer
                     └── Email Services
```

## 🔄 Data Flow

```
User Interaction
       ↓
React Component
       ↓
apiClient.js
       ↓
FastAPI Endpoint
       ↓
Business Logic (AI, Vector Search, etc.)
       ↓
External Services (OpenAI, Pinecone, Redis)
       ↓
Response back through the chain
```

## 📂 Directory Structure

```
isaac-mineo/
├── backend/                 # 🐍 All Logic & Data
│   ├── app/
│   │   ├── main.py         # FastAPI app
│   │   ├── routers/        # API endpoints
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utilities (Pinecone, Redis)
│   └── knowledge-base/     # AI knowledge documents
├── frontend/               # ⚛️ Pure UI
│   ├── src/
│   │   ├── components/     # React components
│   │   └── services/       # API client only
│   └── public/             # Static assets
└── deployment/             # 🚀 Scripts & configs
```

## 🚀 Deployment Architecture

```
User Request
     ↓
Vercel (Frontend) → Render (Backend)
     ↓                    ↓
React SPA           FastAPI + AI Services
     ↓                    ↓
Static Assets       OpenAI + Pinecone + Redis
```

## ✅ Benefits Achieved

### Performance
- **Faster builds** - No unused dependencies
- **Smaller bundles** - Clean, focused code
- **Better caching** - Centralized Redis management

### Maintainability  
- **No confusion** - Clear file purposes
- **Single point of truth** - All logic in one place
- **Easier debugging** - Clear data flow

### Scalability
- **Independent scaling** - Frontend and backend can scale separately
- **Clear APIs** - Well-defined interface between layers
- **Modular design** - Easy to add new features

## 🧠 Enhanced AI Features

### Context Awareness
The AI chatbot now tracks entities and conversation context:

```python
# Entity tracking across conversations
entities = {
    "projects": ["nutrivize", "echopod"],
    "topics": ["tech_stack", "experience"],
    "skills": ["react", "fastapi", "python"]
}

# Contextual responses
if "tech_stack" in current_entities and "nutrivize" in session_entities:
    # Bot understands user is asking about Nutrivize's tech stack
```

### Session Management
- **Conversation history** preserved across requests
- **Entity tracking** for context awareness  
- **Redis-backed sessions** for persistence
- **Intelligent caching** for improved performance

## 🔧 Configuration

All configuration is centralized:
- **Environment variables** → Single `.env` file
- **Vercel config** → Single `vercel.json`
- **API endpoints** → FastAPI backend only
- **Dependencies** → Separate `package.json` and `requirements.txt`

This architecture ensures a clean, maintainable, and scalable codebase that's easy to understand and extend.
