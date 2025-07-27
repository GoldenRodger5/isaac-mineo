# 🚀 Quick Start Guide

## One Command to Rule Them All

```bash
./start.sh
```

That's it! This smart script handles everything for you.

## What the Start Script Does

### 🔍 **Smart Detection**
- ✅ Checks if backend is configured
- ✅ Installs dependencies automatically
- ✅ Starts services in the right order
- ✅ Provides helpful status messages

### 🌍 **Development URLs**
- **Frontend**: http://localhost:5174
- **Backend**: http://localhost:8000 (when configured)

### 🛠️ **Current State (Frontend Only)**
```
✅ Frontend: Fully configured and running
⚠️  Backend: Structure ready, not configured yet
```

### 🔮 **With Backend (Future)**
```
✅ Frontend: React app on port 5174
✅ Backend: FastAPI on port 8000
✅ Auto-restart: Both services watch for changes
✅ CORS: Configured for cross-origin requests
```

## Backend Setup (When Ready)

```bash
cd backend
./setup.sh              # Creates FastAPI structure
cd ..
./start.sh              # Now starts both frontend + backend!
```

## Manual Control

```bash
# Frontend only
./dev.sh

# Deploy to production
./deploy.sh

# Backend setup
cd backend && ./setup.sh
```

## Stopping Services

Just press **Ctrl+C** in the terminal running `./start.sh` - it will gracefully shut down both frontend and backend.

## Troubleshooting

### Port Conflicts
- Frontend uses port **5174** (not 5173) to avoid conflicts
- Backend uses port **8000**
- Both can be changed in their respective config files

### Dependencies
The start script automatically installs dependencies, but you can also run:
```bash
cd frontend && npm install
cd backend && pip install -r requirements.txt  # when backend is ready
```

---

**🎯 Goal**: One command to start everything, whether you have just frontend or full-stack! 🚀
