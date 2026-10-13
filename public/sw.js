const CACHE_NAME = 'galaxy-finance-v1.2.0';
const STATIC_ASSETS = [
  '/manifest.json',
  '/manifest.webmanifest',
  '/favicon.png',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/maskable-icon-512x512.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install: Cache critical shell resources and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (e) {
          console.warn('[SW]: Failed to precache asset:', asset, e);
        }
      }
    })
  );
  self.skipWaiting();
});

// Activate: Immediately purge all older caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW]: Purging outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch handler: Meets strict Android Chrome PWA installability requirements
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Explicitly bypass all Vite development assets and HMR tooling
  if (url.pathname.includes('@vite') || url.pathname.includes('__vite') || url.port === '5173') {
    return;
  }

  // 1. Ignore non-HTTP/HTTPS schemes
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 2. Bypass caching for backend API calls and Render endpoints
  if (
    url.pathname.startsWith('/api') || 
    url.hostname.includes('onrender.com') || 
    url.pathname.startsWith('/download')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 3. Bypass non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // 4. Navigation requests (HTML pages): ALWAYS Network-First with offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // 5. Static Assets (/assets/*): Never allow 404 HTML fallback to be served as JS/CSS
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('text/html')) {
            return new Response('Asset not found or stale bundle', {
              status: 404,
              statusText: 'Not Found',
              headers: { 'Content-Type': 'text/plain' },
            });
          }
          return response;
        })
        .catch((err) => {
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            throw err;
          });
        })
    );
    return;
  }

  // 6. Generic Assets (Icons, manifest, images): Cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => caches.match(event.request));
    })
  );
});
