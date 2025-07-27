#!/bin/bash

# Production Deployment Script for Isaac Mineo Portfolio
# Deploys frontend to Vercel with domain configuration

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Isaac Mineo Portfolio - Production Deployment${NC}"
echo -e "${BLUE}===============================================${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Make sure you're in the frontend directory.${NC}"
    exit 1
fi

# Check for required environment variables
echo -e "${YELLOW}📋 Checking environment configuration...${NC}"

if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating from template...${NC}"
    cp .env.example .env.local
    echo -e "${YELLOW}📝 Please edit .env.local with your actual values before proceeding.${NC}"
    echo -e "${YELLOW}   Required: VITE_SITE_PASSWORD, VITE_API_BASE_URL${NC}"
    read -p "Press Enter when you've configured .env.local..."
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci

# Build the application
echo -e "${YELLOW}🔨 Building production application...${NC}"
npm run build

# Check build success
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed! No dist directory found.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully!${NC}"

# Deploy to Vercel
echo -e "${YELLOW}🌐 Deploying to Vercel...${NC}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}📥 Installing Vercel CLI...${NC}"
    npm install -g vercel
fi

# Deploy
vercel deploy --prod

echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo -e "${BLUE}📱 Your portfolio should be live at:${NC}"
echo -e "${BLUE}   • https://isaacmineo.com${NC}"
echo -e "${BLUE}   • https://www.isaacmineo.com${NC}"

echo -e "${YELLOW}🔧 Post-deployment checklist:${NC}"
echo -e "   ✅ Test the live site functionality"
echo -e "   ✅ Verify AI chatbot is working"
echo -e "   ✅ Test contact form submission"
echo -e "   ✅ Check mobile responsiveness"
echo -e "   ✅ Verify PWA installation works"
echo -e "   ✅ Test all document downloads"

echo -e "${GREEN}🚀 Deployment complete! Portfolio is live!${NC}"
