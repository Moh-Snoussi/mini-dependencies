self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting(); // activate immediately
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
});
