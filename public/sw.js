// A basic service worker to pass PWA installability requirements
// In a full production PWA, you would use Workbox here for offline caching.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Required by Chrome to trigger the "Add to Home Screen" prompt.
  // We are simply letting the browser handle all network requests normally.
  event.respondWith(fetch(event.request));
});
