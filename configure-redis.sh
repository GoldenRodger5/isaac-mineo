#!/bin/bash

# Redis Configuration for Render Deployment
# This script helps configure the Redis URL in your Render environment

echo "🔧 REDIS CONFIGURATION FOR RENDER"
echo "=================================="
echo ""
echo "You need to set this REDIS_URL in your Render dashboard:"
echo ""
echo "REDIS_URL=redis://default:BlBhCZlOmDMCSAGcQQjA2kIh6WOFUzhR@redis-11729.c320.us-east-1-mz.ec2.redns.redis-cloud.com:11729"
echo ""
echo "Steps to configure in Render:"
echo "1. Go to https://dashboard.render.com"
echo "2. Select your 'isaac-mineo-api' service"
echo "3. Go to Environment tab"
echo "4. Find REDIS_URL variable"
echo "5. Set the value to the URL above"
echo "6. Save and redeploy"
echo ""
echo "After setting the environment variable, run:"
echo "  curl https://isaac-mineo-api.onrender.com/health"
echo ""
echo "The Redis connection should show as connected in the logs."
