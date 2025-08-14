#!/bin/bash

# Fix Backend URL - Deploy to Vercel with Correct Environment Variables
echo "🔧 Fixing Backend URL and Deploying to Vercel..."

cd "$(dirname "$0")/frontend"

# Set correct environment variables for Vercel deployment
export VITE_API_BASE_URL="https://isaac-mineo-api.onrender.com/api"
export VITE_BACKEND_URL="https://isaac-mineo-api.onrender.com"
export VITE_API_URL="https://isaac-mineo-api.onrender.com/api"
export VITE_ENVIRONMENT="production"
export NODE_ENV="production"

echo "✅ Environment variables set:"
echo "   VITE_API_BASE_URL: $VITE_API_BASE_URL"
echo "   VITE_BACKEND_URL: $VITE_BACKEND_URL"
echo "   VITE_API_URL: $VITE_API_URL"

# Build the frontend with correct environment variables
echo "🔨 Building frontend with corrected backend URL..."
npm run build

# Deploy to Vercel (this will prompt for confirmation)
echo "🚀 Deploying to Vercel..."
npx vercel --prod

echo ""
echo "✅ Deployment initiated!"
echo "📱 Once deployed, test at: https://isaacmineo.com"
echo "🔗 Backend API: https://isaac-mineo-api.onrender.com"
echo ""
echo "📋 Manual Vercel Environment Variables (if needed):"
echo "   VITE_API_BASE_URL=https://isaac-mineo-api.onrender.com/api"
echo "   VITE_BACKEND_URL=https://isaac-mineo-api.onrender.com"
echo "   VITE_API_URL=https://isaac-mineo-api.onrender.com/api"
