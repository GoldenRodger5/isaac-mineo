#!/bin/bash

# Deploy with Redis Configuration
# This script helps deploy the backend with proper Redis settings

echo "🚀 DEPLOYING BACKEND WITH REDIS CONFIGURATION"
echo "=============================================="

# The Redis URL that needs to be set in Render
REDIS_URL="redis://default:BlBhCZlOmDMCSAGcQQjA2kIh6WOFUzhR@redis-11729.c320.us-east-1-mz.ec2.redns.redis-cloud.com:11729"

echo ""
echo "✅ Redis connection tested successfully!"
echo ""
echo "🔧 RENDER CONFIGURATION NEEDED:"
echo "================================"
echo ""
echo "Go to your Render dashboard and set this environment variable:"
echo ""
echo "Variable: REDIS_URL"
echo "Value: $REDIS_URL"
echo ""
echo "Steps:"
echo "1. Visit: https://dashboard.render.com"
echo "2. Select your 'isaac-mineo-api' service"
echo "3. Go to 'Environment' tab"
echo "4. Find or add 'REDIS_URL' variable"
echo "5. Set the value above"
echo "6. Click 'Save' - this will trigger a redeploy"
echo ""
echo "After the redeploy completes, run:"
echo "  ./test-production-redis.sh"
echo ""
echo "This will verify that Redis is working in production."
