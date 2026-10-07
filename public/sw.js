const CACHE_NAME = 'galaxy-finance-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install: Cache critical static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: Purge stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Stale-while-revalidate for assets, Network-only for API requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Ignore non-HTTP/HTTPS schemes (such as chrome-extension://)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 2. Bypass caching for backend API calls and Render endpoints
  if (url.pathname.startsWith('/api') || url.hostname.includes('onrender.com') || url.pathname.startsWith('/download')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Bypass non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // Only cache valid GET responses with http/https scheme
          if (!response || response.status !== 200 || response.type !== 'basic' || event.request.method !== 'GET') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // If offline and request is navigation, serve index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
