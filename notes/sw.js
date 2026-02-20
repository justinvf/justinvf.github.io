var CACHE_NAME = 'private-notes-v1';
var PRECACHE_URLS = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.mode === 'navigate') {
    // Cache-first for navigation requests
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        if (cached) {
          // Return cache, update in background
          event.waitUntil(
            fetch(event.request).then(function(response) {
              if (response.ok) {
                return caches.open(CACHE_NAME).then(function(cache) {
                  cache.put(event.request, response);
                });
              }
            }).catch(function() {})
          );
          return cached;
        }
        return fetch(event.request).then(function(response) {
          if (response.ok) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, clone);
            });
          }
          return response;
        });
      })
    );
  } else {
    // Network-first for other requests
    event.respondWith(
      fetch(event.request).then(function(response) {
        if (response.ok) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(function() {
        return caches.match(event.request);
      })
    );
  }
});
