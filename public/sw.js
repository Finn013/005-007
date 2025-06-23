
const CACHE_NAME = 'sticky-notes-v2';

// Определяем базовый путь в зависимости от окружения
const getBasePath = () => {
  const hostname = self.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '';
  }
  return '/005-007';
};

const BASE_PATH = getBasePath();

const urlsToCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.json`,
  // Добавляем ресурсы для EasyMDE
  `${BASE_PATH}/assets/easymde.min.css`,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache).catch((error) => {
          console.log('Некоторые ресурсы не удалось закэшировать:', error);
          return Promise.allSettled(
            urlsToCache.map(url => cache.add(url))
          );
        });
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('chrome-extension://') || 
      event.request.url.includes('retagro.com') ||
      !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).catch(() => {
          if (event.request.destination === 'document') {
            return caches.match(`${BASE_PATH}/`);
          }
          return new Response('', { status: 200 });
        });
      })
      .catch(() => {
        return new Response('', { status: 200 });
      })
  );
});
