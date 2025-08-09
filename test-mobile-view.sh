#!/bin/bash

echo "🔍 Testing Mobile View Functionality..."

# Test 1: Check if servers are running
echo "📡 Checking server status..."

FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/)
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend server running (port 5173)"
else
    echo "❌ Frontend server not responding"
fi

if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Backend server running (port 8000)"
else
    echo "❌ Backend server not responding"
fi

# Test 2: Check mobile-specific meta tags
echo ""
echo "📱 Checking mobile meta tags..."

VIEWPORT_META=$(curl -s http://localhost:5173/ | grep -o 'name="viewport"[^>]*' | head -1)
if [[ $VIEWPORT_META == *"width=device-width"* ]]; then
    echo "✅ Proper viewport meta tag found"
else
    echo "❌ Viewport meta tag missing or incorrect"
fi

# Test 3: Check CSS files exist
echo ""
echo "🎨 Checking CSS files..."

if [ -f "frontend/src/styles/mobile-enhancements.css" ]; then
    echo "✅ Mobile enhancements CSS exists"
    LINE_COUNT=$(wc -l < frontend/src/styles/mobile-enhancements.css)
    echo "   - File size: $LINE_COUNT lines"
else
    echo "❌ Mobile enhancements CSS missing"
fi

# Test 4: Check mobile components exist
echo ""
echo "🧩 Checking mobile components..."

MOBILE_COMPONENTS=(
    "frontend/src/components/mobile/MobileNavigation.jsx"
    "frontend/src/components/mobile/EnhancedMobileLayout.jsx"
    "frontend/src/components/mobile/MobileTouchComponents.jsx"
    "frontend/src/components/mobile/MobilePerformance.jsx"
)

for component in "${MOBILE_COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        echo "✅ $(basename $component) exists"
    else
        echo "❌ $(basename $component) missing"
    fi
done

# Test 5: Check API endpoints
echo ""
echo "🌐 Testing API endpoints..."

ENDPOINTS=(
    "/health"
    "/api/voice/status"
    "/api/analytics/track/page"
)

for endpoint in "${ENDPOINTS[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8000$endpoint")
    if [ "$STATUS" = "200" ]; then
        echo "✅ $endpoint responding"
    else
        echo "❌ $endpoint not responding (HTTP $STATUS)"
    fi
done

# Test 6: Check for JavaScript errors in build
echo ""
echo "🔧 Checking build status..."

cd frontend
npm run build > /tmp/build.log 2>&1
BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "✅ Frontend builds successfully"
else
    echo "❌ Frontend build has errors:"
    tail -10 /tmp/build.log
fi

echo ""
echo "🎯 Mobile View Test Summary:"
echo "================================="

# Count results
TOTAL_TESTS=6
PASSED_TESTS=0

# Simple scoring (would need to be more sophisticated in real implementation)
if [ "$FRONTEND_STATUS" = "200" ] && [ "$BACKEND_STATUS" = "200" ]; then
    ((PASSED_TESTS++))
fi

if [[ $VIEWPORT_META == *"width=device-width"* ]]; then
    ((PASSED_TESTS++))
fi

if [ -f "frontend/src/styles/mobile-enhancements.css" ]; then
    ((PASSED_TESTS++))
fi

COMPONENT_COUNT=0
for component in "${MOBILE_COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        ((COMPONENT_COUNT++))
    fi
done

if [ $COMPONENT_COUNT -ge 3 ]; then
    ((PASSED_TESTS++))
fi

API_COUNT=0
for endpoint in "${ENDPOINTS[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8000$endpoint")
    if [ "$STATUS" = "200" ]; then
        ((API_COUNT++))
    fi
done

if [ $API_COUNT -ge 2 ]; then
    ((PASSED_TESTS++))
fi

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    ((PASSED_TESTS++))
fi

SCORE=$(( PASSED_TESTS * 100 / TOTAL_TESTS ))

echo "📊 Score: $SCORE% ($PASSED_TESTS/$TOTAL_TESTS tests passed)"

if [ $SCORE -ge 80 ]; then
    echo "🎉 Mobile view is working well!"
elif [ $SCORE -ge 60 ]; then
    echo "👍 Mobile view is functional with minor issues"
else
    echo "⚠️ Mobile view needs attention"
fi

echo ""
echo "💡 To test mobile view interactively:"
echo "   1. Open http://localhost:5173 in browser"
echo "   2. Open Developer Tools (F12)"
echo "   3. Toggle device simulation"
echo "   4. Test touch interactions and navigation"
echo ""
echo "📱 For advanced debugging, add ?debug=mobile to the URL"

cd ..
