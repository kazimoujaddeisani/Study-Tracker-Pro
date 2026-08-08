const CACHE_NAME = "study-tracker-v2";

const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./firebase-team.js",
  "./subject.js",
  "./manifest.json",
  "./data/bangla.js",
  "./data/english.js",
  "./data/math.js",
  "./data/gk.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
