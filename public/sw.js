// Versão do cache - ATUALIZE ESTE NÚMERO A CADA DEPLOY!
const CACHE_VERSION = '2025-09-30-1304'; // YYYY-MM-DD-vX
const CACHE_NAME = `calendario-bonde-${CACHE_VERSION}`;
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

// URLs para cache estático (sempre em cache)
const staticAssets = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// URLs que devem sempre buscar na rede primeiro
const networkFirstUrls = [
  '/api/',
  '/_next/static/',
  '/home',
  '/perfil',
  '/configuracoes',
  '/notificacoes'
];

// Instalar o service worker
self.addEventListener('install', (event) => {
  console.log(`🔧 SW: Instalando versão ${CACHE_VERSION}`);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 SW: Cachando assets estáticos');
        return cache.addAll(staticAssets);
      })
      .then(() => {
        // Força a ativação imediata do novo service worker
        return self.skipWaiting();
      })
  );
});

// Interceptar requisições de rede
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignora requisições não-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }

  // Estratégia: Network First para recursos dinâmicos
  if (shouldUseNetworkFirst(url)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Estratégia: Cache First para recursos estáticos
  if (shouldUseCacheFirst(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Estratégia padrão: Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// Determina se deve usar Network First
function shouldUseNetworkFirst(url) {
  return networkFirstUrls.some(pattern => url.pathname.startsWith(pattern)) ||
         url.pathname.includes('api') ||
         url.search.includes('timestamp') ||
         url.pathname === '/';
}

// Determina se deve usar Cache First
function shouldUseCacheFirst(url) {
  return url.pathname.startsWith('/icons/') ||
         url.pathname.startsWith('/_next/static/') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.ico');
}

// Estratégia Network First
async function networkFirst(request) {
  try {
    console.log(`🌐 SW: Network First - ${request.url}`);
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log(`❌ SW: Network failed, trying cache - ${request.url}`);
  }
  
  // Fallback para cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Fallback final para offline
  if (request.destination === 'document') {
    return caches.match('/offline');
  }
  
  throw new Error('Network failed and no cache available');
}

// Estratégia Cache First
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log(`📦 SW: Cache Hit - ${request.url}`);
    return cachedResponse;
  }
  
  console.log(`🌐 SW: Cache Miss, fetching - ${request.url}`);
  const networkResponse = await fetch(request);
  
  if (networkResponse && networkResponse.status === 200) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Estratégia Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  // Busca na rede em paralelo
  const networkPromise = fetch(request).then(response => {
    if (response && response.status === 200) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then(c => c.put(request, response.clone()));
    }
    return response;
  }).catch(() => null);
  
  // Retorna cache imediatamente se disponível
  if (cachedResponse) {
    console.log(`⚡ SW: Stale While Revalidate (cache) - ${request.url}`);
    return cachedResponse;
  }
  
  // Senão, espera a rede
  console.log(`⏳ SW: Stale While Revalidate (network) - ${request.url}`);
  return networkPromise;
}

// Atualizar o service worker
self.addEventListener('activate', (event) => {
  console.log(`🚀 SW: Ativando versão ${CACHE_VERSION}`);
  
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log(`🗑️  SW: Deletando cache antigo: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log(`✅ SW: Versão ${CACHE_VERSION} ativa`);
      // Força todos os clientes a usar o novo service worker
      return self.clients.claim();
    })
  );
});

// Evento de mensagem para controle manual
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('💨 SW: Forçando atualização imediata');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('🧹 SW: Limpando todos os caches');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// Notifica clientes sobre atualizações
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION_INFO',
      version: CACHE_VERSION
    });
  }
});