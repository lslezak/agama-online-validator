// just a workaround for TypeScript to pretend to be a module otherwise
// it complains that it cannot redeclare "self" in a block scope
export type Version = number;
// by default the context is Worker but we need a ServiceWorker here
declare let self: ServiceWorkerGlobalScope;

// version of the cache.
const VERSION = "v1";

// name of the cache
const CACHE = `agama-editor-${VERSION}`;

// resources downloaded to the offline cache
const RESOURCES = [
  // // HTML files
  "/",
  // JS files
  "/editor.worker.js",
  "/json.worker.js",
  "/manifest.json",
  "/app.js",
  // icons
  "/icon.svg",
  "/icon-16.png",
  "/icon-32.png",
  "/icon-512.png",
  // fonts
  "/f6283f7ccaed1249d9eb.ttf",
  "/pf-v6-pficon.woff2",
  "/RedHatDisplayVF-Italic.woff2",
  "/RedHatDisplayVF.woff2",
  "/RedHatMonoVF-Italic.woff2",
  "/RedHatMonoVF.woff2",
  "/RedHatTextVF-Italic.woff2",
  "/RedHatTextVF.woff2",
  // the remote schema files
  "https://raw.githubusercontent.com/agama-project/agama/refs/heads/SLE-16/rust/agama-lib/share/profile.schema.json",
  "https://raw.githubusercontent.com/agama-project/agama/refs/heads/SLE-16/rust/agama-lib/share/storage.schema.json",
  "https://raw.githubusercontent.com/agama-project/agama/refs/heads/SLE-16/rust/agama-lib/share/iscsi.schema.json",
  "https://raw.githubusercontent.com/agama-project/agama/refs/heads/master/rust/agama-lib/share/profile.schema.json",
  "https://raw.githubusercontent.com/agama-project/agama/refs/heads/master/rust/agama-lib/share/storage.schema.json",
  "https://raw.githubusercontent.com/agama-project/agama/refs/heads/master/rust/agama-lib/share/iscsi.schema.json",
];

if (process.env.NODE_ENV === "development") {
  RESOURCES.push("/vendors-node_modules_monaco-editor_esm_vs_language_json_jsonMode_js.js");
}

if (process.env.NODE_ENV === "production") {
  RESOURCES.push("/app.css");
}

// download the resources to the offline cache
self.addEventListener("install", (event) => {
  console.log("installing service worker");

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      console.log("Filling cache");
      cache.addAll(RESOURCES).catch((error) => console.error("Caching error ", error));
    })(),
  );
});

// delete old caches
self.addEventListener("activate", (event) => {
  console.log("activating service worker");

  event.waitUntil(
    (async () => {
      // enable navigation preloads
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }

      const names = await caches.keys();
      await Promise.all(
        names.map((name) => {
          if (name !== CACHE) {
            return caches.delete(name);
          }
          return undefined;
        }),
      );
      await self.clients.claim();
    })(),
  );
});

// intercept server requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async function () {
      // for the schema requests try loading the latest schema from network
      if (event.request.url.endsWith(".schema.json")) {
        try {
          console.log("Fetching", event.request.url);
          const networkResponse = await fetch(event.request);
          if (networkResponse.ok) {
            const clonedResponse = networkResponse.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, clonedResponse));
            return networkResponse;
          }
        } catch (error) {
          console.log("Download failed: ", error);
        }

        console.log("Fallback to cache", event.request.url);
        // return the cached responses on failure
        const cachedResponse = await caches.match(event.request);
        return cachedResponse || Response.error();
      }

      // return the cached response if present
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        console.log("Cached", event.request.url);
        return cachedResponse;
      }

      // use the preloaded response if present
      const response = await event.preloadResponse;
      if (response) {
        console.log("Preloaded", event.request.url);
        return response;
      }

      console.log("Fetching", event.request.url);

      // Else try the network.
      return fetch(event.request);
    })(),
  );
});
