# Isaac Mineo - AI-Powered Portfolio 🚀

A comprehensive Progressive Web App (PWA) portfolio featuring advanced AI chatbot capabilities, semantic search, and modern responsive design.

## ✨ Features

### Core Portfolio
- **Progressive Web App** with offline support and service worker
- **Responsive Design** with Tailwind CSS and dynamic island support  
- **Professional Sections**: About, Projects, Resume, Contact
- **Resume & Transcript PDFs** with downloadable links

### AI-Powered Chatbot 🤖
- **Dual AI APIs**: OpenAI GPT-4 and Claude integration
- **Semantic Search** across resume, transcript, and knowledge base
- **PDF Document Processing** with intelligent text chunking
- **Conversation Context** with session management
- **Real-time Responses** with typing indicators

### Advanced Technology Stack
- **Vector Database**: Pinecone for semantic search
- **Caching**: Redis Cloud with write-through strategy
- **Rate Limiting**: Production-ready with proper error handling
- **Dual Environment**: Node.js frontend + Python AI processing

## 🏗️ Architecture

```
isaac-mineo/
├── frontend/              # React PWA Application
│   ├── src/
│   │   ├── components/    # React components (About, Projects, AIChatbot, etc.)
│   │   ├── utils/         # AI utilities (Pinecone, Cache, Document Processing)
│   │   └── data/          # Knowledge base and static content
│   ├── api/               # Serverless API functions
│   ├── public/           # Static assets, PWA manifest, service worker
│   └── scripts/          # Setup and testing utilities
├── backend/              # Optional Node.js server (if needed)
├── scripts/              # Project automation and deployment
└── docs/                 # Comprehensive documentation
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
