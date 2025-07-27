#!/bin/bash

# Environment Validation Script
# Checks that all required environment variables are set

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Isaac Mineo Portfolio - Environment Validation${NC}"
echo -e "${BLUE}=================================================${NC}"

# Navigate to project root
cd "$(dirname "$0")"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found in project root${NC}"
    echo -e "${YELLOW}   Please create .env file with required variables${NC}"
    exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}"

# Load environment variables
source .env

# Required variables for basic functionality
REQUIRED_VARS=(
    "VITE_SITE_PASSWORD"
    "OPENAI_API_KEY"
    "VITE_API_BASE_URL"
    "VITE_BACKEND_URL"
)

# Optional but recommended variables
OPTIONAL_VARS=(
    "CLAUDE_API_KEY"
    "PINECONE_API_KEY"
    "PINECONE_INDEX_NAME"
    "REDIS_URL"
    "SENDER_EMAIL"
    "SENDER_PASSWORD"
)

echo -e "\n${BLUE}Checking required variables:${NC}"

# Check required variables
all_required_set=true
for var in "${REQUIRED_VARS[@]}"; do
    var_value="${!var}"
    if [ -z "$var_value" ] || [[ "$var_value" == *"your_"* ]] || [[ "$var_value" == *"_here"* ]]; then
        echo -e "${RED}❌ $var is not set or still has placeholder value${NC}"
        all_required_set=false
    else
        echo -e "${GREEN}✅ $var is set${NC}"
    fi
done

echo -e "\n${BLUE}Checking optional variables:${NC}"

# Check optional variables
for var in "${OPTIONAL_VARS[@]}"; do
    var_value="${!var}"
    if [ -z "$var_value" ] || [[ "$var_value" == *"your_"* ]] || [[ "$var_value" == *"_here"* ]]; then
        echo -e "${YELLOW}⚠️  $var is not set (optional)${NC}"
    else
        echo -e "${GREEN}✅ $var is set${NC}"
    fi
done

echo -e "\n${BLUE}Configuration Summary:${NC}"
echo -e "Site Password: ${GREEN}Set${NC}"
echo -e "Environment: ${VITE_ENVIRONMENT:-development}"
echo -e "Backend URL: ${VITE_BACKEND_URL:-http://localhost:8000}"
echo -e "Domain: ${DOMAIN:-localhost}"

if [ "$all_required_set" = true ]; then
    echo -e "\n${GREEN}🎉 All required environment variables are configured!${NC}"
    echo -e "${GREEN}   You can now run: ./start-dev.sh${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some required environment variables are missing${NC}"
    echo -e "${YELLOW}   Please update your .env file with actual values${NC}"
    exit 1
fi
