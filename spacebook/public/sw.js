import { precacheAndRoute } from 'workbox-precaching';
console.log('Service Worker cargado');

precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener('push', event => {
  console.log('[Service Worker] Push recibido', event.data?.text());
  let data = {};
  try {
    data = event.data.json();
  } catch (error) {
    console.error('Error al parsear push data:', error);
    // Fallback para texto plano
    if (event.data?.text()) {
      data.message = event.data.text();
    }
  }

  const title = data.title || 'SpaceBook';
  const options = {
    body: data.message || 'Tienes una nueva notificación.',
    icon: 'pwa-512x512.png',
    badge: 'pwa-512x512.png',
    vibrate: [100, 50, 100],
    data: { url: '/' }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Clic en la notificación');
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        for (const client of windowClients) {
          if (client.url.includes(self.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        /* if (clients.openWindow) return clients.openWindow('/'); */
        if (clients.openWindow) return clients.openWindow('/admin/penalizaciones');
      })
  );
});
