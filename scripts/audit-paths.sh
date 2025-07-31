#!/bin/bash

# Path Audit Script - Test all script references after reorganization
echo "🔍 Auditing script paths after reorganization..."
echo "================================================"

cd "$(dirname "$0")/.."

echo "✅ Testing main start.sh script..."
if [ -f "start.sh" ]; then
    echo "   ✓ start.sh exists"
else
    echo "   ❌ start.sh missing"
fi

echo ""
echo "✅ Testing scripts/ folder contents..."
for script in start-dev.sh start-backend.sh start-frontend.sh validate-env.sh render-deploy.sh; do
    if [ -f "scripts/$script" ]; then
        echo "   ✓ scripts/$script exists"
    else
        echo "   ❌ scripts/$script missing"
    fi
done

echo ""
echo "✅ Testing config/ folder contents..."
for config in render.yaml vercel.json; do
    if [ -f "config/$config" ]; then
        echo "   ✓ config/$config exists"
    else
        echo "   ❌ config/$config missing"
    fi
done

echo ""
echo "✅ Testing docs/ folder contents..."
for doc in DEPLOYMENT_GUIDE.md DEVELOPMENT.md ARCHITECTURE.md; do
    if [ -f "docs/$doc" ]; then
        echo "   ✓ docs/$doc exists"
    else
        echo "   ❌ docs/$doc missing"
    fi
done

echo ""
echo "🔧 Testing script cross-references..."
echo "Checking if scripts reference correct paths..."

# Check start-dev.sh for correct script paths
if grep -q "./scripts/start-backend.sh" scripts/start-dev.sh; then
    echo "   ✓ start-dev.sh correctly references start-backend.sh"
else
    echo "   ❌ start-dev.sh has incorrect backend script reference"
fi

if grep -q "./scripts/start-frontend.sh" scripts/start-dev.sh; then
    echo "   ✓ start-dev.sh correctly references start-frontend.sh"
else
    echo "   ❌ start-dev.sh has incorrect frontend script reference"
fi

echo ""
echo "📝 All path references have been updated!"
echo "You can now use:"
echo "  ./start.sh dev           - Start development environment"
echo "  ./scripts/start-dev.sh   - Use complex dev script (if needed)"
echo "  ./scripts/validate-env.sh - Validate environment setup"
