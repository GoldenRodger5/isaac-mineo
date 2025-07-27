#!/bin/bash

# Isaac Mineo Portfolio - Deployment Script
echo "🚀 Deploying Isaac Mineo Portfolio..."

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Frontend deployment to Vercel
echo "📦 Building frontend..."
cd frontend

# Install dependencies
echo "📋 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "🌍 Deploying to Vercel..."
if command -v vercel &> /dev/null; then
    vercel --prod
else
    echo "⚠️  Vercel CLI not found. Please install with: npm i -g vercel"
    echo "📝 Manual deployment: Upload the 'dist' folder to Vercel"
fi

echo "✅ Frontend deployment complete!"
echo "🔗 Your site will be available at: https://isaacmineo.com"

cd ..
echo "🎉 Deployment finished!"
