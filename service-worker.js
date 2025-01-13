// service-worker.js

const CACHE_VERSION = 'v1';
const CORE_CACHE = `quick-keyz-core-${CACHE_VERSION}`;
const AUDIO_CACHE = `quick-keyz-audio-${CACHE_VERSION}`;
const STATIC_CACHE = `quick-keyz-static-${CACHE_VERSION}`;

// Organize assets by type
const CORE_ASSETS = [
  '/quick-keys/', // Base path
  '/quick-keys/index.html',
  '/quick-keys/manifest.json',
];

const AUDIO_ASSETS = [
  './audio/multi-sample-instruments/default/48.mp3',
  './audio/multi-sample-instruments/default/50.mp3',
  './audio/multi-sample-instruments/default/52.mp3',
  './audio/multi-sample-instruments/default/53.mp3',
  './audio/multi-sample-instruments/default/55.mp3',
  './audio/multi-sample-instruments/default/57.mp3',
  './audio/single-samples/default/sPno_60.mp3',
];

const STATIC_ASSETS = [
  './icons/app-icon.svg',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/maskable-192x192.png',
  './icons/maskable-512x512.png',
];

// Install handler - cache all initial assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CORE_CACHE).then((cache) => cache.addAll(CORE_ASSETS)),
      caches.open(AUDIO_CACHE).then((cache) => cache.addAll(AUDIO_ASSETS)),
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
    ])
  );
});

// Activate handler - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return (
              name.startsWith('quick-keyz-') && !name.includes(CACHE_VERSION)
            );
          })
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Helper function to validate cache URLs
function isValidCacheUrl(url) {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

// Fetch handler - serve from cache with different strategies
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and valid URLs
  if (event.request.method !== 'GET' || !isValidCacheUrl(event.request.url)) {
    return;
  }

  const url = new URL(event.request.url);

  // Choose caching strategy based on request type
  if (url.pathname.startsWith('/audio/')) {
    // Audio files - Cache First strategy
    event.respondWith(
      caches
        .open(AUDIO_CACHE)
        .then((cache) => cache.match(event.request))
        .then((response) => response || fetch(event.request))
    );
  } else if (url.pathname.startsWith('/icons/')) {
    // Static assets - Cache First strategy
    event.respondWith(
      caches
        .open(STATIC_CACHE)
        .then((cache) => cache.match(event.request))
        .then((response) => response || fetch(event.request))
    );
  } else {
    // Core assets - Cache First with network update
    event.respondWith(
      caches.open(CORE_CACHE).then((cache) => {
        return cache.match(event.request).then((response) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          return response || fetchPromise;
        });
      })
    );
  }
});
