'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

export default function ServiceWorkerRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => {
            console.log('✅ SW: Registrado com sucesso');
            setRegistration(reg);

            // Verifica por atualizações a cada 30 segundos
            const interval = setInterval(() => {
              reg.update();
            }, 30000);

            // Escuta por novos service workers
            reg.addEventListener('updatefound', () => {
              console.log('🔄 SW: Nova versão encontrada');
              const newWorker = reg.installing;
              
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('📦 SW: Nova versão instalada, aguardando ativação');
                    setUpdateAvailable(true);
                  }
                });
              }
            });

            return () => clearInterval(interval);
          })
          .catch((error) => {
            console.error('❌ SW: Falha no registro:', error);
          });
      });

      // Escuta mudanças do service worker
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 SW: Controller mudou, recarregando página');
        window.location.reload();
      });

      // Escuta mensagens do service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'VERSION_INFO') {
          console.log(`📱 SW: Versão atual: ${event.data.version}`);
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      console.log('💨 SW: Forçando atualização');
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
    }
  };

  const handleClearCache = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      console.log('🧹 SW: Limpando cache manualmente');
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  if (updateAvailable) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Nova versão disponível!</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleUpdate}
            className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Atualizar
          </button>
          <button
            onClick={() => setUpdateAvailable(false)}
            className="text-white/80 hover:text-white text-sm"
          >
            Depois
          </button>
        </div>
      </div>
    );
  }

  // Botão de desenvolvimento para limpar cache (apenas em dev)
  if (process.env.NODE_ENV === 'development') {
    return (
      <button
        onClick={handleClearCache}
        className="fixed bottom-4 right-4 bg-red-600 text-white p-2 rounded-full shadow-lg z-50"
        title="Limpar Cache (Dev)"
      >
        🧹
      </button>
    );
  }

  return null;
}