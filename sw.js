const prefix = 'santa-north-pole-';
const cacheName = prefix + 'v8-pages-10';
const scope = new URL(self.registration.scope);
const assetUrls = ['./index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './favicon.ico']
  .map(path => new URL(path, scope).href);
const indexUrl = assetUrls[0];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll(assetUrls.map(url => new Request(url, {cache: 'reload'})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const existing = await caches.keys();
    await Promise.all(existing.filter(key => key.startsWith(prefix) && key !== cacheName)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== scope.origin) return;
  const gameNavigation = request.mode === 'navigate' &&
    (url.pathname === scope.pathname || url.pathname === new URL(indexUrl).pathname);
  if (!gameNavigation && !assetUrls.includes(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(gameNavigation ? indexUrl : request);
    return cached || fetch(request);
  })());
});
