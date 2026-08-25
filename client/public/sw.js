const CACHE_NAME = "medora-health-care-shell-v5";
const LEGACY_CACHE_NAMES = ["medora-health-care-shell-v4", "medora-health-care-shell-v3", "bdf-pharma-shell-v2"];
const APP_SHELL = ["/", "/manifest.webmanifest"];
const REGULATED_HEADER = "X-MEDORA-Regulated-Operation";
const DRAFT_HEADER = "X-MEDORA-Offline-Draft";

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
  event.respondWith(fetch(request).catch(() => caches.match(request).then(response => response || caches.match("/"))));
});

self.addEventListener("message", event => {
  if (event.data?.type === "MEDORA_SYNC_STATUS") {
    event.source?.postMessage({ type: "MEDORA_SYNC_STATUS", online: self.navigator?.onLine ?? true });
  }
});
