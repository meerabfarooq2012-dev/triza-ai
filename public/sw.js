/// <reference lib="webworker" />

// =============================================================================
//  TRIZA Service Worker — v5
//  - Bumped cache version to force-clear ALL v4 caches (which contained
//    the broken JS bundle with the onDelete bug)
//  - Changed .js strategy from cache-first → network-first so JS updates
//    always reach the user immediately (critical for a frequently-updated app)
//  - Added auto-reload: when a new SW activates, it tells all clients to
//    reload so the user sees the fix without manual refresh
// =============================================================================

const CACHE_NAME = 'triza-v5';
const STATIC_CACHE = 'triza-static-v5';
const DYNAMIC_CACHE = 'triza-dynamic-v5';
const API_CACHE = 'triza-api-v5';

const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/logo.svg',
  '/manifest.json',
];

// Static assets that are safe to cache-first (NOT JS — JS must always be fresh)
const CACHE_FIRST_EXTENSIONS = [
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

// Network-first: API calls + ALL JavaScript (so code updates reach users)
const API_PATHS = ['/api/'];
const NETWORK_FIRST_EXTENSIONS = ['.js', '.css', '.json'];

// Branding assets that must ALWAYS be fresh (never stale cache)
const NETWORK_FIRST_PATHS = [
  '/logo.svg',
  '/logo.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
  '/og-image.png',
  '/manifest.json',
  '/sw.js',
];

// Install event — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event — clean up ALL old caches + claim clients + trigger reload
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
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    }).then(() => {
      // Tell all open tabs to reload so they get the fresh JS bundle
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    }).then((clientList) => {
      clientList.forEach((client) => {
        client.postMessage({ type: 'SW_UPDATED', version: CACHE_NAME });
      });
    })
  );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Helper: determine caching strategy
function getStrategy(url) {
  const urlObj = new URL(url);

  // Branding assets + sw.js → ALWAYS network-first
  for (const path of NETWORK_FIRST_PATHS) {
    if (urlObj.pathname === path) {
      return 'network-first';
    }
  }

  // API calls → network-first
  for (const path of API_PATHS) {
    if (urlObj.pathname.startsWith(path)) {
      return 'network-first';
    }
  }

  // JavaScript + CSS + JSON → network-first (CRITICAL: code updates must reach users)
  for (const ext of NETWORK_FIRST_EXTENSIONS) {
    if (urlObj.pathname.endsWith(ext)) {
      return 'network-first';
    }
  }

  // Other static assets (images, fonts) → cache-first
  for (const ext of CACHE_FIRST_EXTENSIONS) {
    if (urlObj.pathname.endsWith(ext)) {
      return 'cache-first';
    }
  }

  // Same-origin navigation/pages → network-first (always serve fresh HTML)
  if (urlObj.origin === self.location.origin) {
    return 'network-first';
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

// =============================================================================
// Push Notification Handlers
// =============================================================================

self.addEventListener('push', (event) => {
  let data = {
    title: 'TRIZA',
    body: 'You have a new notification',
    icon: '/logo.svg',
    badge: '/logo.svg',
    url: '/',
    tag: undefined,
    type: undefined,
    category: undefined,
    notificationId: undefined,
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch {
      data.body = event.data.text();
    }
  }

  const title = data.title;
  const options = {
    body: data.body,
    icon: data.icon || '/logo.svg',
    badge: data.badge || '/logo.svg',
    image: data.image || undefined,
    tag: data.tag || undefined,
    data: {
      url: data.url || '/',
      type: data.type,
      category: data.category,
      notificationId: data.notificationId,
    },
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  if (event.action === 'dismiss') return;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if (urlToOpen !== '/' && client.navigate) {
            client.navigate(urlToOpen);
          }
          return client.focus();
        }
      }
      return self.clients.openWindow(urlToOpen);
    })
  );
});
