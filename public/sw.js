const CACHE = "snack-roster-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Drop caches from older SW versions (v1 cached session-specific RSC
  // payloads, including NEXT_REDIRECT redirects to /login, which were
  // then replayed on navigation and bounced logged-in admins to login).
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.filter((name) => name !== CACHE).map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Only static assets are safe to cache — they are identical for every
// user. Documents and RSC (App Router transition) payloads embed the
// current session's auth state (a logged-out render encodes a
// NEXT_REDIRECT to /login), so caching them replays stale redirects to
// logged-in users. Those requests are network-only.
function isCacheableAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".ico") ||
    url.pathname === "/manifest.json" ||
    url.origin !== self.location.origin
  );
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (!isCacheableAsset(event.request)) {
    return; // Network-only for documents and RSC payloads.
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
