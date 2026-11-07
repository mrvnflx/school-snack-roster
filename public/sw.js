// Self-destructing service worker.
//
// Previous versions of this SW cached every GET response, including
// session-specific RSC payloads. A logged-out render of /admin encodes a
// NEXT_REDIRECT to /login, and replaying that cached payload on
// navigation logged authenticated admins out. This worker deletes all
// caches and unregisters itself so no service worker controls the app.
// It has no fetch handler, so it never intercepts requests.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.map((name) => caches.delete(name))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
  );
});
