
const CACHE_NAME = 'sticky-notes-v4';

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
  `${BASE_PATH}/placeholder.svg`,
];

// Кэшируем динамические ресурсы
const dynamicCacheUrls = [
  /\/assets\/.*\.(js|css|woff2?|svg|png|jpg|jpeg|gif|webp)$/,
  /\/api\//,
  /\/fonts\//
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Установка');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Кэширование файлов');
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(error => {
              console.log(`Не удалось закэшировать ${url}:`, error);
              return null;
            })
          )
        );
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Активация');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Удаление старого кэша', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Игнорируем запросы к расширениям и внешним доменам
  if (event.request.url.includes('chrome-extension://') || 
      event.request.url.includes('retagro.com') ||
      !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Для статических ресурсов используем стратегию cache-first
  if (event.request.url.includes('/assets/')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          });
        })
        .catch(() => {
          return new Response('Asset not available offline', { 
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        })
    );
    return;
  }

  // Для остальных запросов
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then((response) => {
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const shouldCache = dynamicCacheUrls.some(pattern => 
            pattern.test(event.request.url)
          );
          
          if (shouldCache) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }

          return response;
        });
      })
      .catch(() => {
        if (event.request.destination === 'document') {
          return caches.match(`${BASE_PATH}/`) || 
                 caches.match(`${BASE_PATH}/index.html`);
        }
        
        if (event.request.destination === 'image') {
          return caches.match(`${BASE_PATH}/placeholder.svg`);
        }
        
        return new Response('Offline content not available', { 
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Синхронизация в фоне
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Здесь можно добавить логику синхронизации данных
  return Promise.resolve();
}

// Push уведомления (если потребуется)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Новое уведомление',
    icon: `${BASE_PATH}/placeholder.svg`,
    badge: `${BASE_PATH}/placeholder.svg`,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Открыть',
        icon: `${BASE_PATH}/placeholder.svg`
      },
      {
        action: 'close',
        title: 'Закрыть',
        icon: `${BASE_PATH}/placeholder.svg`
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Заметки', options)
  );
});
