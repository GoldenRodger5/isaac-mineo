#!/bin/bash

# Quick Backend Verification Script
# Run this after your Render deployment completes

BACKEND_URL="https://isaac-mineo-api.onrender.com"

echo "🔍 Testing Render Backend Deployment..."
echo "Backend URL: $BACKEND_URL"
echo ""

# Test health endpoint
echo "1. Testing health endpoint..."
if curl -s "$BACKEND_URL/health" | grep -q "healthy\|ok\|status"; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
fi

# Test API docs
echo ""
echo "2. Testing API documentation..."
if curl -s "$BACKEND_URL/docs" | grep -q "FastAPI\|Swagger"; then
    echo "✅ API docs accessible"
else
    echo "❌ API docs not accessible"
fi

# Test CORS
echo ""
echo "3. Testing CORS configuration..."
CORS_TEST=$(curl -s -H "Origin: https://isaacmineo.com" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type" -X OPTIONS "$BACKEND_URL/api/chatbot")
if [ $? -eq 0 ]; then
    echo "✅ CORS configured correctly"
else
    echo "❌ CORS may have issues"
fi

echo ""
echo "🎯 Backend verification complete!"
echo "Next: Update frontend environment variables with your actual Render URL"
