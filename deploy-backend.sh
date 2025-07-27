#!/bin/bash

# Backend Deployment Script for Render
# Prepares and deploys the FastAPI backend

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Isaac Mineo Portfolio - Backend Deployment${NC}"
echo -e "${BLUE}=============================================${NC}"

# Check if we're in the backend directory
if [ ! -f "requirements.txt" ]; then
    echo -e "${RED}❌ Error: requirements.txt not found. Make sure you're in the backend directory.${NC}"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env not found. Creating from template...${NC}"
    cp ../.env.example .env
    echo -e "${YELLOW}📝 Please edit .env with your actual values before deploying.${NC}"
    echo -e "${YELLOW}   Required: OPENAI_API_KEY, PINECONE_API_KEY, SENDER_EMAIL, SENDER_PASSWORD${NC}"
    read -p "Press Enter when you've configured .env..."
fi

# Update requirements if needed
echo -e "${YELLOW}📦 Updating requirements.txt...${NC}"
cat > requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
python-dotenv==1.0.0
openai==1.3.8
pinecone-client==2.2.4
redis==5.0.1
pydantic==2.5.0
requests==2.31.0
aiofiles==23.2.1
jinja2==3.1.2
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
httpx==0.25.2
EOF

echo -e "${GREEN}✅ Requirements updated${NC}"

# Validate Python files
echo -e "${YELLOW}🔍 Validating Python syntax...${NC}"
python -m py_compile app/main.py
python -m py_compile app/routers/chatbot.py

echo -e "${GREEN}✅ Python validation passed${NC}"

# Test import paths
echo -e "${YELLOW}🧪 Testing imports...${NC}"
cd app && python -c "
try:
    from services.email_service import email_service
    from services.knowledge_service import knowledge_service
    from services.error_handler import error_handler
    print('✅ All imports successful')
except ImportError as e:
    print(f'❌ Import error: {e}')
    exit(1)
" && cd ..

echo -e "${GREEN}🎉 Backend validation completed!${NC}"
echo -e "${BLUE}🌐 Deploy to Render:${NC}"
echo -e "   1. Connect this repo to Render"
echo -e "   2. Set environment variables in Render dashboard"
echo -e "   3. Deploy from main branch"

echo -e "${YELLOW}🔧 Render Environment Variables to set:${NC}"
echo -e "   • OPENAI_API_KEY"
echo -e "   • PINECONE_API_KEY"
echo -e "   • PINECONE_INDEX_NAME=isaac-info"
echo -e "   • SENDER_EMAIL"
echo -e "   • SENDER_PASSWORD"
echo -e "   • REDIS_URL (optional)"
echo -e "   • DEBUG=false"
echo -e "   • ENVIRONMENT=production"

echo -e "${GREEN}✅ Backend ready for deployment!${NC}"
