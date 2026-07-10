// Service worker simples: cacheia o "app shell" para abrir offline depois do primeiro acesso.
// ⚠️ BUILD_VERSION é substituído automaticamente pelo GitHub Actions a cada deploy.
const CACHE_NAME = 'homecheck-app-__BUILD_VERSION__';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // cache: 'reload' força buscar da rede, ignorando o cache HTTP do GitHub Pages
      // (max-age=600) — senão a versão "nova" seria populada com arquivos velhos.
      cache.addAll(ASSETS.map((url) => new Request(url, { cache: 'reload' })))
    )
    // sem .catch(): se o download falhar, o install falha e o navegador
    // tenta de novo depois, em vez de ativar uma versão com cache incompleto.
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Chart.js (CDN) e outras chamadas externas: tenta rede primeiro e guarda em cache
  // para funcionar offline depois do primeiro carregamento com internet.
  if (new URL(req.url).origin !== self.location.origin) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => cached);
    })
  );
});
