#!/bin/bash

# Isaac Mineo Portfolio - Development Setup
echo "🛠️  Isaac Mineo Portfolio - Development Setup"

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Frontend setup
echo "📦 Setting up frontend..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📋 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Start development server
echo "🚀 Starting development server on port 5174..."
echo "🌍 Frontend: http://localhost:5174"
echo "📝 Note: Port 5174 is used to avoid conflicts with other apps"
echo ""
echo "Press Ctrl+C to stop the server"

npm run dev
