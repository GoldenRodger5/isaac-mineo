// Enhanced Service Worker for Isaac Mineo Portfolio
// Provides advanced offline functionality, intelligent caching, and premium PWA features

const CACHE_NAME = 'isaac-mineo-portfolio-v2';
const STATIC_CACHE_NAME = 'isaac-mineo-static-v2';
const DYNAMIC_CACHE_NAME = 'isaac-mineo-dynamic-v2';
const API_CACHE_NAME = 'isaac-mineo-api-v1';

// Enhanced mobile-optimized caching strategy
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/index.css',
  '/src/styles/mobile-enhancements.css',
  '/src/components/About.jsx',
  '/src/components/Projects.jsx',
  '/src/components/Resume.jsx',
  '/src/components/mobile/MobileNavigation.jsx',
  '/src/components/mobile/EnhancedMobileLayout.jsx',
  '/src/components/mobile/MobileTouchComponents.jsx',
  '/src/components/mobile/MobilePerformance.jsx',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-32.png',
  '/icon-192.png',
  '/icon-512.png',
  '/Isaac_Mineo_Resume.pdf',
  '/Isaac_Mineo_Transcript.pdf'
];

// Smart network strategies for mobile optimization
const NETWORK_FIRST = [
  '/src/',
  '/api/',
  '/scripts/'
];

// Cache-first resources (serve from cache if available)
const CACHE_FIRST = [
  '/IsaacMineo_Resume.pdf',
  '/Mineo, Isaac, Resume.pdf',
  '/Mineo, Isaac, Transcript.pdf',
  '/icon-',
  '/favicon'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('SW: Install event');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('SW: Static assets cached successfully');
        return self.skipWaiting(); // Force activation
      })
      .catch((error) => {
        console.error('SW: Error caching static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activate event');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('SW: Service worker activated');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Skip API requests (especially POST requests) - let them go directly to network
  if (url.pathname.includes('/api/') || request.method !== 'GET') {
    return;
  }
  
  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Network-first strategy for dynamic content
    if (shouldUseNetworkFirst(request.url)) {
      return await networkFirst(request);
    }
    
    // Cache-first strategy for static assets
    if (shouldUseCacheFirst(request.url)) {
      return await cacheFirst(request);
    }
    
    // Default: stale-while-revalidate
    return await staleWhileRevalidate(request);
    
  } catch (error) {
    console.error('SW: Fetch error:', error);
    
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return await caches.match('/index.html') || new Response('Offline', { status: 503 });
    }
    
    return new Response('Network error', { status: 503 });
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && request.method === 'GET') {
      // Only cache GET requests
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache-first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    const cache = await caches.open(STATIC_CACHE_NAME);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  // Always try to fetch from network in background
  const networkResponsePromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => null);
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for network
  return await networkResponsePromise || new Response('Offline', { status: 503 });
}

// Helper functions
function shouldUseNetworkFirst(url) {
  return NETWORK_FIRST.some(pattern => url.includes(pattern));
}

function shouldUseCacheFirst(url) {
  return CACHE_FIRST.some(pattern => url.includes(pattern));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('SW: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any queued offline actions
  console.log('SW: Performing background sync');
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('SW: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icon-192.png',
    badge: '/favicon-32.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Isaac Mineo Portfolio', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
