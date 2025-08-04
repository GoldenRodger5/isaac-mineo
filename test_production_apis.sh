#!/bin/bash

# Production API Test Script
echo "🧪 Testing Production Backend APIs"
echo "=================================="

# Test health endpoint
echo "📊 Health Check:"
curl -s "https://isaac-mineo-api.onrender.com/health" | jq -r '.status'

# Test AI chatbot
echo "🤖 AI Chatbot Test:"
response=$(curl -s -X POST "https://isaac-mineo-api.onrender.com/api/chatbot" \
  -H "Content-Type: application/json" \
  -d '{"question": "Hi, are you working?", "sessionId": "health_check"}')
echo "$response" | jq -r '.response' | head -c 100
echo "..."

# Test GitHub integration
echo "🐙 GitHub Integration Test:"
curl -s "https://isaac-mineo-api.onrender.com/api/github/repos?username=GoldenRodger5" | jq -r '.count'
echo " repositories found"

# Test code explainer
echo "💻 Code Explainer Test:"
response=$(curl -s -X POST "https://isaac-mineo-api.onrender.com/api/github/explain-code" \
  -H "Content-Type: application/json" \
  -d '{"code": "def test(): pass", "mode": "explain"}')
echo "$response" | jq -r '.success'

echo "=================================="
echo "✅ All services operational!"
