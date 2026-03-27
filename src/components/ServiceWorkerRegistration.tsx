'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

export default function ServiceWorkerRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Em desenvolvimento, desativa SW para evitar interferência com login popup.
    if (process.env.NODE_ENV === 'development') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => reg.unregister());
      });
      return;
    }

    let interval: ReturnType<typeof setInterval> | undefined;

    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('✅ SW: Registrado com sucesso');
        setRegistration(reg);

        // Verifica por atualizações a cada 30 segundos
        interval = setInterval(() => {
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
      })
      .catch((error) => {
        console.error('❌ SW: Falha no registro:', error);
      });

    const onControllerChange = () => {
      console.log('🔄 SW: Controller mudou, recarregando página');
      window.location.reload();
    };

    const onMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'VERSION_INFO') {
        console.log(`📱 SW: Versão atual: ${event.data.version}`);
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    navigator.serviceWorker.addEventListener('message', onMessage);

    return () => {
      if (interval) clearInterval(interval);
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      navigator.serviceWorker.removeEventListener('message', onMessage);
    };
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      console.log('💨 SW: Forçando atualização');
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
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

  return null;
}