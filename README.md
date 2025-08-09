# Isaac Mineo - AI-Powered Portfolio 🚀

A modern, full-stack portfolio application with **FastAPI backend** and **React frontend**, featuring advanced AI chatbot with voice chat capabilities, real-time analytics, and intelligent conversation management.

## 🏗️ Architecture Overview

This project follows a **clean separation of concerns** architecture:
- **FastAPI Backend**: All AI logic, data processing, WebSocket services, and API endpoints
- **React Frontend**: Pure UI/UX focused interface with responsive design
- **Real-time Features**: WebSocket-based voice chat with speech-to-text and text-to-speech
- **Analytics**: Comprehensive visitor tracking and interaction monitoring

## 📁 Project Structure

```
isaac-mineo/
├── backend/                 # 🐍 FastAPI Backend
│   ├── app/
│   │   ├── main.py         # FastAPI application entry
│   │   ├── routers/        # API endpoints
│   │   │   ├── chatbot.py  # AI chatbot with context awareness
│   │   │   ├── voice.py    # WebSocket voice chat handler
│   │   │   ├── analytics.py # Visitor tracking & metrics
│   │   │   ├── auth.py     # Authentication endpoints
│   │   │   └── github_explainer.py # Code explanation service
│   │   ├── services/       # Business logic & AI services
│   │   ├── middleware/     # CORS, logging, rate limiting
│   │   ├── models/         # Pydantic data models
│   │   └── utils/          # Database, caching, utilities
│   ├── tests/              # Backend test suite
│   └── requirements.txt    # Python dependencies
├── frontend/               # ⚛️ React Frontend
│   ├── src/
│   │   ├── components/     # React components & UI
│   │   ├── services/       # API client services
│   │   ├── contexts/       # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Frontend utilities
│   ├── public/             # Static assets, PWA manifest
│   └── package.json        # Node.js dependencies
├── knowledge-base/         # AI knowledge documents
├── .env                    # Environment configuration
├── start-dev.sh           # Development startup script
├── start-backend.sh       # Backend-only startup
├── start-frontend.sh      # Frontend-only startup
└── deploy-*.sh            # Deployment scripts
```

## ✨ Key Features

### 🤖 AI-Powered Chatbot
- **OpenAI GPT Integration** with intelligent conversation management
- **Context-aware responses** that understand follow-up questions
- **Session management** with conversation history tracking
- **Fallback support** for enhanced reliability
- **Real-time streaming responses** for better user experience

### 🎤 Voice Chat Capabilities
- **Real-time voice conversations** via WebSocket connections
- **Speech-to-text** using Deepgram API
- **Text-to-speech** using ElevenLabs for natural voice responses
- **Continuous listening** with automatic pause detection
- **Barge-in support** allowing interruption of AI responses
- **Mobile-optimized** voice controls with visual feedback

### 📊 Analytics & Tracking
- **Real-time visitor analytics** with detailed metrics
- **AI interaction tracking** to monitor chatbot usage
- **Page view analytics** with engagement metrics
- **Project interest tracking** to understand user preferences
- **Contact form analytics** for lead generation insights
- **Admin dashboard** for comprehensive data visualization

### 💻 Code Intelligence
- **GitHub repository analysis** and code explanation
- **Intelligent code parsing** with context understanding
- **Educational explanations** of technical implementations
- **Interactive code exploration** features

### 🎨 Modern Frontend Experience
- **Responsive design** optimized for all devices
- **Progressive Web App (PWA)** capabilities
- **Clean, professional interface** with smooth animations
- **Dark/light theme support** with user preferences
- **Mobile-first approach** with touch-optimized controls

## 🚀 Quick Start

### Prerequisites
- **Python** for backend services
- **Node.js** and npm for frontend development
- **Git** for version control

### 1. Clone and Setup
```bash
# Clone the repository
git clone https://github.com/GoldenRodger5/isaac-mineo.git
cd isaac-mineo

# Make scripts executable
chmod +x *.sh
```

### 2. Environment Configuration
```bash
# Copy environment template and configure
cp .env.example .env

# Add your API keys to .env file:
# OPENAI_API_KEY=your_openai_key_here
# DEEPGRAM_API_KEY=your_deepgram_key_here (for voice features)
# ELEVENLABS_API_KEY=your_elevenlabs_key_here (for voice responses)
```

### 3. Start Development Environment
```bash
# Option 1: Start both backend and frontend automatically
./start-dev.sh

# Option 2: Start individually
./start-backend.sh    # Backend on port 8000
./start-frontend.sh   # Frontend on port 5173
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🌐 Deployment

### Backend Deployment (Render)
```bash
# Deploy FastAPI backend to Render
./deploy-backend.sh
```

### Frontend Deployment (Vercel)
```bash
# Deploy React frontend to Vercel
./deploy-frontend.sh
```

The backend and frontend are designed to work independently, allowing for flexible deployment strategies across different hosting platforms.

## 📚 API Documentation

### Core Endpoints

#### Chatbot API
**Endpoint:** `POST /api/chatbot`
- Enhanced AI chatbot with conversation context
- Session management for multi-turn conversations
- Real-time streaming responses available

**Request:**
```json
{
  "question": "Tell me about your experience with React",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "response": "I have extensive experience with React...",
  "sessionId": "unique-session-id",
  "conversationLength": 1
}
```

#### Voice Chat WebSocket
**Endpoint:** `WebSocket /api/voice/chat`
- Real-time voice conversations
- Deepgram speech-to-text integration
- ElevenLabs text-to-speech responses
- Binary audio data streaming

#### Analytics Endpoints
- `POST /api/analytics/track/visitor` - Track visitor sessions
- `POST /api/analytics/track/page` - Track page views
- `POST /api/analytics/track/ai-interaction` - Track AI usage
- `GET /api/analytics/public/metrics` - Public analytics data

#### Other Services
- `POST /api/contact` - Contact form submission
- `POST /api/github/explain` - Code explanation service
- `GET /api/health` - Health check endpoint

### Interactive API Documentation
Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🛠️ Technology Stack

### 🐍 Backend (FastAPI)
- **FastAPI** - Modern Python web framework with automatic OpenAPI documentation
- **OpenAI GPT** - Advanced AI chatbot with conversation management
- **Deepgram** - Real-time speech-to-text for voice chat
- **ElevenLabs** - High-quality text-to-speech synthesis
- **WebSocket** - Real-time bidirectional communication
- **Uvicorn** - High-performance ASGI server
- **Pydantic** - Data validation and serialization
- **Python** - Modern Python runtime

### ⚛️ Frontend (React + Vite)
- **React** - Component-based UI framework
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first styling framework
- **JavaScript/JSX** - Modern JavaScript with React syntax
- **WebSocket API** - Real-time communication with backend
- **PWA Features** - Progressive web app capabilities

### 🌐 Infrastructure & Deployment
- **Render** - Backend hosting platform
- **Vercel** - Frontend hosting with edge deployment
- **WebSocket Protocol** - Real-time communication
- **RESTful APIs** - Standard HTTP/JSON communication
- **Git** - Version control and deployment automation

### 🔧 Development Tools
- **Environment Variables** - Centralized configuration management
- **Shell Scripts** - Automated development and deployment
- **Hot Reloading** - Fast development iteration
- **API Documentation** - Automatic Swagger/OpenAPI docs
- **Health Checks** - System monitoring and status

## 📝 Environment Configuration

All configuration is managed through environment variables in the `.env` file:

### Required Variables
```env
# AI Services (Required for core functionality)
OPENAI_API_KEY=your_openai_api_key_here

# Voice Chat Features (Required for voice functionality)
DEEPGRAM_API_KEY=your_deepgram_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Site Configuration
VITE_SITE_PASSWORD=Buddydog#41  # Already configured
```

### Optional Variables
```env
# Contact Form (Optional)
SENDER_EMAIL=your_email@gmail.com
SENDER_PASSWORD=your_gmail_app_password

# Analytics & Monitoring (Optional)
ENABLE_ANALYTICS=true
```

### API Key Sources
- **OpenAI**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Deepgram**: Get from [Deepgram Console](https://console.deepgram.com/)
- **ElevenLabs**: Get from [ElevenLabs Platform](https://elevenlabs.io/)

## � Development Workflow

### Starting Development
```bash
# Full development environment
./start-dev.sh

# Individual services
./start-backend.sh    # FastAPI backend only
./start-frontend.sh   # React frontend only
```

### Testing Voice Features
1. Start the development environment
2. Navigate to the portfolio site
3. Use the microphone button in the chat interface
4. Test voice conversations with the AI

### Monitoring and Debugging
- **Backend logs**: Check terminal running backend service
- **Frontend console**: Use browser developer tools
- **API testing**: Use `/docs` endpoint for interactive testing
- **Health checks**: Visit `/health` endpoint

## � Additional Documentation

- **[Backend README](./backend/README.md)** - FastAPI backend details
- **[Frontend README](./frontend/README.md)** - React frontend specifics  
- **[Architecture Guide](./ARCHITECTURE.md)** - System architecture overview
- **[Development Guide](./DEVELOPMENT.md)** - Development best practices
- **[Environment Setup](./ENVIRONMENT_CONFIG.md)** - Detailed environment configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Test voice features thoroughly on different devices
- Ensure responsive design works across screen sizes
- Maintain API compatibility when making backend changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## �‍💻 About Isaac Mineo

Computer Science student at the University of Iowa with expertise in full-stack development, AI integration, and modern web technologies. This portfolio demonstrates practical application of:

- **AI/ML Integration** - Real-world implementation of OpenAI, Deepgram, and ElevenLabs APIs
- **Full-Stack Architecture** - Clean separation between FastAPI backend and React frontend
- **Real-time Systems** - WebSocket implementation for voice chat functionality
- **Modern DevOps** - Automated deployment and environment management
- **User Experience** - Mobile-first, accessible design with progressive web app features

**Connect with me:**
- 📧 Email: isaac-mineo@uiowa.edu
- 💼 LinkedIn: [Isaac Mineo](https://linkedin.com/in/isaac-mineo)
- 🐱 GitHub: [@GoldenRodger5](https://github.com/GoldenRodger5)
- 🌐 Portfolio: [isaacmineo.com](https://isaacmineo.com)

---

⭐ **Star this repo if you found it helpful!**

*Built with FastAPI, React, OpenAI, Deepgram, ElevenLabs, and modern web technologies*
