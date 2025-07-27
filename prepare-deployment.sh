#!/bin/bash

# Isaac Mineo Portfolio - Production Deployment Preparation
# Prepares both backend (Render) and frontend (Vercel) for deployment

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}🚀 Isaac Mineo Portfolio - Production Deployment Preparation${NC}"
echo -e "${BLUE}==========================================================${NC}"

# Backend Environment Variables Check
echo -e "\n${YELLOW}📋 BACKEND ENVIRONMENT VARIABLES NEEDED:${NC}"
echo -e "${BLUE}These need to be set in Render's environment variables:${NC}"
echo "  • OPENAI_API_KEY (your OpenAI API key)"
echo "  • PINECONE_API_KEY (your Pinecone API key)"
echo "  • PINECONE_INDEX_NAME=isaac-info"
echo "  • SENDER_EMAIL (for contact form)"
echo "  • SENDER_PASSWORD (app password for email)"
echo "  • REDIS_URL (optional, for caching)"
echo "  • ALLOWED_ORIGINS=https://isaacmineo.com,https://www.isaacmineo.com,https://isaac-mineo.vercel.app"

# Frontend Environment Variables Check
echo -e "\n${YELLOW}📋 FRONTEND ENVIRONMENT VARIABLES NEEDED:${NC}"
echo -e "${BLUE}These need to be set in Vercel's environment variables:${NC}"
echo "  • VITE_API_BASE_URL=https://isaac-mineo-api.onrender.com/api"
echo "  • VITE_BACKEND_URL=https://isaac-mineo-api.onrender.com"
echo "  • VITE_ENVIRONMENT=production"
echo "  • VITE_SITE_PASSWORD=portfolio2024"

echo -e "\n${GREEN}✅ DEPLOYMENT STEPS:${NC}"
echo -e "${BLUE}1. Backend to Render:${NC}"
echo "   • Push code to GitHub"
echo "   • Connect GitHub repo to Render"
echo "   • Use render.yaml for automatic configuration"
echo "   • Set environment variables in Render dashboard"
echo "   • Deploy from main branch"

echo -e "\n${BLUE}2. Frontend to Vercel:${NC}"
echo "   • Push code to GitHub"
echo "   • Connect GitHub repo to Vercel"
echo "   • Set environment variables in Vercel dashboard"
echo "   • Configure domain: isaacmineo.com"
echo "   • Deploy from main branch"

echo -e "\n${YELLOW}📝 Pre-deployment Checklist:${NC}"
echo "  ☐ All environment variables ready"
echo "  ☐ GitHub repository updated"
echo "  ☐ Backend health check working (/health endpoint)"
echo "  ☐ Frontend build working (npm run build)"
echo "  ☐ CORS configured for production domains"
echo "  ☐ CSP updated for production URLs"

echo -e "\n${GREEN}🎯 Ready to deploy!${NC}"
echo "Run the individual deployment scripts or deploy via dashboards."
