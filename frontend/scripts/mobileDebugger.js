/**
 * Mobile Debug Utility
 * Provides real-time mobile view debugging information
 */

class MobileDebugger {
  constructor() {
    this.isEnabled = window.location.search.includes('debug=mobile');
    this.debugPanel = null;
    this.init();
  }

  init() {
    if (!this.isEnabled) return;
    
    this.createDebugPanel();
    this.startMonitoring();
    console.log('📱 Mobile debugger enabled. Add ?debug=mobile to URL to activate visual panel.');
  }

  createDebugPanel() {
    // Create debug panel
    this.debugPanel = document.createElement('div');
    this.debugPanel.id = 'mobile-debug-panel';
    this.debugPanel.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        right: 0;
        width: 300px;
        height: 100vh;
        background: rgba(0,0,0,0.9);
        color: white;
        font-family: monospace;
        font-size: 12px;
        z-index: 10000;
        overflow-y: auto;
        padding: 10px;
        box-sizing: border-box;
        transform: translateX(100%);
        transition: transform 0.3s ease;
      " data-debug-panel>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 style="margin: 0; color: #00ff00;">📱 Mobile Debug</h3>
          <button onclick="this.parentElement.parentElement.parentElement.style.transform='translateX(100%)'" 
                  style="background: #ff0000; color: white; border: none; padding: 5px 10px; cursor: pointer;">×</button>
        </div>
        <div id="debug-info"></div>
        <div style="margin-top: 15px;">
          <button onclick="window.mobileDebugger.runTests()" 
                  style="background: #007acc; color: white; border: none; padding: 8px 12px; cursor: pointer; width: 100%;">
            Run Mobile Tests
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.debugPanel);

    // Add toggle button
    const toggleButton = document.createElement('button');
    toggleButton.innerHTML = '📱';
    toggleButton.style.cssText = `
      position: fixed;
      top: 50%;
      right: 0;
      width: 40px;
      height: 40px;
      background: #007acc;
      color: white;
      border: none;
      z-index: 10001;
      cursor: pointer;
      font-size: 18px;
      border-radius: 20px 0 0 20px;
    `;
    
    toggleButton.onclick = () => {
      const panel = this.debugPanel.querySelector('[data-debug-panel]');
      const isVisible = panel.style.transform === 'translateX(0px)';
      panel.style.transform = isVisible ? 'translateX(100%)' : 'translateX(0px)';
    };

    document.body.appendChild(toggleButton);
  }

  startMonitoring() {
    if (!this.isEnabled) return;

    setInterval(() => {
      this.updateDebugInfo();
    }, 1000);

    // Monitor for viewport changes
    window.addEventListener('resize', () => {
      this.updateDebugInfo();
    });

    // Monitor for orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.updateDebugInfo(), 500);
    });
  }

  updateDebugInfo() {
    if (!this.debugPanel) return;

    const debugInfo = this.debugPanel.querySelector('#debug-info');
    if (!debugInfo) return;

    const info = {
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      screen: `${screen.width}x${screen.height}`,
      ratio: window.devicePixelRatio || 1,
      orientation: screen.orientation?.angle || window.orientation || 'unknown',
      userAgent: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
      touch: 'ontouchstart' in window ? 'Yes' : 'No',
      online: navigator.onLine ? 'Yes' : 'No',
      battery: 'getBattery' in navigator ? 'Available' : 'No',
      vibrate: 'vibrate' in navigator ? 'Yes' : 'No',
      safeArea: this.getSafeAreaInfo()
    };

    debugInfo.innerHTML = Object.entries(info)
      .map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`)
      .join('');
  }

  getSafeAreaInfo() {
    const style = getComputedStyle(document.documentElement);
    const top = style.getPropertyValue('--safe-area-inset-top') || 'undefined';
    const bottom = style.getPropertyValue('--safe-area-inset-bottom') || 'undefined';
    
    return `T:${top} B:${bottom}`;
  }

  runTests() {
    if (window.mobileTests) {
      window.mobileTests.runAll();
    } else {
      console.warn('Mobile test suite not loaded');
    }
  }

  // Utility methods for manual debugging
  highlightTouchTargets() {
    const style = document.createElement('style');
    style.textContent = `
      button, a[role="button"], input[type="submit"], input[type="button"] {
        outline: 2px solid red !important;
        outline-offset: 2px !important;
      }
      button:after, a[role="button"]:after, input[type="submit"]:after, input[type="button"]:after {
        content: attr(data-size) !important;
        position: absolute !important;
        background: red !important;
        color: white !important;
        font-size: 10px !important;
        padding: 2px !important;
        z-index: 9999 !important;
      }
    `;
    document.head.appendChild(style);

    // Add size info to elements
    const targets = document.querySelectorAll('button, a[role="button"], input[type="submit"], input[type="button"]');
    targets.forEach(el => {
      const rect = el.getBoundingClientRect();
      el.setAttribute('data-size', `${Math.round(rect.width)}x${Math.round(rect.height)}`);
    });

    console.log('🎯 Touch targets highlighted in red');
  }

  simulateTouch() {
    // Add touch simulation for desktop testing
    const style = document.createElement('style');
    style.textContent = `
      * {
        cursor: none !important;
      }
      body {
        touch-action: manipulation !important;
      }
    `;
    document.head.appendChild(style);

    console.log('👆 Touch simulation enabled');
  }

  checkPerformance() {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0];
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      const domReady = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      
      console.log('⚡ Performance Check:');
      console.log(`  Load time: ${loadTime}ms`);
      console.log(`  DOM ready: ${domReady}ms`);
      console.log(`  First contentful paint: ${performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 'N/A'}ms`);
      
      return {
        loadTime,
        domReady,
        fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    }
    
    return null;
  }
}

// Auto-initialize
window.mobileDebugger = new MobileDebugger();

// Add to console for manual access
console.log('📱 Mobile Debugger loaded!');
console.log('Available commands:');
console.log('  mobileDebugger.highlightTouchTargets() - Highlight all touch targets');
console.log('  mobileDebugger.simulateTouch() - Simulate touch device');
console.log('  mobileDebugger.checkPerformance() - Check load performance');
console.log('  mobileDebugger.runTests() - Run mobile test suite');

export default MobileDebugger;
