const CACHE_NAME = 'galaxy-finance-cache-v2';
const STATIC_ASSETS = [
  '/manifest.webmanifest',
  '/favicon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install: Cache critical shell resources and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
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

// Fetch handler
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

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

  // 4. Navigation requests (HTML pages): ALWAYS Network-First
  // Guarantees users always receive the latest index.html with up-to-date JS bundle hashes.
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
          // If Netlify redirected 404 to index.html, MIME is text/html for a .js file!
          if (contentType.includes('text/html')) {
            console.warn('[SW]: Detected HTML response for asset request:', url.pathname);
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
      });
    })
  );
});
