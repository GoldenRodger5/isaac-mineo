# Isaac Mineo Portfolio - Frontend 🎨

Clean React frontend that communicates with FastAPI backend for all functionality.

## 🏗️ Architecture

This frontend follows a **clean architecture** principle:
- **Pure UI/UX focus** - No backend logic or AI functionality
- **Single API client** - All requests go to FastAPI backend
- **No duplicate files** - Clean, organized codebase
- **Modern tooling** - React 18 + Vite + Tailwind CSS

## 📁 Project Structure

```
frontend/
├── src/
│   ├── App.jsx              # Main React component
│   ├── main.jsx             # React entry point
│   ├── index.css            # Global styles
│   ├── components/          # React components
│   │   ├── AIChatbot.jsx    # AI chat interface
│   │   ├── Contact.jsx      # Contact form
│   │   ├── Projects.jsx     # Projects showcase
│   │   └── ...              # Other UI components
│   ├── services/            
│   │   └── apiClient.js     # FastAPI communication
│   └── data/                # Static knowledge base
├── public/                  # Static assets
├── scripts/
│   └── quickTest.js         # API testing utility
├── vercel.json              # Deployment configuration
└── package.json             # Dependencies
```

## 🚀 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production  
npm run build

# Test API connection
node scripts/quickTest.js
```

## 🔗 FastAPI Integration

All functionality is handled by the FastAPI backend:

- **Chatbot**: `POST /api/chatbot` - Enhanced with context awareness
- **Contact**: `POST /api/contact` - Contact form submissions  
- **Health**: `GET /health` - System health checks

The frontend `apiClient.js` handles all communication with the backend.

## 🎯 Recent Cleanup

### ✅ Removed Files
- Duplicate Vercel configs (`vercel_new.json`, `vercel_old.json`, etc.)
- Old component versions (`App_old.jsx`, `Contact_new.jsx`, etc.)  
- Unused utilities (`pineconeEnhanced.js`, `cacheManager.js`, etc.)
- Obsolete documentation files
- Python dependencies (`requirements.txt`)
- Redundant API functions (moved to FastAPI)

### ✅ Clean Structure
- Single source of truth for all configurations
- No confusion about which files to edit
- Faster builds and smaller bundle size
- Clear separation of concerns

## 🌐 Deployment

Deployed to Vercel with SPA routing configured in `vercel.json`.

The frontend automatically detects environment and connects to:
- **Development**: Local FastAPI backend
- **Production**: Render-hosted FastAPI backend
