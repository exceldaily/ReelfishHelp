/**
 * ReelFishHelp service worker: receives Web Push and shows system
 * notifications; tapping one opens (or focuses) the app at the right page.
 * Intentionally no fetch handler — the network path stays untouched.
 */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "ReelFishHelp", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "ReelFishHelp";
  const options = {
    body: data.body || "",
    icon: data.image || "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { href: data.href || "/home" },
    tag: data.tag || undefined,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const href = (event.notification.data && event.notification.data.href) || "/home";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client) client.navigate(href);
          return;
        }
      }
      return self.clients.openWindow(href);
    })
  );
});
