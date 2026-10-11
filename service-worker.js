// service-worker.js — Production-ready Service Worker for PWA Offline Support
const CACHE_NAME = 'marefa-game-v1';

// الأصول الأساسية المطلوب تخزينها مؤقتاً فور تثبيت الخدمة
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png'
];

// حدث التثبيت (Install): حفظ الملفات الأساسية وتفعيل الـ Service Worker فوراً
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// حدث التنشيط (Activate): تنظيف النسخ القديمة من الكاش والتفعيل لكافة النوافذ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// حدث جلب البيانات (Fetch): استراتيجية تخزين ذكية حسب نوع الطلب
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // معالجة طلبات GET فقط
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // استثناء طلبات الـ API والمخططات غير التابعة لـ HTTP/HTTPS
  if (url.pathname.startsWith('/api/') || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. طلبات تصفح الصفحات (HTML): Network-First مع العودة للكاش عند انقطاع الإنترنت
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/index.html') || caches.match('/');
          });
        })
    );
    return;
  }

  // 2. الملفات الثابتة (JS, CSS, الصور, الخطوط): Stale-While-Revalidate للسرعة الفائقة
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // في حال عدم توفر اتصال، يتم الاعتماد على الكاش المخزن
        });

      // إرجاع الملف من الكاش فوراً إن وجد، أو انتظار الاتصال بالشبكة
      return cachedResponse || fetchPromise;
    })
  );
});
