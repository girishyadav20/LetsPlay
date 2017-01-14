
// Service Worker for Root

const CACHE_NAME = 'lets-play-v1';

var urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/main.css',
  '/js/letsplay.js',
  '/images/favicon.png',
  '/images/grey_back.png',
  '/images/profile_placeholder.png'
];

self.addEventListener('install', event => {
  //populate cache oninstall
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(urlsToCache);
      })
    );
});

self.addEventListener('activate', event => {
  //update cache and delete older cache
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if(key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
