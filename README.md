# Isaac Mineo - AI-Powered Portfolio 🚀

A modern, full-stack portfolio application with FastAPI backend and React frontend, featuring advanced AI chatbot capabilities and dynamic deployment scripts.

## 📁 Project Structure

```
isaac-mineo/
├── backend/              # FastAPI backend with AI chatbot
├── frontend/             # React + Vite frontend
├── start-backend.sh      # Dynamic backend starter (auto port detection)
├── start-frontend.sh     # Dynamic frontend starter (auto port detection) 
├── start-dev.sh          # Start both backend & frontend with auto-config
├── render-deploy.sh      # Production deployment to Render
├── render.yaml          # Render deployment configuration
└── README.md            # This file
```

## ✨ Features

### AI-Powered Backend (FastAPI)
- **GPT-4o Chatbot** with comprehensive knowledge base about Isaac
- **Vector Search** using Pinecone for semantic question answering
- **Redis Caching** for improved performance and rate limiting
- **Dynamic Port Detection** - automatically finds available ports
- **API Documentation** at `/docs` endpoint

### Modern Frontend (React + Vite)
- **Responsive Design** with Tailwind CSS
- **Progressive Web App** capabilities
- **Professional Sections**: About, Projects, Resume, Contact
- **AI Chatbot Interface** connected to FastAPI backend

## 🚀 Quick Start

### Prerequisites
- **Python 3.12+** for backend
- **Node.js 18+** for frontend
- **Git** for version control

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/GoldenRodger5/isaac-mineo.git
   cd isaac-mineo
   ```

2. **Configure Environment**
   ```bash
   # Copy the .env file and add your API keys
   # The .env file contains all configuration in one place
   # Update the following with your actual values:
   # - OPENAI_API_KEY
   # - PINECONE_API_KEY (optional)
   # - REDIS_URL (optional)
   # - Email settings (optional)
   
   # Validate your environment setup
   ./validate-env.sh
   ```

3. **Start Development Environment**
   ```bash
   # Start both backend and frontend with automatic configuration
   ./start-dev.sh
   ```

   This script will:
   - Load environment variables from .env
   - Automatically detect and use available ports
   - Start FastAPI backend (usually port 8000)
   - Start React frontend (usually port 5173)
   - Configure frontend to communicate with backend

### Manual Start (Alternative)

**Backend Only:**
```bash
./start-backend.sh
# Backend will be available at http://localhost:8001
# API docs at http://localhost:8001/docs
```

**Frontend Only:**
```bash
./start-frontend.sh  
# Frontend will be available at http://localhost:5173+
```

## 🌐 Deployment

### Production Deployment to Render

```bash
./render-deploy.sh
```

This will deploy the FastAPI backend to Render. The frontend can be deployed to Vercel using their Git integration.

## 📚 API Documentation

Once the backend is running, visit:
- **API Documentation**: http://localhost:8001/docs
- **Health Check**: http://localhost:8001/health
- **Chatbot Endpoint**: http://localhost:8001/api/chatbot

## 🛠️ Technology Stack

### Backend (FastAPI)
- **FastAPI** - Modern Python web framework
- **OpenAI GPT-4o** - AI chatbot responses
- **Pinecone** - Vector database for semantic search
- **Redis** - Caching and rate limiting
- **Uvicorn** - ASGI server

### Frontend (React + Vite)
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **JavaScript/JSX** - Programming language

### DevOps & Deployment
- **Render** - Backend hosting
- **Vercel** - Frontend hosting  
- **Dynamic Scripts** - Automatic port detection
- **Git** - Version control

## 📝 Environment Variables

All configuration is centralized in a single `.env` file in the project root:

```env
# Site Configuration
VITE_SITE_PASSWORD=Buddydog#41

# AI API Keys
OPENAI_API_KEY=your_openai_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here

# Email Configuration (for contact form)
SENDER_EMAIL=noreply@isaacmineo.com
SENDER_PASSWORD=your_gmail_app_password_here

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379
```

**Required for basic functionality:**
- `VITE_SITE_PASSWORD` - Already set to "Buddydog#41"
- `OPENAI_API_KEY` - Get from https://platform.openai.com/api-keys

**Optional but recommended:**
- `PINECONE_API_KEY` - For enhanced vector search
- `SENDER_EMAIL` & `SENDER_PASSWORD` - For contact form emails
- `REDIS_URL` - For caching and performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `./start-dev.sh`
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 📧 Contact

**Isaac Mineo**
- **Email**: isaac@isaacmineo.com
- **Portfolio**: [isaacmineo.com](https://isaacmineo.com)
- **GitHub**: [@GoldenRodger5](https://github.com/GoldenRodger5)

---
---
*Built with ❤️ using FastAPI, React, and AI*
```

## � Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ (for AI features)
- API Keys: OpenAI, Claude (Anthropic), Pinecone, Redis

### 1. Clone and Install
```bash
git clone https://github.com/GoldenRodger5/isaac-mineo.git
cd isaac-mineo
chmod +x start.sh
./start.sh
```

### 2. Environment Setup
```bash
cd frontend
cp .env.example .env.local
# Add your API keys to .env.local
```

### 3. Run Development Server
```bash
# Option 1: Use automation script
./dev.sh

# Option 2: Manual start
cd frontend
npm install
npm run dev
```

## 🔧 Configuration

### Environment Variables (.env.local)
```env
# AI APIs
OPENAI_API_KEY=your_openai_key
CLAUDE_API_KEY=your_claude_key

# Vector Database
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=your_environment
PINECONE_INDEX_NAME=isaac-portfolio

# Caching
REDIS_URL=your_redis_url

# Optional
VERCEL_ENV=development
```

### API Keys Setup
1. **OpenAI**: Get key from [OpenAI Dashboard](https://platform.openai.com/api-keys)
2. **Claude**: Get key from [Anthropic Console](https://console.anthropic.com/)
3. **Pinecone**: Get key from [Pinecone Console](https://app.pinecone.io/)
4. **Redis**: Get URL from [Redis Cloud](https://redis.com/try-free/)

## 🧠 AI Features

### Semantic Search
- Searches across resume, transcript, and curated knowledge base
- Uses text-embedding-3-small for vector embeddings
- Cached results for optimal performance

### Document Processing
- Intelligent PDF parsing and text chunking
- Context-aware document sections
- Optimized for question-answering

### Conversation Management
- Session-based chat history
- Context-aware responses
- Fallback between OpenAI and Claude APIs

## 📱 PWA Features

- **Offline Support**: Service worker with intelligent caching
- **App-like Experience**: Installable on mobile and desktop
- **Fast Loading**: Optimized assets and lazy loading
- **Responsive**: Mobile-first design with dynamic layouts

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Automated deployment
./deploy.sh

# Manual deployment
cd frontend
vercel --prod
```

### Manual Deployment
1. Build the project: `npm run build`
2. Deploy `frontend/dist/` to your hosting provider
3. Configure environment variables on your platform

## 📚 Documentation

- [`QUICKSTART.md`](./QUICKSTART.md) - Rapid setup guide
- [`STRUCTURE.md`](./STRUCTURE.md) - Project architecture
- [`frontend/AI_CHATBOT_SETUP.md`](./frontend/AI_CHATBOT_SETUP.md) - AI configuration
- [`frontend/DEPLOYMENT.md`](./frontend/DEPLOYMENT.md) - Deployment guide
- [`FIXES.md`](./FIXES.md) - Troubleshooting guide

## �️ Development

### Project Scripts
```bash
# Start development server
./dev.sh

# Deploy to production  
./deploy.sh

# Full project setup
./start.sh

# Run tests
cd frontend && npm test
```

### Testing AI Features
```bash
cd frontend
node scripts/testChatbot.js
node scripts/initializeKnowledgeBase.js
```

## � Performance

- **Lighthouse Score**: 95+ across all metrics
- **First Contentful Paint**: < 1.5s
- **Interactive**: < 2.5s
- **Cached AI Responses**: < 200ms
- **Vector Search**: < 500ms

## 🔒 Security

- Environment variable isolation
- API key encryption in transit
- Rate limiting on AI endpoints
- Input sanitization and validation
- CORS configuration for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 About Isaac Mineo

Computer Science student at the University of Iowa with a passion for AI, full-stack development, and creating innovative solutions. This portfolio showcases both technical skills and the ability to integrate cutting-edge AI technologies into practical applications.

**Connect with me:**
- 📧 Email: isaac-mineo@uiowa.edu
- 💼 LinkedIn: [Isaac Mineo](https://linkedin.com/in/isaac-mineo)
- 🐱 GitHub: [@GoldenRodger5](https://github.com/GoldenRodger5)

---

⭐ Star this repo if you found it helpful!

*Built with React, Vite, Tailwind CSS, OpenAI, Claude, Pinecone, and Redis*
