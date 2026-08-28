/* MEDORA Health Care Eco System — application-owned service worker.
 * Cache policy: medora-health-care-shell-v4
 * - API (tRPC) requests are NEVER intercepted (API isolation).
 * - Navigation: network-first with app-shell fallback.
 * - Same-origin GET elsewhere: stale-while-revalidate.
 * - Legacy caches from prior platforms are deleted.
 */
const CACHE = "medora-health-care-shell-v4";
const LEGACY_CACHE_NAMES = ["aldo-health-care-shell-v3", "bdf-pharma-shell-v2"];
const API_PREFIX = "/api/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.resolve(caches.open(CACHE))
      .then((cache) => Promise.resolve(cache.addAll(["/", "/login"])).catch(() => undefined))
      .then(() => self.skipWaiting())
      .catch(() => undefined),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.resolve(caches.keys())
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE && !LEGACY_CACHE_NAMES.includes(key))
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim())
      .catch(() => undefined),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const appOrigin = (typeof self !== "undefined" && self.location && self.location.origin) || url.origin;
  if (url.origin !== appOrigin) return;
  const requestUrl = url;
  // API isolation: never replace a tRPC request with the cached application shell.
  if (requestUrl.pathname.startsWith(API_PREFIX)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          Promise.resolve(caches.open(CACHE))
            .then((cache) => Promise.resolve(cache.put(request, copy)))
            .catch(() => undefined);
          return response;
        })
        .catch(() => Promise.resolve(caches.match(request)).then((match) => match || caches.match("/"))),
    );
    return;
  }

  event.respondWith(
    Promise.resolve(caches.match(request)).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          const copy = response.clone();
          Promise.resolve(caches.open(CACHE))
            .then((cache) => Promise.resolve(cache.put(request, copy)))
            .catch(() => undefined);
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});

self.addEventListener("message", (event) => {
  const type = event.data && event.data.type;
  if (type === "MEDORA_SYNC_STATUS" || type === "ALDO_SYNC_STATUS" || type === "X-ALDO-Regulated-Operation") {
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      clients.forEach((client) => client.postMessage({ type, payload: event.data.payload }));
    });
  }
});
