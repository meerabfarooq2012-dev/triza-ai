/// <reference lib="webworker" />

const CACHE_NAME = 'thiora-v1';
const STATIC_CACHE = 'thiora-static-v1';
const DYNAMIC_CACHE = 'thiora-dynamic-v1';
const API_CACHE = 'thiora-api-v1';

const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/logo.svg',
  '/manifest.json',
];

// Cache-first: static assets (CSS, JS, images, fonts)
const CACHE_FIRST_EXTENSIONS = [
  '.css',
  '.js',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.webp',
];

// Network-first: API calls
const API_PATHS = ['/api/'];

// Install event — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(
            (name) =>
              name !== STATIC_CACHE &&
              name !== DYNAMIC_CACHE &&
              name !== API_CACHE
          )
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Helper: determine caching strategy
function getStrategy(url) {
  const urlObj = new URL(url);

  // API calls → network-first
  for (const path of API_PATHS) {
    if (urlObj.pathname.startsWith(path)) {
      return 'network-first';
    }
  }

  // Static assets → cache-first
  for (const ext of CACHE_FIRST_EXTENSIONS) {
    if (urlObj.pathname.endsWith(ext)) {
      return 'cache-first';
    }
  }

  // Same-origin navigation/pages → stale-while-revalidate
  if (urlObj.origin === self.location.origin) {
    return 'stale-while-revalidate';
  }

  // External resources → network-first
  return 'network-first';
}

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!request.url.startsWith('http')) return;

  const strategy = getStrategy(request.url);

  switch (strategy) {
    case 'cache-first':
      event.respondWith(cacheFirst(request));
      break;
    case 'network-first':
      event.respondWith(networkFirst(request));
      break;
    case 'stale-while-revalidate':
      event.respondWith(staleWhileRevalidate(request));
      break;
    default:
      event.respondWith(networkFirst(request));
  }
});

// Cache-first strategy: serve from cache, fall back to network
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // If it's a navigation request, show offline page
    if (request.mode === 'navigate') {
      const offline = await caches.match('/offline.html');
      if (offline) return offline;
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Network-first strategy: try network, fall back to cache
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cacheName = request.url.includes('/api/') ? API_CACHE : DYNAMIC_CACHE;
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // If it's a navigation request, show offline page
    if (request.mode === 'navigate') {
      const offline = await caches.match('/offline.html');
      if (offline) return offline;
    }

    return new Response(JSON.stringify({ error: 'You are offline' }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Stale-while-revalidate: serve from cache, update in background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => {
      // Network failed, that's fine — we already returned cached
      return null;
    });

  // Return cached immediately if available, otherwise wait for network
  if (cached) {
    return cached;
  }

  const networkResponse = await fetchPromise;
  if (networkResponse) {
    return networkResponse;
  }

  // If it's a navigation request, show offline page
  if (request.mode === 'navigate') {
    const offline = await caches.match('/offline.html');
    if (offline) return offline;
  }

  return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
}
