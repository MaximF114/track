/* Service Worker der Controlling-Lernkonsole.
   Zweck: Die App soll auch ohne Netz starten — im Zug, in der Bib, im Keller.
   Die Lerndaten liegen ohnehin lokal; fehlt das Netz, entfällt nur der
   Abgleich mit Supabase, und die App sagt das in der Seitenleiste. */

const CACHE = 'lernkonsole-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.png',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                 // Schreibzugriffe nie abfangen
  const url = new URL(req.url);

  // Supabase niemals zwischenspeichern: veraltete Lernstände wären schlimmer
  // als gar keine.
  if (url.hostname.endsWith('.supabase.co')) return;

  // Bibliotheken und Schriften: aus dem Cache, im Hintergrund erneuern.
  const fremd = url.hostname === 'esm.sh'
             || url.hostname === 'fonts.googleapis.com'
             || url.hostname === 'fonts.gstatic.com';

  if (url.origin === self.location.origin || fremd) {
    e.respondWith(
      caches.match(req).then(hit => {
        const frisch = fetch(req).then(res => {
          if (res && res.ok) {
            const kopie = res.clone();
            caches.open(CACHE).then(c => c.put(req, kopie));
          }
          return res;
        }).catch(() => hit);                        // offline: nimm den Cache
        return hit || frisch;
      })
    );
  }
});
