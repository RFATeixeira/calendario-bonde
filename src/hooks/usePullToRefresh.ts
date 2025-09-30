'use client';

import { useState, useEffect, useCallback } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number; // Porcentagem da tela para ativar o refresh (padrão: 40%)
  resistance?: number; // Resistência do arrasto (padrão: 2.5)
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 40,
  resistance = 2.5
}: UsePullToRefreshOptions) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  // Calcula a distância máxima baseada na porcentagem da tela
  const maxPullDistance = (window.innerHeight * threshold) / 100;
  const shouldRefresh = pullDistance >= maxPullDistance;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Só inicia o pull se estiver no topo da página
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || window.scrollY > 0) return;

    const touchY = e.touches[0].clientY;
    setCurrentY(touchY);

    const rawDistance = touchY - startY;
    
    // Só permite arrastar para baixo
    if (rawDistance > 0) {
      // Aplica resistência para tornar o arrasto mais natural
      const distance = rawDistance / resistance;
      setPullDistance(Math.max(0, Math.min(distance, maxPullDistance * 1.2)));
      
      // Previne o scroll nativo quando está puxando
      e.preventDefault();
    }
  }, [isPulling, startY, resistance, maxPullDistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;

    setIsPulling(false);

    if (shouldRefresh && !isRefreshing) {
      setIsRefreshing(true);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Erro durante o refresh:', error);
      } finally {
        // Animação de retorno
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      }
    } else {
      // Retorna à posição inicial se não atingiu o threshold
      setPullDistance(0);
    }

    setStartY(0);
    setCurrentY(0);
  }, [isPulling, shouldRefresh, isRefreshing, onRefresh]);

  useEffect(() => {
    const element = document.body;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isPulling,
    isRefreshing,
    pullDistance,
    shouldRefresh,
    pullProgress: Math.min((pullDistance / maxPullDistance) * 100, 100)
  };
};