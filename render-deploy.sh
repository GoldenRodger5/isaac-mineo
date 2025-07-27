#!/bin/bash

# Isaac Mineo Portfolio - Render Deployment Script
# Production deployment for FastAPI backend

set -e

echo "🚀 Isaac Mineo Portfolio - Render Deployment"
echo "=============================================="

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Environment validation
echo "🔧 Validating environment..."
required_vars=("OPENAI_API_KEY" "PINECONE_API_KEY" "PINECONE_INDEX_NAME" "REDIS_URL")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    printf '%s\n' "${missing_vars[@]}"
    exit 1
fi

echo "✅ All required environment variables found"

# Initialize Pinecone if needed
echo "🔍 Initializing vector database..."
python -c "
import asyncio
import os
from backend.app.utils.pinecone_service import initialize_pinecone

async def init():
    try:
        await initialize_pinecone()
        print('✅ Vector database initialized')
    except Exception as e:
        print(f'⚠️  Vector database initialization: {e}')

asyncio.run(init())
"

echo "🌟 Deployment complete! Starting server..."

# Start the application (Render will use this)
exec uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}
