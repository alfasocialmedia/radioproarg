// Service Worker para Web Push Notifications - ONRADIO
// Ubicación: /public/sw-push.js

self.addEventListener('push', function (event) {
    let data = { titulo: 'OnRadio', cuerpo: 'Tienes una nueva notificación.', url: '/' };

    try {
        data = event.data ? event.data.json() : data;
    } catch (e) {
        data.cuerpo = event.data ? event.data.text() : data.cuerpo;
    }

    const options = {
        body: data.cuerpo,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: { url: data.url || '/' },
        actions: [
            { action: 'open', title: '📻 Abrir', icon: '/icons/icon-72x72.png' },
            { action: 'close', title: 'Cerrar' },
        ],
    };

    event.waitUntil(self.registration.showNotification(data.titulo, options));
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    if (event.action === 'close') return;

    const url = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientsList) {
            for (const client of clientsList) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

// Activar service worker inmediatamente
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});
