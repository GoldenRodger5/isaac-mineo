# 🚀 Production Deployment Guide

## Overview
This guide covers deploying the Isaac Mineo Portfolio to production:
- **Backend**: FastAPI → Render
- **Frontend**: React/Vite → Vercel

## 📋 Pre-Deployment Checklist

### ✅ Files Updated for Production
- [x] `frontend/index.html` - CSP updated for production URLs
- [x] `frontend/.env.production` - Production environment variables
- [x] `frontend/.env.vercel` - Vercel-specific configuration
- [x] `render.yaml` - Backend deployment configuration
- [x] `vercel.json` - Frontend deployment configuration

### 🔧 Environment Variables Required

#### Backend (Render)
```bash
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=isaac-info
SENDER_EMAIL=noreply@isaacmineo.com
SENDER_PASSWORD=your_app_password
REDIS_URL=your_redis_url (optional)
ALLOWED_ORIGINS=https://isaacmineo.com,https://www.isaacmineo.com,https://isaac-mineo.vercel.app
DEBUG=false
ENVIRONMENT=production
```

#### Frontend (Vercel)
```bash
VITE_API_BASE_URL=https://isaac-mineo-api.onrender.com/api
VITE_BACKEND_URL=https://isaac-mineo-api.onrender.com
VITE_ENVIRONMENT=production
VITE_SITE_PASSWORD=portfolio2024
```

## 🎯 Deployment Steps

### 1. Backend Deployment (Render)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Create Render Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Use these settings:
     - **Name**: `isaac-mineo-api`
     - **Environment**: `Python`
     - **Build Command**: `cd backend && pip install -r requirements.txt`
     - **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
     - **Health Check Path**: `/health`

3. **Set Environment Variables**
   - Add all backend environment variables listed above
   - Deploy

### 2. Frontend Deployment (Vercel)

1. **Create Vercel Project**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

2. **Set Environment Variables**
   - Add all frontend environment variables listed above
   - Deploy

3. **Configure Domain**
   - Add custom domain: `isaacmineo.com`
   - Configure DNS records as instructed by Vercel

## 🔍 Post-Deployment Verification

Run the verification script:
```bash
./verify-deployment.sh
```

Or manually test:
- **Backend Health**: https://isaac-mineo-api.onrender.com/health
- **Frontend**: https://isaacmineo.com
- **API Integration**: Test chatbot functionality

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify `ALLOWED_ORIGINS` includes all frontend URLs
   - Check Vercel deployment URL

2. **Environment Variables**
   - Ensure all required env vars are set
   - Check variable names (case-sensitive)

3. **Build Failures**
   - Check build logs in respective dashboards
   - Verify dependencies in requirements.txt/package.json

4. **CSP Violations**
   - Ensure CSP in index.html includes backend URL
   - Check browser console for specific violations

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)

## 🎉 Success Criteria

✅ Backend health check returns 200
✅ Frontend loads without errors
✅ Chatbot can communicate with backend
✅ No CORS or CSP violations
✅ Domain properly configured

---

**Deployment prepared and ready for production! 🚀**
