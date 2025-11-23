import { precacheAndRoute } from 'workbox-precaching';
console.log('Service Worker cargado');

precacheAndRoute([{"revision":null,"url":"assets/index-B0xH_RJS.css"},{"revision":null,"url":"assets/index-CK9hdHXL.js"},{"revision":null,"url":"assets/workbox-window.prod.es5-CwtvwXb3.js"},{"revision":"43cfbb04e4f842498b28b9a88ad39df9","url":"index.html"},{"revision":"6dad5b14f38e6da15d65ec86cbf47dd2","url":"sw.js"},{"revision":"a3b5ef74b536dec5fe4be5c849e113b9","url":"pwa-192x192.png"},{"revision":"68eb7e5ec4c526bba5239fa63a365ecf","url":"pwa-512x512.png"},{"revision":"7351875660d5c12daaebfb755e2610b1","url":"manifest.webmanifest"}] || []);

self.addEventListener('push', event => {
  console.log('[Service Worker] Push recibido', event.data?.text());
  let data = {};
  try {
    data = event.data.json();
  } catch (error) {
    console.error('Error al parsear push data:', error);
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
        if (clients.openWindow) return clients.openWindow('/admin/penalizaciones');
      })
  );
});
