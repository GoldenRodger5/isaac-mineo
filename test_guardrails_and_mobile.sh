#!/bin/bash

# Test AI Guardrails and Mobile Code Explainer
echo "🧪 Testing Isaac's Portfolio - AI Guardrails & Mobile Code Explainer"
echo "=================================================================="

# Test AI Guardrails
echo "🛡️  Testing AI Guardrails:"
echo ""

# Test 1: Sports question (should redirect)
echo "1️⃣  Testing Sports Question:"
response1=$(curl -s -X POST "http://localhost:8000/api/chatbot" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is Isaac'\''s favorite football team?", "sessionId": "test_sports"}' | jq -r '.response')
echo "Response preview: ${response1:0:150}..."
echo ""

# Test 2: Technical but off-topic (should redirect) 
echo "2️⃣  Testing Off-topic Technical Question:"
response2=$(curl -s -X POST "http://localhost:8000/api/chatbot" \
  -H "Content-Type: application/json" \
  -d '{"question": "Explain quantum computing", "sessionId": "test_quantum"}' | jq -r '.response')
echo "Response preview: ${response2:0:150}..."
echo ""

# Test 3: Portfolio-related (should answer normally)
echo "3️⃣  Testing Portfolio Question:"
response3=$(curl -s -X POST "http://localhost:8000/api/chatbot" \
  -H "Content-Type: application/json" \
  -d '{"question": "Tell me about Isaac'\''s Nutrivize project", "sessionId": "test_portfolio"}' | jq -r '.response')
echo "Response preview: ${response3:0:150}..."
echo ""

# Test Mobile Code Explainer GitHub Integration
echo "📱 Testing Mobile Code Explainer GitHub Integration:"
echo ""

# Test file retrieval
echo "4️⃣  Testing File Content Retrieval:"
file_response=$(curl -s "http://localhost:8000/api/github/repos/GoldenRodger5/isaac-mineo/files?path=README.md")
file_success=$(echo "$file_response" | jq -r '.success // false')
content_length=$(echo "$file_response" | jq -r '.data.content // "" | length')

if [ "$file_success" = "true" ]; then
    echo "✅ File retrieval successful - Content length: $content_length characters"
    echo "Preview: $(echo "$file_response" | jq -r '.data.content // "" | .[0:100]')..."
else
    echo "❌ File retrieval failed"
    echo "Error: $(echo "$file_response" | jq -r '.error // "Unknown error"')"
fi

echo ""
echo "=================================================================="
echo "✅ Guardrails and GitHub integration tests complete!"
