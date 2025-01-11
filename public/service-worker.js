// service-worker.js
const CACHE_VERSION = 'v1';
const CORE_CACHE = `quick-keyz-core-${CACHE_VERSION}`;
const AUDIO_CACHE = `quick-keyz-audio-${CACHE_VERSION}`;
const STATIC_CACHE = `quick-keyz-static-${CACHE_VERSION}`;

// Organize assets by type
const CORE_ASSETS = ['/', '/index.html', '/manifest.json'];

const AUDIO_ASSETS = [
  '/audio/multi-sample-instruments/default/48.mp3',
  '/audio/multi-sample-instruments/default/50.mp3',
  '/audio/multi-sample-instruments/default/52.mp3',
  '/audio/multi-sample-instruments/default/53.mp3',
  '/audio/multi-sample-instruments/default/55.mp3',
  '/audio/multi-sample-instruments/default/57.mp3',
  '/audio/single-samples/default/sPno_60.mp3',
];

const STATIC_ASSETS = [
  '/icons/app-icon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/maskable-192x192.png',
  '/icons/maskable-512x512.png',
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

// // service-worker.js
// const CACHE_NAME = 'quick-keyz-v1';
// const AUDIO_CACHE_NAME = 'quick-keyz-audio-v1';

// // Audio files to cache
// const AUDIO_ASSETS = [
//   '/audio/multi-sample-instruments/default/48.mp3',
//   '/audio/multi-sample-instruments/default/50.mp3',
//   '/audio/multi-sample-instruments/default/52.mp3',
//   '/audio/multi-sample-instruments/default/53.mp3',
//   '/audio/multi-sample-instruments/default/55.mp3',
//   '/audio/multi-sample-instruments/default/57.mp3',
//   '/audio/single-samples/default/sPno_60.mp3',
// ];

// // Helper function to check if a URL is valid for caching
// function isValidCacheUrl(url) {
//   try {
//     const urlObj = new URL(url);
//     return ['http:', 'https:'].includes(urlObj.protocol);
//   } catch {
//     return false;
//   }
// }

// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     caches.open(AUDIO_CACHE_NAME).then((cache) => {
//       return cache.addAll(AUDIO_ASSETS);
//     })
//   );
// });

// self.addEventListener('activate', (event) => {
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames
//           .filter((name) => {
//             return (
//               name.startsWith('quick-keyz-') &&
//               name !== CACHE_NAME &&
//               name !== AUDIO_CACHE_NAME
//             );
//           })
//           .map((name) => caches.delete(name))
//       );
//     })
//   );
// });

// self.addEventListener('fetch', (event) => {
//   // Only handle GET requests and valid URLs
//   if (event.request.method !== 'GET' || !isValidCacheUrl(event.request.url)) {
//     return;
//   }

//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       if (response) {
//         return response;
//       }

//       return fetch(event.request)
//         .then((response) => {
//           // Check if we received a valid response
//           if (
//             !response ||
//             response.status !== 200 ||
//             response.type !== 'basic'
//           ) {
//             return response;
//           }

//           const responseToCache = response.clone();

//           // Cache strategy based on file type
//           const url = new URL(event.request.url);

//           if (url.pathname.startsWith('/audio/')) {
//             // Cache audio files
//             caches.open(AUDIO_CACHE_NAME).then((cache) => {
//               cache.put(event.request, responseToCache);
//             });
//           } else if (
//             // Cache core assets (JS, CSS, HTML)
//             url.pathname.endsWith('.js') ||
//             url.pathname.endsWith('.css') ||
//             url.pathname.endsWith('.html')
//           ) {
//             caches.open(CACHE_NAME).then((cache) => {
//               cache.put(event.request, responseToCache);
//             });
//           }

//           return response;
//         })
//         .catch(() => {
//           // Optional: Return fallback content for failed requests
//           // For now, just let the error propagate
//           return Promise.reject('fetch failed');
//         });
//     })
//   );
// });
