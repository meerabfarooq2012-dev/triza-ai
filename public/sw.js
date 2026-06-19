/// <reference lib="webworker" />

const CACHE_NAME = 'thiora-v2';
const STATIC_CACHE = 'thiora-static-v2';
const DYNAMIC_CACHE = 'thiora-dynamic-v2';
const API_CACHE = 'thiora-api-v2';

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

// Branding assets that must ALWAYS be fresh (never stale cache)
// These are fetched from network first so logo/icon updates reach users immediately
const NETWORK_FIRST_PATHS = [
  '/logo.svg',
  '/logo.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
  '/og-image.png',
  '/manifest.json',
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

  // Branding assets (logo, icons, og-image) → ALWAYS network-first
  // This ensures logo/branding updates reach users immediately
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

// =============================================================================
// Push Notification Handlers
// =============================================================================

// Push event — show notification when a push message is received
self.addEventListener('push', (event) => {
  let data = {
    title: 'Thiora',
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
      // If not JSON, use the text as the body
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

// Notification click event — open the app when notification is clicked
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  if (event.action === 'dismiss') return;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If there's already a window open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Navigate to the target URL if different
          if (urlToOpen !== '/' && client.navigate) {
            client.navigate(urlToOpen);
          }
          return client.focus();
        }
      }
      // No window open — open a new one
      return self.clients.openWindow(urlToOpen);
    })
  );
});
