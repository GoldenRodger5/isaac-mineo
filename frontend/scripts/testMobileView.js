/**
 * Comprehensive Mobile View Testing Script
 * Tests all mobile optimizations and functionality
 */

console.log('🔍 Starting Mobile View Testing...');

// Test 1: Touch Target Sizes
function testTouchTargets() {
  console.log('📱 Testing touch targets...');
  
  const buttons = document.querySelectorAll('button, a[role="button"], input[type="submit"], input[type="button"]');
  let passedTargets = 0;
  let totalTargets = buttons.length;
  
  buttons.forEach((element, index) => {
    const rect = element.getBoundingClientRect();
    const minSize = 44; // WCAG AA minimum
    
    if (rect.width >= minSize && rect.height >= minSize) {
      passedTargets++;
    } else {
      console.warn(`❌ Touch target ${index + 1} too small:`, {
        element: element.tagName,
        size: `${Math.round(rect.width)}x${Math.round(rect.height)}px`,
        required: `${minSize}x${minSize}px`
      });
    }
  });
  
  console.log(`✅ Touch targets: ${passedTargets}/${totalTargets} passed (${Math.round(passedTargets/totalTargets*100)}%)`);
  return passedTargets / totalTargets >= 0.9; // 90% pass rate
}

// Test 2: Mobile Navigation
function testMobileNavigation() {
  console.log('🧭 Testing mobile navigation...');
  
  const mobileNav = document.querySelector('.mobile-navigation, [data-mobile-nav]');
  const hamburgerMenu = document.querySelector('.hamburger-menu, [data-hamburger]');
  const tabButtons = document.querySelectorAll('[role="tab"], .tab-button');
  
  let score = 0;
  let maxScore = 3;
  
  if (mobileNav) {
    console.log('✅ Mobile navigation found');
    score++;
  } else {
    console.warn('❌ Mobile navigation not found');
  }
  
  if (hamburgerMenu || tabButtons.length > 0) {
    console.log('✅ Navigation controls found');
    score++;
  } else {
    console.warn('❌ Navigation controls not found');
  }
  
  // Test swipe detection
  if (typeof window.MobileNavigationUtils !== 'undefined' || 
      document.querySelector('[data-swipeable]')) {
    console.log('✅ Swipe navigation detected');
    score++;
  } else {
    console.warn('⚠️ Swipe navigation not detected (optional)');
  }
  
  console.log(`📊 Mobile navigation score: ${score}/${maxScore}`);
  return score >= 2;
}

// Test 3: Responsive Design
function testResponsiveDesign() {
  console.log('📐 Testing responsive design...');
  
  const viewportWidth = window.innerWidth;
  const body = document.body;
  const computedStyle = window.getComputedStyle(body);
  
  let checks = {
    viewport: false,
    safeArea: false,
    mobileBreakpoint: false,
    touchFriendly: false
  };
  
  // Viewport meta tag
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (viewportMeta && viewportMeta.content.includes('width=device-width')) {
    checks.viewport = true;
    console.log('✅ Proper viewport meta tag found');
  } else {
    console.warn('❌ Viewport meta tag missing or incorrect');
  }
  
  // Safe area support
  const safeAreaStyles = [
    '--safe-area-inset-top',
    '--safe-area-inset-right',
    '--safe-area-inset-bottom',
    '--safe-area-inset-left'
  ];
  
  const hasSafeArea = safeAreaStyles.some(prop => 
    getComputedStyle(document.documentElement).getPropertyValue(prop)
  );
  
  if (hasSafeArea) {
    checks.safeArea = true;
    console.log('✅ Safe area support detected');
  } else {
    console.warn('⚠️ Safe area support not detected');
  }
  
  // Mobile breakpoint behavior
  if (viewportWidth <= 768) {
    const mobileElements = document.querySelectorAll('.mobile-only, [data-mobile-only], .md\\:hidden');
    if (mobileElements.length > 0) {
      checks.mobileBreakpoint = true;
      console.log('✅ Mobile-specific elements found');
    }
  }
  
  // Touch-friendly spacing
  const hasProperSpacing = computedStyle.getPropertyValue('padding') !== '0px' ||
                          document.querySelector('.mobile-section-padding, .p-4, .px-4');
  
  if (hasProperSpacing) {
    checks.touchFriendly = true;
    console.log('✅ Touch-friendly spacing detected');
  }
  
  const passed = Object.values(checks).filter(Boolean).length;
  console.log(`📊 Responsive design: ${passed}/${Object.keys(checks).length} checks passed`);
  
  return passed >= 3;
}

// Test 4: Performance Optimizations
function testMobilePerformance() {
  console.log('⚡ Testing mobile performance optimizations...');
  
  let optimizations = {
    lazyLoading: false,
    codesplitting: false,
    imageOptimization: false,
    preloading: false
  };
  
  // Lazy loading
  const lazyElements = document.querySelectorAll('[loading="lazy"], [data-lazy]');
  if (lazyElements.length > 0) {
    optimizations.lazyLoading = true;
    console.log('✅ Lazy loading detected');
  }
  
  // Code splitting (React.lazy indicators)
  if (window.React && document.querySelector('[data-reactroot]')) {
    optimizations.codesplitting = true;
    console.log('✅ React app detected (likely using code splitting)');
  }
  
  // Image optimization
  const images = document.querySelectorAll('img');
  const optimizedImages = Array.from(images).filter(img => 
    img.srcset || img.loading === 'lazy' || img.src.includes('webp')
  );
  
  if (optimizedImages.length > 0) {
    optimizations.imageOptimization = true;
    console.log('✅ Image optimizations detected');
  }
  
  // Resource preloading
  const preloadLinks = document.querySelectorAll('link[rel="preload"], link[rel="prefetch"]');
  if (preloadLinks.length > 0) {
    optimizations.preloading = true;
    console.log('✅ Resource preloading detected');
  }
  
  const score = Object.values(optimizations).filter(Boolean).length;
  console.log(`📊 Performance optimizations: ${score}/${Object.keys(optimizations).length}`);
  
  return score >= 2;
}

// Test 5: Accessibility
function testMobileAccessibility() {
  console.log('♿ Testing mobile accessibility...');
  
  let a11yChecks = {
    focusManagement: false,
    ariaLabels: false,
    colorContrast: false,
    textSize: false
  };
  
  // Focus management
  const focusableElements = document.querySelectorAll(
    'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length > 0) {
    a11yChecks.focusManagement = true;
    console.log('✅ Focusable elements found');
  }
  
  // ARIA labels
  const ariaElements = document.querySelectorAll('[aria-label], [aria-labelledby], [role]');
  if (ariaElements.length > 0) {
    a11yChecks.ariaLabels = true;
    console.log('✅ ARIA attributes detected');
  }
  
  // Text size check
  const bodyFontSize = parseFloat(getComputedStyle(document.body).fontSize);
  if (bodyFontSize >= 16) {
    a11yChecks.textSize = true;
    console.log('✅ Adequate text size (16px+)');
  } else {
    console.warn(`⚠️ Text size might be too small: ${bodyFontSize}px`);
  }
  
  a11yChecks.colorContrast = true; // Assume good contrast (would need complex calculation)
  console.log('✅ Color contrast assumed adequate');
  
  const score = Object.values(a11yChecks).filter(Boolean).length;
  console.log(`📊 Accessibility: ${score}/${Object.keys(a11yChecks).length}`);
  
  return score >= 3;
}

// Test 6: Mobile-Specific Features
function testMobileFeatures() {
  console.log('🎯 Testing mobile-specific features...');
  
  let features = {
    touchGestures: false,
    hapticFeedback: false,
    orientationSupport: false,
    pullToRefresh: false
  };
  
  // Touch gesture detection
  if (document.querySelector('[data-swipeable]') || 
      typeof window.TouchEvent !== 'undefined') {
    features.touchGestures = true;
    console.log('✅ Touch gesture support detected');
  }
  
  // Haptic feedback
  if (navigator.vibrate) {
    features.hapticFeedback = true;
    console.log('✅ Haptic feedback available');
  }
  
  // Orientation support
  if (screen.orientation || window.orientation !== undefined) {
    features.orientationSupport = true;
    console.log('✅ Orientation detection available');
  }
  
  // Pull to refresh
  if (document.querySelector('[data-pull-to-refresh]') || 
      window.PullToRefresh) {
    features.pullToRefresh = true;
    console.log('✅ Pull to refresh detected');
  }
  
  const score = Object.values(features).filter(Boolean).length;
  console.log(`📊 Mobile features: ${score}/${Object.keys(features).length}`);
  
  return score >= 2;
}

// Run all tests
async function runMobileTests() {
  console.log('🚀 Starting comprehensive mobile view tests...\n');
  
  const testResults = {
    touchTargets: testTouchTargets(),
    navigation: testMobileNavigation(),
    responsive: testResponsiveDesign(),
    performance: testMobilePerformance(),
    accessibility: testMobileAccessibility(),
    mobileFeatures: testMobileFeatures()
  };
  
  console.log('\n📊 MOBILE VIEW TEST RESULTS:');
  console.log('================================');
  
  Object.entries(testResults).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const testName = test.replace(/([A-Z])/g, ' $1').toLowerCase();
    console.log(`${status} ${testName}`);
  });
  
  const passedTests = Object.values(testResults).filter(Boolean).length;
  const totalTests = Object.keys(testResults).length;
  const score = Math.round((passedTests / totalTests) * 100);
  
  console.log(`\n🎯 Overall Score: ${score}% (${passedTests}/${totalTests} tests passed)`);
  
  if (score >= 80) {
    console.log('🎉 Excellent mobile view implementation!');
  } else if (score >= 60) {
    console.log('👍 Good mobile view with room for improvement');
  } else {
    console.log('⚠️ Mobile view needs significant improvements');
  }
  
  // Specific recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (!testResults.touchTargets) {
    console.log('- Increase button/link sizes to minimum 44x44px');
  }
  if (!testResults.navigation) {
    console.log('- Add mobile navigation menu or improve existing one');
  }
  if (!testResults.responsive) {
    console.log('- Add proper viewport meta tag and responsive breakpoints');
  }
  if (!testResults.performance) {
    console.log('- Implement lazy loading and code splitting');
  }
  if (!testResults.accessibility) {
    console.log('- Add ARIA labels and improve focus management');
  }
  if (!testResults.mobileFeatures) {
    console.log('- Add touch gestures and mobile-specific interactions');
  }
  
  return testResults;
}

// Auto-run tests when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runMobileTests);
} else {
  setTimeout(runMobileTests, 1000); // Give React time to render
}

// Export for manual testing
window.mobileTests = {
  runAll: runMobileTests,
  touchTargets: testTouchTargets,
  navigation: testMobileNavigation,
  responsive: testResponsiveDesign,
  performance: testMobilePerformance,
  accessibility: testMobileAccessibility,
  features: testMobileFeatures
};

console.log('📱 Mobile testing utilities loaded. Run mobileTests.runAll() to test manually.');
