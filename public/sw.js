const CACHE_NAME = 'cwc-plus-v1';
const STATIC_ASSETS = ['/', '/manifest.json', '/icon.png'];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    const { request } = e;
    const url = new URL(request.url);

    // Skip non-GET and cross-origin (Supabase API, etc.)
    if (request.method !== 'GET' || url.origin !== self.location.origin) return;

    // Network-first for HTML navigation (always get fresh app shell)
    if (request.mode === 'navigate') {
        e.respondWith(
            fetch(request)
                .then(response => {
                    if (response.ok || response.status < 400) return response;
                    return caches.match('/');
                })
                .catch(() => caches.match('/'))
        );
        return;
    }

    // Cache-first for static assets (JS, CSS, images, fonts)
    if (
        url.pathname.startsWith('/assets/') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.svg') ||
        url.pathname.endsWith('.ico') ||
        url.pathname.endsWith('.webp') ||
        url.pathname.endsWith('.woff2')
    ) {
        e.respondWith(
            caches.match(request).then(cached => {
                if (cached) return cached;
                return fetch(request).then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    return response;
                });
            })
        );
        return;
    }

    // Default: network with offline fallback
    e.respondWith(
        fetch(request).catch(async () => {
            const cached = await caches.match(request);
            if (cached) return cached;
            // SHIELD: Return a network error response instead of undefined
            return new Response('Offline and not in cache', { status: 503, statusText: 'Service Unavailable' });
        })
    );
});

self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'CWC+', body: 'New update available!' };
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/icon.png',
            badge: '/icon.png',
            vibrate: [100, 50, 100],
            data: { url: data.url || '/' }
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
