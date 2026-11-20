/* Service Worker: network-first для HTML/навигации, cache-first для статики */
const STATIC_CACHE = "erp-static-v3";
// Сайт может лежать в подпапке (GitHub Pages: /ERP-Political/) — берём путь из области действия воркера
const BASE = new URL(self.registration.scope).pathname;

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(["assets/logo.jpg", "assets/hero-bg.jpg", "assets/program-bg.jpg", "assets/chairman.jpg", "assets/deputy.jpg"].map((f) => BASE + f)),
    ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // API (tRPC-запросы идут через GET) — никогда не кэшируем, иначе правки из панели не появятся
  if (url.pathname.startsWith("/api/")) return;

  // HTML и навигация — только сеть
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(fetch(request));
    return;
  }

  // Статика — cache-first с обновлением
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetched;
    }),
  );
});
