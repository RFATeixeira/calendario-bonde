'use client';

import { useState, useEffect } from 'react';

interface UpdateInfo {
  updateAvailable: boolean;
  currentVersion?: string;
  newVersion?: string;
}

export const useAppUpdate = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
    updateAvailable: false
  });
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Registra o service worker
    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        setRegistration(reg);

        // Verifica atualizações periodicamente
        const checkForUpdate = () => {
          reg.update().catch((error) => {
            console.log('Erro ao verificar atualizações:', error);
          });
        };

        // Verifica a cada 60 segundos
        const interval = setInterval(checkForUpdate, 60000);

        // Verifica imediatamente
        checkForUpdate();

        // Escuta por novos service workers
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateInfo({
                  updateAvailable: true,
                  currentVersion: 'current',
                  newVersion: 'new'
                });
              }
            });
          }
        });

        return () => clearInterval(interval);
      } catch (error) {
        console.error('Erro ao registrar service worker:', error);
      }
    };

    registerSW();

    // Escuta mudanças do controller
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

  }, []);

  const applyUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setUpdateInfo({ updateAvailable: false });
    }
  };

  const dismissUpdate = () => {
    setUpdateInfo({ updateAvailable: false });
  };

  const forceReload = () => {
    // Limpa todos os caches e recarrega
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
        (window as any).location.reload();
      });
    } else if (typeof window !== 'undefined') {
      (window as any).location.reload();
    }
  };

  return {
    ...updateInfo,
    applyUpdate,
    dismissUpdate,
    forceReload
  };
};