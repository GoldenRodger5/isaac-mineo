#!/bin/bash

# Deployment Verification Script
# Tests both backend and frontend after deployment

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

BACKEND_URL="https://isaac-mineo-api.onrender.com"
FRONTEND_URL="https://isaacmineo.com"

echo -e "${YELLOW}🔍 Verifying Production Deployment...${NC}"

# Test backend health
echo -e "\n${YELLOW}Testing Backend Health:${NC}"
if curl -s "${BACKEND_URL}/health" > /dev/null; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
fi

# Test backend API
echo -e "\n${YELLOW}Testing Backend API:${NC}"
RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/chatbot" \
  -H "Content-Type: application/json" \
  -d '{"question": "Hello, this is a test message"}' || echo "failed")

if [[ "$RESPONSE" == "failed" ]]; then
    echo -e "${RED}❌ Backend API test failed${NC}"
else
    echo -e "${GREEN}✅ Backend API responding${NC}"
fi

# Test frontend
echo -e "\n${YELLOW}Testing Frontend:${NC}"
if curl -s "${FRONTEND_URL}" > /dev/null; then
    echo -e "${GREEN}✅ Frontend accessible${NC}"
else
    echo -e "${RED}❌ Frontend not accessible${NC}"
fi

echo -e "\n${YELLOW}🎯 Deployment verification complete!${NC}"
