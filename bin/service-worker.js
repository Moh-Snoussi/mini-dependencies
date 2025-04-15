// install the application, or update the existing one




self.addEventListener('install', e => {
  console.log("Service worker installed");

  // Cache assets for offline use
  e.waitUntil(
    caches.open('pwa-cache-v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/default.css',
        '/default.js',
        '/manifest.json',
        '/imgs/logo.png' // Example asset
      ]);
    })
  );
});
