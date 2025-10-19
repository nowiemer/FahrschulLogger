const CACHE = 'fl-v6-8';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './sw.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c)=>c.addAll(ASSETS)).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k!==CACHE ? caches.delete(k) : null))
    ).then(()=>self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(()=>caches.match('./index.html')));
    return;
  }
  if (req.method==='GET' && new URL(req.url).origin===self.location.origin){
    event.respondWith(
      caches.match(req).then(res => res || fetch(req).then(net => {
        const copy = net.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return net;
      }))
    );
  }
});
