#!/bin/bash

# Enhanced Setup script for Vercel environment variables including Voice Features
# Run this after deploying to set up all required API keys

echo "🚀 Setting up Vercel environment variables for Isaac Mineo Portfolio..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}📦 Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Navigate to frontend directory
cd frontend

echo -e "${BLUE}🔑 Setting up environment variables...${NC}"
echo ""

# Contact form API key
echo -e "${GREEN}📧 Setting up contact form (RESEND_API_KEY)...${NC}"
vercel env add RESEND_API_KEY production

echo ""
echo -e "${GREEN}🎤 Setting up voice features...${NC}"
echo -e "${YELLOW}Note: Voice features are optional. Skip if you don't have API keys.${NC}"

# Deepgram API key for speech-to-text
echo -e "${BLUE}🎙️  Setting up Deepgram (Speech-to-Text)...${NC}"
echo "Get your API key from: https://deepgram.com"
vercel env add DEEPGRAM_API_KEY production

# ElevenLabs API key for text-to-speech
echo -e "${BLUE}🔊 Setting up ElevenLabs (Text-to-Speech)...${NC}"
echo "Get your API key from: https://elevenlabs.io"
vercel env add ELEVENLABS_API_KEY production

# ElevenLabs Voice ID
echo -e "${BLUE}🎭 Setting up ElevenLabs Voice ID...${NC}"
echo "Find voice IDs in your ElevenLabs dashboard"
vercel env add ELEVENLABS_VOICE_ID production

echo ""
echo -e "${GREEN}✅ Environment variable setup complete!${NC}"
echo ""
echo -e "${BLUE}📋 Manual Setup (Alternative):${NC}"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Select your isaac-mineo project"
echo "3. Go to Settings → Environment Variables"
echo "4. Add these variables for Production:"
echo ""
echo -e "${YELLOW}Required for contact form:${NC}"
echo "   RESEND_API_KEY: re_LcFXASQC_E9C1kztuam1Nap5aW5x37Pbc"
echo ""
echo -e "${YELLOW}Optional for voice features:${NC}"
echo "   DEEPGRAM_API_KEY: your_deepgram_api_key"
echo "   ELEVENLABS_API_KEY: your_elevenlabs_api_key"
echo "   ELEVENLABS_VOICE_ID: your_preferred_voice_id"
echo ""
echo -e "${GREEN}🎉 Your portfolio will now work with enhanced features!${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. Deploy frontend: npm run deploy"
echo "2. Deploy backend to Render with the voice environment variables"
echo "3. Voice features will work once API keys are configured"
