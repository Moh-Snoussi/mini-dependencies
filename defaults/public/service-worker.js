self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting(); // activate immediately
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
});

// cach all, only for offline
self.addEventListener('fetch', event => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone response and store in cache
        const responseClone = response.clone();
        caches.open('default').then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request);
      })
  );
});

