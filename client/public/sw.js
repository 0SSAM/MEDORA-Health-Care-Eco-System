const CACHE_NAME = "medora-health-care-shell-v4";
const LEGACY_CACHE_NAMES = ["aldo-health-care-shell-v3", "bdf-pharma-shell-v2"];
const APP_SHELL = ["/", "/manifest.webmanifest"];
const REGULATED_HEADER = "X-ALDO-Regulated-Operation";
const DRAFT_HEADER = "X-ALDO-Offline-Draft";
const API_PREFIX = "/api/";

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(Promise.all(LEGACY_CACHE_NAMES.map(name => caches.delete(name))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") {
    const regulated = request.headers.get(REGULATED_HEADER) === "true";
    const draft = request.headers.get(DRAFT_HEADER) === "true";
    if (regulated || !draft) return;
    if (!self.navigator?.onLine) {
      event.respondWith(new Response(JSON.stringify({ error: "offline-draft-must-use-app-queue" }), { status: 409, headers: { "content-type": "application/json" } }));
    }
    return;
  }

  const requestUrl = new URL(request.url);
  if (requestUrl.pathname.startsWith(API_PREFIX)) {
    // API responses, including authentication and tRPC errors, must always
    // reach the network. Falling back to the app shell would transform an API
    // failure into a false 200 HTML response and can corrupt client state.
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/")));
    return;
  }

  event.respondWith(fetch(request).catch(() => caches.match(request)));
});

self.addEventListener("message", event => {
  if (event.data?.type === "ALDO_SYNC_STATUS") {
    event.source?.postMessage({ type: "ALDO_SYNC_STATUS", online: self.navigator?.onLine ?? true });
  }
});
