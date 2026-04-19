//プッシュ通知を受信したときの動作
self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const urlToOpen = data.url || "/";

    const options = {
      body: data.body,
      icon: data.icon || "/images/web-app-manifest-512x512.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
        url: urlToOpen,
      },
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("プッシュ通知がクリックされました");
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients.openWindow(new URL(targetUrl, self.location.origin).toString()),
  );
});
