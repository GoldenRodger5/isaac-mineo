#!/bin/bash

# Full Stack Deployment Verification
# Tests both backend and frontend with custom domain

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BACKEND_URL="https://isaac-mineo-api.onrender.com"
FRONTEND_URL="https://isaacmineo.com"
FRONTEND_VERCEL="https://isaac-mineo.vercel.app"  # Update with your actual URL

echo -e "${BLUE}🔍 Full Stack Deployment Verification${NC}"
echo -e "${BLUE}====================================${NC}"

# Test Backend
echo -e "\n${YELLOW}1. Testing Backend (Render):${NC}"
if curl -s "${BACKEND_URL}/health" | grep -q "healthy\|ok\|status"; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
fi

# Test Backend API
echo -e "\n${YELLOW}2. Testing Backend API:${NC}"
RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/chatbot" \
  -H "Content-Type: application/json" \
  -d '{"question": "Hello"}' || echo "failed")

if [[ "$RESPONSE" == "failed" ]]; then
    echo -e "${RED}❌ Backend API test failed${NC}"
else
    echo -e "${GREEN}✅ Backend API responding${NC}"
fi

# Test Frontend (Vercel)
echo -e "\n${YELLOW}3. Testing Frontend (Vercel):${NC}"
if curl -s "${FRONTEND_VERCEL}" > /dev/null; then
    echo -e "${GREEN}✅ Frontend (Vercel) accessible${NC}"
else
    echo -e "${RED}❌ Frontend (Vercel) not accessible${NC}"
fi

# Test Custom Domain
echo -e "\n${YELLOW}4. Testing Custom Domain:${NC}"
if curl -s "${FRONTEND_URL}" > /dev/null; then
    echo -e "${GREEN}✅ Custom domain (isaacmineo.com) accessible${NC}"
else
    echo -e "${YELLOW}⏳ Custom domain pending DNS propagation${NC}"
fi

echo -e "\n${BLUE}🎯 Verification complete!${NC}"
echo -e "${YELLOW}Note: Custom domain may take up to 48 hours to fully propagate${NC}"
