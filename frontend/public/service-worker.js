// 🔔 Neuro Nexus Service Worker - Push Notification Handler

self.addEventListener("push", (event) => {
    const data = event.data ? event.data.json() : {};

    const title = data.title || "Neuro Nexus 🧠";
    const options = {
        body: data.body || "You have a new update!",
        icon: "/logo192.png",
        badge: "/logo192.png",
        vibrate: [200, 100, 200],
        tag: "neuro-nexus-notification",
        renotify: true,
        data: {
            url: data.data?.url || "/",
        },
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// Open the app when a notification is clicked
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.url || "/";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            // If app is already open, focus it
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && "focus" in client) {
                    return client.focus();
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});