// service-worker.js
const CACHE_NAME = 'quickkeyz-v1';
const AUDIO_CACHE_NAME = 'quickkeyz-audio-v1';

// Audio files to cache
const AUDIO_ASSETS = [
  '/audio/multi-sample-instruments/default/48.mp3',
  '/audio/multi-sample-instruments/default/50.mp3',
  '/audio/multi-sample-instruments/default/52.mp3',
  '/audio/multi-sample-instruments/default/53.mp3',
  '/audio/multi-sample-instruments/default/55.mp3',
  '/audio/multi-sample-instruments/default/57.mp3',
  '/audio/single-samples/default/defaultSample_sPno.mp3',
];

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
              name.startsWith('quickkeyz-') &&
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
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }

        const responseToCache = response.clone();

        // Cache strategy based on file type
        if (event.request.url.includes('/audio/')) {
          // Cache audio files
          caches.open(AUDIO_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        } else if (
          // Cache core assets (JS, CSS)
          event.request.url.endsWith('.js') ||
          event.request.url.endsWith('.css') ||
          event.request.url.endsWith('.html')
        ) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      });
    })
  );
});

// // service-worker.js
// const CACHE_NAME = 'quickkeyz-v1';
// const AUDIO_CACHE_NAME = 'quickkeyz-audio-v1';

// // Core assets to cache immediately
// const CORE_ASSETS = [
//   '/',
//   '/index.html',
//   '/src/index.tsx',
//   '/src/App.tsx',
//   // Add your JS chunks, CSS, and other core assets
// ];

// // Audio files to cache
// const AUDIO_ASSETS = [
//   '/audio/multi-sample-instruments/default/48.mp3',
//   '/audio/multi-sample-instruments/default/50.mp3',
//   '/audio/multi-sample-instruments/default/52.mp3',
//   '/audio/multi-sample-instruments/default/53.mp3',
//   '/audio/multi-sample-instruments/default/55.mp3',
//   '/audio/multi-sample-instruments/default/57.mp3',
//   '/audio/single-samples/default/defaultSample_sPno.mp3',
// ];

// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     Promise.all([
//       // Cache core assets
//       caches.open(CACHE_NAME).then((cache) => {
//         return cache.addAll(CORE_ASSETS);
//       }),
//       // Cache audio files separately
//       caches.open(AUDIO_CACHE_NAME).then((cache) => {
//         return cache.addAll(AUDIO_ASSETS);
//       }),
//     ])
//   );
// });

// self.addEventListener('activate', (event) => {
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames
//           .filter((name) => {
//             // Remove old caches if needed
//             return (
//               name.startsWith('quickkeyz-') &&
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
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       // Return cached version if available
//       if (response) {
//         return response;
//       }

//       // Otherwise fetch from network
//       return fetch(event.request).then((response) => {
//         // Don't cache non-successful responses
//         if (!response || response.status !== 200) {
//           return response;
//         }

//         // Clone the response as it can only be consumed once
//         const responseToCache = response.clone();

//         // Determine which cache to use based on the request URL
//         const cacheName = event.request.url.includes('/audio/')
//           ? AUDIO_CACHE_NAME
//           : CACHE_NAME;

//         caches.open(cacheName).then((cache) => {
//           cache.put(event.request, responseToCache);
//         });

//         return response;
//       });
//     })
//   );
// });
