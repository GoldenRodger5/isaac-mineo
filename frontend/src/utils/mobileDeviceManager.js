/**
 * Advanced Mobile Device Integration
 * Battery, Network, and Hardware Status for Premium Mobile Experience
 */

class MobileDeviceManager {
  constructor() {
    this.batteryInfo = null;
    this.networkInfo = null;
    this.deviceCapabilities = {};
    this.performanceProfile = 'auto';
    
    this.init();
  }

  async init() {
    await this.initBatteryAPI();
    this.initNetworkAPI();
    this.initDeviceCapabilities();
    this.initPerformanceAdaptation();
    
    console.log('🔋 Advanced device management initialized');
  }

  // Battery API Integration
  async initBatteryAPI() {
    if ('getBattery' in navigator) {
      try {
        this.batteryInfo = await navigator.getBattery();
        
        // Monitor battery events
        this.batteryInfo.addEventListener('chargingchange', this.onBatteryChange.bind(this));
        this.batteryInfo.addEventListener('levelchange', this.onBatteryChange.bind(this));
        
        this.onBatteryChange();
        console.log('✅ Battery API connected');
      } catch (error) {
        console.warn('Battery API not available:', error);
      }
    }
  }

  onBatteryChange() {
    if (!this.batteryInfo) return;
    
    const batteryLevel = Math.round(this.batteryInfo.level * 100);
    const isCharging = this.batteryInfo.charging;
    const chargingTime = this.batteryInfo.chargingTime;
    const dischargingTime = this.batteryInfo.dischargingTime;

    // Adaptive performance based on battery
    if (batteryLevel < 20 && !isCharging) {
      this.setPerformanceProfile('battery-saver');
    } else if (batteryLevel > 80 || isCharging) {
      this.setPerformanceProfile('high-performance');
    } else {
      this.setPerformanceProfile('balanced');
    }

    // Dispatch battery status event
    this.dispatchDeviceEvent('battery:change', {
      level: batteryLevel,
      charging: isCharging,
      chargingTime,
      dischargingTime
    });

    console.log(`🔋 Battery: ${batteryLevel}% ${isCharging ? '(charging)' : ''}`);
  }

  // Network Information API
  initNetworkAPI() {
    if ('connection' in navigator || 'mozConnection' in navigator || 'webkitConnection' in navigator) {
      this.networkInfo = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      this.networkInfo.addEventListener('change', this.onNetworkChange.bind(this));
      this.onNetworkChange();
      
      console.log('✅ Network API connected');
    }

    // Online/offline events
    window.addEventListener('online', () => this.onNetworkChange(true));
    window.addEventListener('offline', () => this.onNetworkChange(false));
  }

  onNetworkChange(forceOnline = null) {
    const isOnline = forceOnline !== null ? forceOnline : navigator.onLine;
    
    let networkData = { online: isOnline };
    
    if (this.networkInfo) {
      networkData = {
        ...networkData,
        type: this.networkInfo.effectiveType || this.networkInfo.type,
        speed: this.networkInfo.downlink,
        rtt: this.networkInfo.rtt,
        saveData: this.networkInfo.saveData
      };

      // Adaptive loading based on connection
      if (this.networkInfo.saveData || this.networkInfo.effectiveType === 'slow-2g') {
        this.setDataSavingMode(true);
      } else if (this.networkInfo.effectiveType === '4g') {
        this.setDataSavingMode(false);
      }
    }

    this.dispatchDeviceEvent('network:change', networkData);
    console.log('📶 Network:', networkData);
  }

  // Device Capabilities Detection
  initDeviceCapabilities() {
    this.deviceCapabilities = {
      // Touch capabilities
      touchPoints: navigator.maxTouchPoints || 0,
      multiTouch: 'createTouch' in document || navigator.maxTouchPoints > 1,
      
      // Hardware features
      vibration: 'vibrate' in navigator,
      geolocation: 'geolocation' in navigator,
      deviceMotion: 'DeviceMotionEvent' in window,
      deviceOrientation: 'DeviceOrientationEvent' in window,
      
      // Media capabilities
      camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      microphone: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      
      // Storage
      localStorage: 'localStorage' in window,
      indexedDB: 'indexedDB' in window,
      
      // Performance
      hardwareConcurrency: navigator.hardwareConcurrency || 1,
      deviceMemory: navigator.deviceMemory || 'unknown',
      
      // Display
      screenSize: `${screen.width}x${screen.height}`,
      pixelRatio: window.devicePixelRatio || 1,
      colorDepth: screen.colorDepth,
      
      // PWA features
      serviceWorker: 'serviceWorker' in navigator,
      pushNotifications: 'PushManager' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype
    };

    console.log('📱 Device capabilities:', this.deviceCapabilities);
    
    this.dispatchDeviceEvent('capabilities:detected', this.deviceCapabilities);
  }

  // Performance Adaptation
  initPerformanceAdaptation() {
    // Monitor performance
    if ('performance' in window && 'observer' in window.PerformanceObserver.prototype) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'measure' && entry.duration > 100) {
            console.warn(`⚠️ Slow operation detected: ${entry.name} (${entry.duration}ms)`);
            this.adaptToPerformance(entry);
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
      } catch (error) {
        console.warn('Performance observer not fully supported');
      }
    }

    // CPU/Memory monitoring
    this.startResourceMonitoring();
  }

  setPerformanceProfile(profile) {
    if (this.performanceProfile === profile) return;
    
    this.performanceProfile = profile;
    
    const profiles = {
      'battery-saver': {
        animations: 'reduced',
        imageQuality: 'low',
        backgroundSync: false,
        hapticFeedback: false
      },
      'balanced': {
        animations: 'normal',
        imageQuality: 'medium',
        backgroundSync: true,
        hapticFeedback: true
      },
      'high-performance': {
        animations: 'enhanced',
        imageQuality: 'high',
        backgroundSync: true,
        hapticFeedback: true
      }
    };

    const settings = profiles[profile];
    this.applyPerformanceSettings(settings);
    
    this.dispatchDeviceEvent('performance:profile', { profile, settings });
    console.log(`⚡ Performance profile: ${profile}`);
  }

  applyPerformanceSettings(settings) {
    // Apply CSS classes for performance adaptation
    const body = document.body;
    
    // Remove existing performance classes
    body.classList.remove('perf-battery-saver', 'perf-balanced', 'perf-high-performance');
    body.classList.add(`perf-${this.performanceProfile.replace('-', '-')}`);
    
    // Update CSS custom properties
    document.documentElement.style.setProperty('--animation-speed', 
      settings.animations === 'reduced' ? '0.1s' : 
      settings.animations === 'enhanced' ? '0.4s' : '0.2s'
    );
    
    // Update image loading strategy
    this.updateImageStrategy(settings.imageQuality);
    
    // Update haptic feedback
    if (window.advancedTouchGestures) {
      window.advancedTouchGestures.hapticEnabled = settings.hapticFeedback;
    }
  }

  setDataSavingMode(enabled) {
    document.documentElement.classList.toggle('data-saving', enabled);
    
    if (enabled) {
      // Disable auto-playing videos
      const videos = document.querySelectorAll('video[autoplay]');
      videos.forEach(video => {
        video.removeAttribute('autoplay');
        video.pause();
      });
      
      // Reduce image quality
      this.updateImageStrategy('low');
    }
    
    console.log(`💾 Data saving mode: ${enabled ? 'enabled' : 'disabled'}`);
  }

  updateImageStrategy(quality) {
    const images = document.querySelectorAll('img[data-adaptive]');
    
    images.forEach(img => {
      const baseSrc = img.dataset.src || img.src;
      
      if (quality === 'low') {
        img.src = baseSrc.replace(/\.(jpg|jpeg|png)$/i, '_low.$1');
      } else if (quality === 'high') {
        img.src = baseSrc.replace(/_low\.(jpg|jpeg|png)$/i, '_high.$1');
      } else {
        img.src = baseSrc.replace(/_(low|high)\.(jpg|jpeg|png)$/i, '.$2');
      }
    });
  }

  startResourceMonitoring() {
    setInterval(() => {
      if ('memory' in performance) {
        const memory = performance.memory;
        const memoryUsage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
        
        if (memoryUsage > 80) {
          console.warn('⚠️ High memory usage detected');
          this.setPerformanceProfile('battery-saver');
        }
      }
    }, 10000); // Check every 10 seconds
  }

  adaptToPerformance(entry) {
    if (entry.duration > 500) {
      // Very slow operation - switch to battery saver
      this.setPerformanceProfile('battery-saver');
    } else if (entry.duration > 200) {
      // Moderately slow - switch to balanced
      this.setPerformanceProfile('balanced');
    }
  }

  dispatchDeviceEvent(type, data) {
    const event = new CustomEvent(`device:${type}`, {
      detail: data,
      bubbles: true
    });
    document.dispatchEvent(event);
  }

  // Public API methods
  getBatteryInfo() {
    if (!this.batteryInfo) return null;
    
    return {
      level: Math.round(this.batteryInfo.level * 100),
      charging: this.batteryInfo.charging,
      chargingTime: this.batteryInfo.chargingTime,
      dischargingTime: this.batteryInfo.dischargingTime
    };
  }

  getNetworkInfo() {
    return {
      online: navigator.onLine,
      type: this.networkInfo?.effectiveType || 'unknown',
      speed: this.networkInfo?.downlink || 0,
      rtt: this.networkInfo?.rtt || 0,
      saveData: this.networkInfo?.saveData || false
    };
  }

  getDeviceCapabilities() {
    return { ...this.deviceCapabilities };
  }

  getCurrentProfile() {
    return this.performanceProfile;
  }
}

// Initialize device manager
window.mobileDeviceManager = new MobileDeviceManager();

// Add CSS for performance profiles
const performanceStyles = document.createElement('style');
performanceStyles.textContent = `
  .perf-battery-saver * {
    animation-duration: 0.1s !important;
    transition-duration: 0.1s !important;
  }
  
  .perf-battery-saver .animation-disabled {
    animation: none !important;
    transition: none !important;
  }
  
  .perf-high-performance .enhanced-animations {
    animation-duration: 0.4s;
    transition-duration: 0.4s;
  }
  
  .data-saving img {
    filter: contrast(0.9) brightness(0.9);
  }
  
  .data-saving video {
    display: none;
  }
  
  .data-saving .lazy-load {
    background-color: #f0f0f0;
  }
`;

document.head.appendChild(performanceStyles);

console.log('🚀 Advanced mobile device management loaded');

export default MobileDeviceManager;
