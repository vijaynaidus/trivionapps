const CACHE_NAME = "trivion-shell-v18";
const SHELL = ["/", "/index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    const refresh = fetch(request).then(async (response) => {
      if (response.ok) {
        await caches.open(CACHE_NAME).then((cache) => cache.put("/", response.clone()));
      }
      return response;
    });
    event.waitUntil(refresh.catch(() => undefined));
    event.respondWith(caches.match("/").then((cached) => cached || refresh));
    return;
  }

  if (["style", "script", "image", "font"].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then(async (response) => {
          if (response.ok) {
            await caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        });
      }),
    );
  }
});
