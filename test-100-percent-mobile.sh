#!/bin/bash

echo "🏆 COMPREHENSIVE 100% MOBILE SCORE TEST"
echo "======================================="

# Initialize counters
TOTAL_POINTS=0
MAX_POINTS=0

# Test 1: Server Infrastructure (10 points)
echo ""
echo "🌐 Testing Server Infrastructure (10 points)..."
INFRA_POINTS=0

FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/)
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend server running (5 points)"
    ((INFRA_POINTS += 5))
else
    echo "❌ Frontend server not running (0 points)"
fi

if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Backend server running (5 points)"
    ((INFRA_POINTS += 5))
else
    echo "❌ Backend server not running (0 points)"
fi

TOTAL_POINTS=$((TOTAL_POINTS + INFRA_POINTS))
MAX_POINTS=$((MAX_POINTS + 10))
echo "📊 Infrastructure Score: $INFRA_POINTS/10"

# Test 2: Mobile-First Design (15 points)
echo ""
echo "📱 Testing Mobile-First Design (15 points)..."
DESIGN_POINTS=0

# Viewport meta tag
VIEWPORT_META=$(curl -s http://localhost:5173/ | grep -o 'name="viewport"[^>]*' | head -1)
if [[ $VIEWPORT_META == *"width=device-width"* && $VIEWPORT_META == *"viewport-fit=cover"* ]]; then
    echo "✅ Perfect viewport meta tag with safe areas (5 points)"
    ((DESIGN_POINTS += 5))
elif [[ $VIEWPORT_META == *"width=device-width"* ]]; then
    echo "✅ Basic viewport meta tag (3 points)"
    ((DESIGN_POINTS += 3))
else
    echo "❌ Missing or incorrect viewport meta (0 points)"
fi

# Mobile CSS enhancements
if [ -f "frontend/src/styles/mobile-enhancements.css" ]; then
    LINE_COUNT=$(wc -l < frontend/src/styles/mobile-enhancements.css)
    if [ $LINE_COUNT -gt 300 ]; then
        echo "✅ Comprehensive mobile CSS ($LINE_COUNT lines) (5 points)"
        ((DESIGN_POINTS += 5))
    else
        echo "✅ Basic mobile CSS ($LINE_COUNT lines) (3 points)"
        ((DESIGN_POINTS += 3))
    fi
else
    echo "❌ Missing mobile CSS enhancements (0 points)"
fi

# PWA manifest
if [ -f "frontend/public/manifest.json" ]; then
    echo "✅ PWA manifest present (3 points)"
    ((DESIGN_POINTS += 3))
else
    echo "❌ PWA manifest missing (0 points)"
fi

# Service worker
if [ -f "frontend/public/sw.js" ]; then
    echo "✅ Service worker present (2 points)"
    ((DESIGN_POINTS += 2))
else
    echo "❌ Service worker missing (0 points)"
fi

TOTAL_POINTS=$((TOTAL_POINTS + DESIGN_POINTS))
MAX_POINTS=$((MAX_POINTS + 15))
echo "📊 Mobile Design Score: $DESIGN_POINTS/15"

# Test 3: Advanced Mobile Components (20 points)
echo ""
echo "🧩 Testing Advanced Mobile Components (20 points)..."
COMPONENT_POINTS=0

MOBILE_COMPONENTS=(
    "frontend/src/components/mobile/MobileNavigation.jsx:5"
    "frontend/src/components/mobile/EnhancedMobileLayout.jsx:5"
    "frontend/src/components/mobile/MobileTouchComponents.jsx:5"
    "frontend/src/components/mobile/MobilePerformance.jsx:5"
)

for component_info in "${MOBILE_COMPONENTS[@]}"; do
    IFS=':' read -r component points <<< "$component_info"
    if [ -f "$component" ]; then
        LINE_COUNT=$(wc -l < "$component")
        if [ $LINE_COUNT -gt 100 ]; then
            echo "✅ $(basename $component) exists and comprehensive ($LINE_COUNT lines) ($points points)"
            ((COMPONENT_POINTS += points))
        else
            echo "✅ $(basename $component) exists but basic ($LINE_COUNT lines) ($(($points - 2)) points)"
            ((COMPONENT_POINTS += $((points - 2))))
        fi
    else
        echo "❌ $(basename $component) missing (0 points)"
    fi
done

TOTAL_POINTS=$((TOTAL_POINTS + COMPONENT_POINTS))
MAX_POINTS=$((MAX_POINTS + 20))
echo "📊 Mobile Components Score: $COMPONENT_POINTS/20"

# Test 4: Premium Utilities (15 points)
echo ""
echo "🛠️ Testing Premium Mobile Utilities (15 points)..."
UTILS_POINTS=0

PREMIUM_UTILS=(
    "frontend/src/utils/advancedTouchGestures.js:5"
    "frontend/src/utils/mobileDeviceManager.js:5"
    "frontend/src/utils/mobileAccessibilityManager.js:5"
)

for util_info in "${PREMIUM_UTILS[@]}"; do
    IFS=':' read -r util points <<< "$util_info"
    if [ -f "$util" ]; then
        LINE_COUNT=$(wc -l < "$util")
        if [ $LINE_COUNT -gt 200 ]; then
            echo "✅ $(basename $util) comprehensive ($LINE_COUNT lines) ($points points)"
            ((UTILS_POINTS += points))
        else
            echo "✅ $(basename $util) basic ($LINE_COUNT lines) ($(($points - 2)) points)"
            ((UTILS_POINTS += $((points - 2))))
        fi
    else
        echo "❌ $(basename $util) missing (0 points)"
    fi
done

TOTAL_POINTS=$((TOTAL_POINTS + UTILS_POINTS))
MAX_POINTS=$((MAX_POINTS + 15))
echo "📊 Premium Utilities Score: $UTILS_POINTS/15"

# Test 5: API Integration (10 points)
echo ""
echo "🌐 Testing API Integration (10 points)..."
API_POINTS=0

# Health endpoint
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8000/health")
if [ "$HEALTH_STATUS" = "200" ]; then
    echo "✅ Health API working (3 points)"
    ((API_POINTS += 3))
else
    echo "❌ Health API not working (0 points)"
fi

# Voice endpoint
VOICE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8000/api/voice/status")
if [ "$VOICE_STATUS" = "200" ]; then
    echo "✅ Voice API working (4 points)"
    ((API_POINTS += 4))
else
    echo "❌ Voice API not working (0 points)"
fi

# Analytics endpoint
ANALYTICS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:8000/api/analytics/track/page" \
    -H "Content-Type: application/json" \
    -d '{"visitor_id":"test_mobile_user","page":"mobile_test","user_agent":"Mobile Test"}')
if [ "$ANALYTICS_STATUS" = "200" ]; then
    echo "✅ Analytics API working (3 points)"
    ((API_POINTS += 3))
else
    echo "❌ Analytics API not working (0 points)"
fi

TOTAL_POINTS=$((TOTAL_POINTS + API_POINTS))
MAX_POINTS=$((MAX_POINTS + 10))
echo "📊 API Integration Score: $API_POINTS/10"

# Test 6: Build Quality (10 points)
echo ""
echo "🔧 Testing Build Quality (10 points)..."
BUILD_POINTS=0

cd frontend
npm run build > /tmp/build.log 2>&1
BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "✅ Frontend builds without errors (5 points)"
    ((BUILD_POINTS += 5))
    
    # Check for optimization warnings
    WARNING_COUNT=$(grep -i "warning" /tmp/build.log | wc -l)
    if [ $WARNING_COUNT -eq 0 ]; then
        echo "✅ No build warnings (3 points)"
        ((BUILD_POINTS += 3))
    else
        echo "⚠️ $WARNING_COUNT build warnings (1 point)"
        ((BUILD_POINTS += 1))
    fi
    
    # Check bundle size
    if [ -d "dist" ]; then
        echo "✅ Build artifacts generated (2 points)"
        ((BUILD_POINTS += 2))
    else
        echo "❌ Build artifacts missing (0 points)"
    fi
else
    echo "❌ Frontend build has errors (0 points)"
    tail -5 /tmp/build.log
fi

cd ..

TOTAL_POINTS=$((TOTAL_POINTS + BUILD_POINTS))
MAX_POINTS=$((MAX_POINTS + 10))
echo "📊 Build Quality Score: $BUILD_POINTS/10"

# Test 7: Advanced Features (10 points)
echo ""
echo "🎯 Testing Advanced Mobile Features (10 points)..."
ADVANCED_POINTS=0

# Check for premium test script
if [ -f "frontend/scripts/premiumMobileTests.js" ]; then
    echo "✅ Premium test suite present (3 points)"
    ((ADVANCED_POINTS += 3))
else
    echo "❌ Premium test suite missing (0 points)"
fi

# Check for mobile debugger
if [ -f "frontend/scripts/mobileDebugger.js" ]; then
    echo "✅ Mobile debugger present (2 points)"
    ((ADVANCED_POINTS += 2))
else
    echo "❌ Mobile debugger missing (0 points)"
fi

# Check for enhanced imports in App.jsx
if grep -q "advancedTouchGestures" frontend/src/App.jsx; then
    echo "✅ Advanced utilities integrated in App (3 points)"
    ((ADVANCED_POINTS += 3))
else
    echo "❌ Advanced utilities not integrated (0 points)"
fi

# Check for premium mobile CSS classes
if grep -q "perf-battery-saver\|perf-high-performance" frontend/src/index.css; then
    echo "✅ Performance adaptation CSS present (2 points)"
    ((ADVANCED_POINTS += 2))
else
    echo "❌ Performance adaptation CSS missing (0 points)"
fi

TOTAL_POINTS=$((TOTAL_POINTS + ADVANCED_POINTS))
MAX_POINTS=$((MAX_POINTS + 10))
echo "📊 Advanced Features Score: $ADVANCED_POINTS/10"

# Test 8: Accessibility Excellence (10 points)
echo ""
echo "♿ Testing Accessibility Excellence (10 points)..."
A11Y_POINTS=0

# Check accessibility CSS
if grep -q "reduced-motion\|high-contrast\|large-text" frontend/src/utils/mobileAccessibilityManager.js; then
    echo "✅ Advanced accessibility features present (4 points)"
    ((A11Y_POINTS += 4))
else
    echo "❌ Advanced accessibility features missing (0 points)"
fi

# Check ARIA enhancements
if grep -q "aria-live\|accessibility-announcements" frontend/src/utils/mobileAccessibilityManager.js; then
    echo "✅ Screen reader support present (3 points)"
    ((A11Y_POINTS += 3))
else
    echo "❌ Screen reader support missing (0 points)"
fi

# Check focus management
if grep -q "focus\|skip-link" frontend/src/utils/mobileAccessibilityManager.js; then
    echo "✅ Focus management present (3 points)"
    ((A11Y_POINTS += 3))
else
    echo "❌ Focus management missing (0 points)"
fi

TOTAL_POINTS=$((TOTAL_POINTS + A11Y_POINTS))
MAX_POINTS=$((MAX_POINTS + 10))
echo "📊 Accessibility Score: $A11Y_POINTS/10"

# Final Score Calculation
echo ""
echo "🏆 FINAL 100% MOBILE SCORE RESULTS"
echo "=================================="

FINAL_SCORE=$(( (TOTAL_POINTS * 100) / MAX_POINTS ))

echo "📊 Component Breakdown:"
echo "   🌐 Infrastructure: $INFRA_POINTS/10"
echo "   📱 Mobile Design: $DESIGN_POINTS/15"
echo "   🧩 Components: $COMPONENT_POINTS/20"
echo "   🛠️ Premium Utils: $UTILS_POINTS/15"
echo "   🌐 API Integration: $API_POINTS/10"
echo "   🔧 Build Quality: $BUILD_POINTS/10"
echo "   🎯 Advanced Features: $ADVANCED_POINTS/10"
echo "   ♿ Accessibility: $A11Y_POINTS/10"

echo ""
echo "🎯 TOTAL SCORE: $FINAL_SCORE% ($TOTAL_POINTS/$MAX_POINTS points)"

if [ $FINAL_SCORE -eq 100 ]; then
    echo "🏆 PERFECT 100% MOBILE SCORE ACHIEVED!"
    echo "🎉 Premium mobile experience with all features!"
    echo "⭐ Excellence in mobile development!"
elif [ $FINAL_SCORE -ge 95 ]; then
    echo "🥇 EXCELLENT! Almost perfect mobile score!"
    echo "💎 Premium mobile experience!"
elif [ $FINAL_SCORE -ge 90 ]; then
    echo "🥈 OUTSTANDING mobile implementation!"
    echo "👑 High-quality mobile experience!"
elif [ $FINAL_SCORE -ge 80 ]; then
    echo "🥉 GREAT mobile score!"
    echo "👍 Solid mobile implementation!"
elif [ $FINAL_SCORE -ge 70 ]; then
    echo "✅ GOOD mobile score with room for improvement"
    echo "📈 On track for excellence!"
else
    echo "⚠️ Mobile implementation needs improvement"
    echo "💪 Keep working toward 100%!"
fi

echo ""
echo "💡 RECOMMENDATIONS FOR 100%:"

if [ $INFRA_POINTS -lt 10 ]; then
    echo "   🌐 Ensure both frontend and backend servers are running"
fi

if [ $DESIGN_POINTS -lt 15 ]; then
    echo "   📱 Add comprehensive mobile CSS and PWA features"
fi

if [ $COMPONENT_POINTS -lt 20 ]; then
    echo "   🧩 Implement all advanced mobile components"
fi

if [ $UTILS_POINTS -lt 15 ]; then
    echo "   🛠️ Add premium mobile utilities (gestures, device management, accessibility)"
fi

if [ $API_POINTS -lt 10 ]; then
    echo "   🌐 Fix API endpoints and ensure proper responses"
fi

if [ $BUILD_POINTS -lt 10 ]; then
    echo "   🔧 Fix build errors and optimize bundle"
fi

if [ $ADVANCED_POINTS -lt 10 ]; then
    echo "   🎯 Integrate advanced features and performance optimizations"
fi

if [ $A11Y_POINTS -lt 10 ]; then
    echo "   ♿ Implement comprehensive accessibility features"
fi

echo ""
echo "🚀 Mobile experience ready for testing at: http://localhost:5173"
echo "📱 Test on mobile devices and use browser DevTools device simulation"
echo "🔧 Add ?debug=mobile to URL for advanced debugging"

exit $((100 - FINAL_SCORE))
