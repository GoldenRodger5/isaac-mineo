import React, { useState, useRef, useEffect } from 'react';

/**
 * Mobile Performance Optimization Hook
 * Features: Battery status, network detection, performance monitoring
 */
export const useMobilePerformance = () => {
  const [batteryStatus, setBatteryStatus] = useState({
    level: 1,
    charging: true,
    dischargingTime: Infinity,
    chargingTime: Infinity
  });
  
  const [networkStatus, setNetworkStatus] = useState({
    online: navigator.onLine,
    connection: null,
    effectiveType: '4g',
    downlink: 10,
    rtt: 50
  });
  
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 60,
    memoryUsage: 0,
    loadTime: 0
  });

  // Battery API monitoring
  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        const updateBatteryInfo = () => {
          setBatteryStatus({
            level: battery.level,
            charging: battery.charging,
            dischargingTime: battery.dischargingTime,
            chargingTime: battery.chargingTime
          });
        };

        updateBatteryInfo();
        battery.addEventListener('levelchange', updateBatteryInfo);
        battery.addEventListener('chargingchange', updateBatteryInfo);
        
        return () => {
          battery.removeEventListener('levelchange', updateBatteryInfo);
          battery.removeEventListener('chargingchange', updateBatteryInfo);
        };
      });
    }
  }, []);

  // Network monitoring
  useEffect(() => {
    const updateNetworkStatus = () => {
      setNetworkStatus({
        online: navigator.onLine,
        connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection,
        effectiveType: navigator.connection?.effectiveType || '4g',
        downlink: navigator.connection?.downlink || 10,
        rtt: navigator.connection?.rtt || 50
      });
    };

    updateNetworkStatus();
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    if (navigator.connection) {
      navigator.connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  // Performance monitoring
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setPerformanceMetrics(prev => ({ ...prev, fps }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    measureFPS();

    // Memory usage (if available)
    if ('memory' in performance) {
      const updateMemory = () => {
        setPerformanceMetrics(prev => ({
          ...prev,
          memoryUsage: performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit
        }));
      };
      
      const memoryInterval = setInterval(updateMemory, 5000);
      return () => {
        clearInterval(memoryInterval);
        cancelAnimationFrame(animationId);
      };
    }

    return () => cancelAnimationFrame(animationId);
  }, []);

  // Adaptive performance settings
  const getOptimalSettings = () => {
    const isLowBattery = batteryStatus.level < 0.2 && !batteryStatus.charging;
    const isSlowNetwork = networkStatus.effectiveType === 'slow-2g' || networkStatus.effectiveType === '2g';
    const isLowPerformance = performanceMetrics.fps < 45 || performanceMetrics.memoryUsage > 0.8;

    return {
      reduceAnimations: isLowBattery || isLowPerformance,
      optimizeImages: isSlowNetwork,
      limitParallelRequests: isSlowNetwork,
      enableDataSaver: isSlowNetwork || isLowBattery,
      reducePollling: isLowBattery,
      lowQualityMode: isLowPerformance || isSlowNetwork
    };
  };

  return {
    batteryStatus,
    networkStatus,
    performanceMetrics,
    optimalSettings: getOptimalSettings()
  };
};

/**
 * Intelligent Image Component with Performance Optimization
 */
export const OptimizedImage = ({
  src,
  alt,
  className = '',
  lazy = true,
  quality = 'auto',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(null);
  const imgRef = useRef(null);
  const { optimalSettings } = useMobilePerformance();

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy) {
      setCurrentSrc(src);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setCurrentSrc(src);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, lazy]);

  // Optimize image source based on network conditions
  const getOptimizedSrc = (originalSrc) => {
    if (!originalSrc) return null;

    const { optimizeImages, lowQualityMode } = optimalSettings;
    
    if (optimizeImages || lowQualityMode) {
      // Add image optimization parameters (assuming a service like Cloudinary)
      const separator = originalSrc.includes('?') ? '&' : '?';
      const qualityParam = lowQualityMode ? 'q_30,f_auto' : 'q_70,f_auto';
      return `${originalSrc}${separator}${qualityParam}`;
    }
    
    return originalSrc;
  };

  return (
    <div className={`relative overflow-hidden ${className}`} ref={imgRef}>
      {/* Placeholder/skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      {/* Actual image */}
      {currentSrc && !error && (
        <img
          src={getOptimizedSrc(currentSrc)}
          alt={alt}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
          loading={lazy ? 'lazy' : 'eager'}
          {...props}
        />
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-gray-500">Image failed to load</p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Performance-Conscious Animation Component
 */
export const SmartAnimation = ({
  children,
  animation = 'fadeIn',
  duration = 300,
  delay = 0,
  className = '',
  trigger = true
}) => {
  const { optimalSettings } = useMobilePerformance();
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  // Respect user's animation preferences
  const shouldAnimate = !optimalSettings.reduceAnimations && 
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (trigger) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [trigger, delay]);

  const animationClasses = {
    fadeIn: 'opacity-0 transition-opacity',
    slideUp: 'translate-y-4 opacity-0 transition-all',
    slideDown: '-translate-y-4 opacity-0 transition-all',
    slideLeft: 'translate-x-4 opacity-0 transition-all',
    slideRight: '-translate-x-4 opacity-0 transition-all',
    scale: 'scale-95 opacity-0 transition-all',
    bounce: 'scale-75 opacity-0 transition-all'
  };

  const activeClasses = {
    fadeIn: 'opacity-100',
    slideUp: 'translate-y-0 opacity-100',
    slideDown: 'translate-y-0 opacity-100',
    slideLeft: 'translate-x-0 opacity-100',
    slideRight: 'translate-x-0 opacity-100',
    scale: 'scale-100 opacity-100',
    bounce: 'scale-100 opacity-100'
  };

  return (
    <div
      ref={elementRef}
      className={`
        ${shouldAnimate ? animationClasses[animation] : ''}
        ${isVisible && shouldAnimate ? activeClasses[animation] : ''}
        ${!shouldAnimate ? 'opacity-100' : ''}
        ${className}
      `}
      style={{
        transitionDuration: shouldAnimate ? `${duration}ms` : '0ms',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {children}
    </div>
  );
};

/**
 * Battery-Conscious Background Task Manager
 */
export const useBatteryOptimizedTasks = () => {
  const { batteryStatus, optimalSettings } = useMobilePerformance();
  const tasksRef = useRef(new Map());
  const intervalsRef = useRef(new Map());

  const registerTask = (id, task, options = {}) => {
    const {
      interval = 5000,
      priority = 'normal', // 'high', 'normal', 'low'
      runOnLowBattery = false
    } = options;

    tasksRef.current.set(id, { task, interval, priority, runOnLowBattery });
    scheduleTask(id);
  };

  const scheduleTask = (id) => {
    const taskInfo = tasksRef.current.get(id);
    if (!taskInfo) return;

    const { task, interval, priority, runOnLowBattery } = taskInfo;
    
    // Skip non-essential tasks on low battery
    if (optimalSettings.reducePollling && priority === 'low') return;
    if (batteryStatus.level < 0.15 && !runOnLowBattery && priority !== 'high') return;

    // Adjust interval based on battery status
    let adjustedInterval = interval;
    if (batteryStatus.level < 0.3 && !batteryStatus.charging) {
      adjustedInterval = interval * 2; // Reduce frequency
    }

    // Clear existing interval
    if (intervalsRef.current.has(id)) {
      clearInterval(intervalsRef.current.get(id));
    }

    // Set new interval
    const intervalId = setInterval(task, adjustedInterval);
    intervalsRef.current.set(id, intervalId);
  };

  const unregisterTask = (id) => {
    if (intervalsRef.current.has(id)) {
      clearInterval(intervalsRef.current.get(id));
      intervalsRef.current.delete(id);
    }
    tasksRef.current.delete(id);
  };

  // Reschedule tasks when battery status changes
  useEffect(() => {
    tasksRef.current.forEach((_, id) => scheduleTask(id));
  }, [batteryStatus.level, batteryStatus.charging, optimalSettings.reducePollling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      intervalsRef.current.forEach(intervalId => clearInterval(intervalId));
    };
  }, []);

  return { registerTask, unregisterTask };
};

/**
 * Network-Aware Data Fetching Hook
 */
export const useNetworkOptimizedFetch = () => {
  const { networkStatus, optimalSettings } = useMobilePerformance();
  const [requestQueue, setRequestQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const queueRequest = (request) => {
    setRequestQueue(prev => [...prev, { ...request, id: Date.now() }]);
  };

  // Process requests based on network conditions
  useEffect(() => {
    if (isProcessing || requestQueue.length === 0) return;
    if (!networkStatus.online) return;

    setIsProcessing(true);

    const processRequests = async () => {
      const { limitParallelRequests } = optimalSettings;
      const batchSize = limitParallelRequests ? 1 : 3;
      const batch = requestQueue.slice(0, batchSize);

      try {
        const promises = batch.map(async (request) => {
          const timeout = networkStatus.effectiveType === 'slow-2g' ? 10000 : 5000;
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);

          try {
            const response = await fetch(request.url, {
              ...request.options,
              signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
          } catch (error) {
            clearTimeout(timeoutId);
            throw error;
          }
        });

        await Promise.allSettled(promises);
        setRequestQueue(prev => prev.slice(batchSize));
      } catch (error) {
        console.warn('Network request batch failed:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    const delay = optimalSettings.enableDataSaver ? 1000 : 100;
    const timer = setTimeout(processRequests, delay);
    
    return () => clearTimeout(timer);
  }, [requestQueue, isProcessing, networkStatus.online, optimalSettings]);

  return { queueRequest, queueLength: requestQueue.length };
};
