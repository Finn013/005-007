const CACHE_NAME = 'sticky-notes-v6'; // Меняем версию кэша
const urlsToCache = [
  '/005-007/',
  '/005-007/index.html',
  '/005-007/manifest.json',
  '/005-007/icon-192x192.png',
  '/005-007/icon-512x512.png',
  '/005-007/apple-touch-icon.png',
  '/005-007/favicon.ico',
  '/005-007/maskable-icon.png',
  // Добавь сюда пути ко ВСЕМ твоим файлам после сборки (JS, CSS, шрифты)
  // Этот список мы позже сделаем автоматическим
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Установка новой версии');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Кэширование всех файлов приложения');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Активация новой версии');
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
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Игнорируем запросы, которые не являются GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Стратегия "Cache Only". Всегда отвечаем из кэша.
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Ресурс найден в кэше, возвращаем его
          return cachedResponse;
        } else {
          // Ресурса нет в кэше. Возвращаем ошибку.
          // Это предотвращает любые обращения к сети.
          console.warn('Service Worker: Ресурс не найден в кэше:', event.request.url);
          return new Response(
            `Ресурс ${event.request.url} не найден в офлайн-кэше.`,
            { status: 404, statusText: "Not Found in Cache" }
          );
        }
      })
  );
});

// Механизм для принудительного обновления
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FORCE_UPDATE') {
    console.log('Service Worker: Получена команда на принудительное обновление.');
    // Удаляем текущий кэш, чтобы при следующей установке все скачалось заново
    caches.delete(CACHE_NAME).then(() => {
      // Пытаемся обновить сам Service Worker
      self.registration.update().then(registration => {
        // Если есть новый SW, он начнет устанавливаться
        if (registration.installing) {
          console.log('Service Worker: Найдена новая версия, начинается установка.');
        } else if (registration.waiting) {
          console.log('Service Worker: Новая версия уже ожидает, активируем.');
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        } else {
          console.log('Service Worker: Новая версия не найдена на сервере.');
        }
      });
    });
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});