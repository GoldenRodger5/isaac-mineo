#!/bin/bash

# Setup script for Vercel environment variables
# Run this after deploying to set up the Resend API key

echo "🚀 Setting up Vercel environment variables..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Set the RESEND_API_KEY environment variable
echo "🔑 Setting RESEND_API_KEY..."

# Navigate to frontend directory
cd frontend

# Set the environment variable for production
vercel env add RESEND_API_KEY production

echo "✅ Environment variable setup complete!"
echo ""
echo "📋 Manual Setup (Alternative):"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Select your isaac-mineo project"
echo "3. Go to Settings → Environment Variables"
echo "4. Add new variable:"
echo "   Name: RESEND_API_KEY"
echo "   Value: re_LcFXASQC_E9C1kztuam1Nap5aW5x37Pbc"
echo "   Environment: Production"
echo ""
echo "🎉 Your contact form will now work in both development and production!"
