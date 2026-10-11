// Service worker: aplikace se spustí i offline (soubory + knihovna ECharts). Data předpovědi se vždy berou z internetu.
const V = 'meteogram-v1';
const ECHARTS = 'https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-48.png'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(V);
    await c.addAll(FILES);
    try { await c.add(new Request(ECHARTS, { mode: 'cors' })); } catch (_) {}
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== V) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (url.href === ECHARTS) {                       // knihovna: cache first
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(n => { const cp = n.clone(); caches.open(V).then(c => c.put(req, cp)); return n; })));
    return;
  }
  if (url.origin === location.origin) {             // vlastní soubory: síť, při výpadku cache
    e.respondWith(fetch(req).then(n => { const cp = n.clone(); caches.open(V).then(c => c.put(req, cp)); return n; })
      .catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
  }                                                  // ostatní (data, hledání) jde přímo na síť
});
