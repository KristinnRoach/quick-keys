// service-worker.js
const CACHE_NAME = 'quick-keyz-v1';
const AUDIO_CACHE_NAME = 'quick-keyz-audio-v1';

// Audio files to cache
const AUDIO_ASSETS = [
  '/audio/multi-sample-instruments/default/48.mp3',
  '/audio/multi-sample-instruments/default/50.mp3',
  '/audio/multi-sample-instruments/default/52.mp3',
  '/audio/multi-sample-instruments/default/53.mp3',
  '/audio/multi-sample-instruments/default/55.mp3',
  '/audio/multi-sample-instruments/default/57.mp3',
  '/audio/single-samples/default/sPno_60.mp3',
];

// Helper function to check if a URL is valid for caching
function isValidCacheUrl(url) {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(AUDIO_CACHE_NAME).then((cache) => {
      return cache.addAll(AUDIO_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return (
              name.startsWith('quick-keyz-') &&
              name !== CACHE_NAME &&
              name !== AUDIO_CACHE_NAME
            );
          })
          .map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests and valid URLs
  if (event.request.method !== 'GET' || !isValidCacheUrl(event.request.url)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then((response) => {
          // Check if we received a valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type !== 'basic'
          ) {
            return response;
          }

          const responseToCache = response.clone();

          // Cache strategy based on file type
          const url = new URL(event.request.url);

          if (url.pathname.startsWith('/audio/')) {
            // Cache audio files
            caches.open(AUDIO_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          } else if (
            // Cache core assets (JS, CSS, HTML)
            url.pathname.endsWith('.js') ||
            url.pathname.endsWith('.css') ||
            url.pathname.endsWith('.html')
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        })
        .catch(() => {
          // Optional: Return fallback content for failed requests
          // For now, just let the error propagate
          return Promise.reject('fetch failed');
        });
    })
  );
});
