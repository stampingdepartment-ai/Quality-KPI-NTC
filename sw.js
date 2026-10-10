/* Service worker - Main Quality KPI Dashboard (PWA)
   - Halaman dan ikon disimpan supaya aplikasi tetap terbuka saat sinyal putus.
   - Selalu mencoba mengambil versi terbaru dari internet lebih dulu, jadi setelah index.html
     diganti di GitHub, pengguna langsung mendapat versi baru tanpa perlu mengubah file ini.
   - Data (delivery, defect, login) TIDAK disimpan di sini; selalu diambil dari Apps Script. */
const CACHE = 'qa-kpi-v1';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) { return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  const req = event.request;
  if (req.method !== 'GET') return;                              /* kiriman data ke Apps Script: biarkan lewat */
  if (new URL(req.url).origin !== self.location.origin) return;  /* font, Chart.js, Apps Script: biarkan lewat */
  event.respondWith(
    fetch(req)
      .then(function (res) {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
        return res;
      })
      .catch(function () {
        return caches.match(req, { ignoreSearch: true }).then(function (hit) { return hit || caches.match('index.html'); });
      })
  );
});
