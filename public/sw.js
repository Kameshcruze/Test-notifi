/**
 * Service Worker for Push Notification Tester
 * Handles mobile background/foreground notifications, clicks, and client communication
 */

const SW_VERSION = '1.0.0';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle messages sent from the React UI
self.addEventListener('message', async (event) => {
  if (!event.data) return;

  const { type, payload } = event.data;

  if (type === 'SHOW_NOTIFICATION') {
    const title = payload?.title || 'Test Notification';
    const options = {
      body: payload?.body || 'This is a test notification.',
      icon: '/icon.svg',
      badge: '/icon.svg',
      vibrate: payload?.vibrate ?? [200, 100, 200],
      tag: payload?.tag || 'push-tester-notification',
      renotify: true,
      requireInteraction: payload?.requireInteraction ?? false,
      timestamp: Date.now(),
      data: {
        count: payload?.count || 1,
        url: '/',
        sentAt: new Date().toISOString(),
      },
      actions: [
        {
          action: 'open_app',
          title: 'Open Tester',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
    };

    try {
      await self.registration.showNotification(title, options);

      // Notify clients of success
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clients) {
        client.postMessage({
          type: 'NOTIFICATION_SHOWN_SUCCESS',
          count: payload?.count,
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      console.error('[SW] Error showing notification:', err);
    }
  }
});

// Handle clicking on notification in Android drawer / lockscreen
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Focus open tab or open window
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Push event listener (ready if Web Push is configured with VAPID)
self.addEventListener('push', (event) => {
  let data = {
    title: 'Test Notification',
    body: 'This is a test notification.',
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [200, 100, 200],
    tag: 'push-service-notification',
    renotify: true,
    data: {
      url: '/',
      timestamp: Date.now(),
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
